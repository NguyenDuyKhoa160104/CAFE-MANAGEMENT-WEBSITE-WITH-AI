<?php

namespace App\Services\Staff;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CafeTable;
use App\Models\Product;
use App\Services\Inventory\InventoryConsumptionService;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Carbon\Carbon;
use App\Services\Promotions\PromotionEngine;
use App\Models\OrderPromotion;

class StaffOrderService
{
    public function paginate($request)
    {
        $query = Order::with(['table.area', 'staff']);

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('order_code', 'like', '%' . $request->search . '%')
                  ->orWhere('customer_name', 'like', '%' . $request->search . '%')
                  ->orWhere('customer_phone', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('order_type')) {
            $query->where('order_type', $request->order_type);
        }
        
        if ($request->has('table_id')) {
            $query->where('table_id', $request->table_id);
        }

        if ($request->has('customer_type')) {
            $query->where('customer_type', $request->customer_type);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $sort = $request->get('sort', 'desc');
        $query->orderBy('created_at', $sort);

        return $query->paginate($request->get('per_page', 15));
    }

    public function findById($id)
    {
        return Order::with(['table.area', 'staff', 'items'])->findOrFail($id);
    }

    public function createOrder($data, $staffId)
    {
        return DB::transaction(function () use ($data, $staffId) {
            $table = null;

            if ($data['order_type'] === 'DINE_IN') {
                if (empty($data['table_id'])) {
                    throw new HttpException(422, 'Bàn là bắt buộc đối với đơn ăn tại chỗ.');
                }

                $table = CafeTable::where('id', $data['table_id'])->lockForUpdate()->first();
                if (!$table) {
                    throw new HttpException(404, 'Bàn không tồn tại.');
                }
                if ($table->status === 'INACTIVE') {
                    throw new HttpException(422, 'Bàn đang không hoạt động.');
                }
                if ($table->status === 'RESERVED') {
                    throw new HttpException(422, 'Bàn đang được đặt trước.');
                }

                $activeOrder = Order::where('table_id', $table->id)
                    ->whereNotIn('status', ['COMPLETED', 'CANCELLED'])
                    ->first();

                if ($activeOrder) {
                    throw new HttpException(409, 'Bàn này đang có đơn hàng chưa hoàn tất.');
                }
            }

            $order = new Order();
            // Generate dummy code, then update after save
            $order->order_code = 'TMP-' . time();
            $order->table_id = $data['order_type'] === 'DINE_IN' ? $data['table_id'] : null;
            $order->staff_id = $staffId;
            $order->customer_type = $data['customer_type'] ?? 'WALK_IN';
            $order->customer_id = $data['customer_id'] ?? null;
            $order->customer_name = $data['customer_name'] ?? null;
            $order->customer_phone = $data['customer_phone'] ?? null;
            $order->order_type = $data['order_type'];
            $order->source = 'STAFF'; // Forced
            $order->status = 'PENDING';
            $order->note = $data['note'] ?? null;
            $order->save();

            // Generate real order code based on ID
            $order->order_code = 'ORD-' . date('Ymd') . '-' . str_pad($order->id, 6, '0', STR_PAD_LEFT);
            $order->save();

            if (!empty($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $itemData) {
                    $this->createItemRecord($order, $itemData);
                }
                $this->recalculateTotals($order, $data['promotion_code'] ?? null);
            }

            if ($data['order_type'] === 'DINE_IN' && $table) {
                $table->status = 'OCCUPIED';
                $table->save();
            }

            return $order->load(['table', 'items']);
        });
    }

    public function updateOrder($order, $data)
    {
        $allowedFields = ['customer_type', 'customer_id', 'customer_name', 'customer_phone', 'note'];
        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $order->$field = $data[$field];
            }
        }
        $order->save();
        return $order;
    }

    private function createItemRecord($order, $itemData)
    {
        $product = Product::where('id', $itemData['product_id'])->first();
        if (!$product) {
            throw new HttpException(404, 'Sản phẩm không tồn tại.');
        }
        if ($product->status === 'INACTIVE') {
            throw new HttpException(422, 'Sản phẩm đang ngừng bán.');
        }
        
        // Retain OUT_OF_STOCK compatibility, though it shouldn't be auto-set anymore
        if ($product->status === 'OUT_OF_STOCK') {
            throw new HttpException(422, 'Sản phẩm đã hết hàng.');
        }
        
        // Check new availability fields
        if (!$product->recipe_configured) {
            throw new HttpException(422, "Sản phẩm '{$product->name}' chưa được cấu hình công thức.");
        }
        
        if (!$product->inventory_available) {
            throw new HttpException(422, "Sản phẩm '{$product->name}' hiện không đủ nguyên liệu để bán.");
        }

        $quantity = $itemData['quantity'] ?? 1;
        
        $item = new OrderItem();
        $item->order_id = $order->id;
        $item->product_id = $product->id;
        $item->product_name = $product->name;
        $item->unit_price = $product->price;
        $item->quantity = $quantity;
        $item->line_total = $product->price * $quantity;
        $item->discount_amount = 0;
        $item->final_line_total = $item->line_total;
        $item->note = $itemData['note'] ?? null;
        $item->save();

        return $item;
    }

    public function addItem($order, $data)
    {
        if (!in_array($order->status, ['PENDING', 'CONFIRMED'])) {
            throw new HttpException(422, 'Không thể thêm món. Đơn hàng đã bắt đầu chế biến hoặc đã hoàn tất/hủy.');
        }

        return DB::transaction(function () use ($order, $data) {
            $product = Product::findOrFail($data['product_id']);
            
            if ($product->status === 'INACTIVE' || $product->status === 'OUT_OF_STOCK') {
                throw new HttpException(422, 'Sản phẩm đang ngừng bán hoặc hết hàng.');
            }
            if (!$product->recipe_configured) {
                throw new HttpException(422, "Sản phẩm '{$product->name}' chưa được cấu hình công thức.");
            }
            if (!$product->inventory_available) {
                throw new HttpException(422, "Sản phẩm '{$product->name}' hiện không đủ nguyên liệu để bán.");
            }

            $quantity = $data['quantity'] ?? 1;
            $note = $data['note'] ?? null;

            // Check if same product with same note exists
            $existingItem = OrderItem::where('order_id', $order->id)
                ->where('product_id', $product->id)
                ->where('note', $note)
                ->first();

            if ($existingItem) {
                $existingItem->quantity += $quantity;
                $existingItem->line_total = $existingItem->unit_price * $existingItem->quantity;
                $existingItem->save();
            } else {
                $this->createItemRecord($order, $data);
            }

            $this->recalculateTotals($order, $order->promotion_code);
            
            return $order->load('items');
        });
    }

    public function updateItem($order, $itemId, $data)
    {
        if (!in_array($order->status, ['PENDING', 'CONFIRMED'])) {
            throw new HttpException(422, 'Không thể sửa món. Đơn hàng đã bắt đầu chế biến hoặc đã hoàn tất/hủy.');
        }

        return DB::transaction(function () use ($order, $itemId, $data) {
            $item = OrderItem::with('product')->where('order_id', $order->id)->findOrFail($itemId);
            $product = $item->product;

            if ($product) {
                if ($product->status === 'INACTIVE' || $product->status === 'OUT_OF_STOCK') {
                    throw new HttpException(422, 'Sản phẩm đang ngừng bán hoặc hết hàng.');
                }
                if (!$product->recipe_configured) {
                    throw new HttpException(422, "Sản phẩm '{$product->name}' chưa được cấu hình công thức.");
                }
                if (!$product->inventory_available) {
                    throw new HttpException(422, "Sản phẩm '{$product->name}' hiện không đủ nguyên liệu để bán.");
                }
            }

            if (isset($data['quantity'])) {
                $item->quantity = $data['quantity'];
                $item->line_total = $item->unit_price * $item->quantity;
            }
            if (array_key_exists('note', $data)) {
                $item->note = $data['note'];
            }
            $item->save();

            $this->recalculateTotals($order, $order->promotion_code);

            return $order->load('items');
        });
    }

    public function removeItem($order, $itemId)
    {
        if (!in_array($order->status, ['PENDING', 'CONFIRMED'])) {
            throw new HttpException(422, 'Không thể xóa món. Đơn hàng đã bắt đầu chế biến hoặc đã hoàn tất/hủy.');
        }

        return DB::transaction(function () use ($order, $itemId) {
            $item = OrderItem::where('order_id', $order->id)->findOrFail($itemId);
            $item->delete();

            $this->recalculateTotals($order, $order->promotion_code);

            return $order->load('items');
        });
    }

    public function updateStatus($order, $newStatus)
    {
        $validTransitions = [
            'PENDING' => ['CONFIRMED', 'CANCELLED'],
            'CONFIRMED' => ['PREPARING', 'CANCELLED'],
            'PREPARING' => ['READY'], // Cannot cancel from PREPARING anymore
            'READY' => ['SERVED'],
            'SERVED' => [], // Cannot go to COMPLETED via this API, must use checkout
            'COMPLETED' => [],
            'CANCELLED' => [],
        ];

        if (!in_array($newStatus, $validTransitions[$order->status])) {
            throw new HttpException(409, "Không thể chuyển trạng thái từ {$order->status} sang {$newStatus}.");
        }

        return DB::transaction(function () use ($order, $newStatus) {
            // Lock the order before transition
            $lockedOrder = Order::lockForUpdate()->find($order->id);
            
            if ($lockedOrder->status !== $order->status) {
                throw new HttpException(409, 'Trạng thái đơn hàng đã bị thay đổi bởi người khác.');
            }

            // Inventory consumption on CONFIRMED -> PREPARING
            if ($lockedOrder->status === 'CONFIRMED' && $newStatus === 'PREPARING') {
                $inventoryService = app(InventoryConsumptionService::class);
                $inventoryService->consumeForOrder($lockedOrder, request()->user() ? request()->user()->id : null);
                
                // Mark voucher as USED
                if ($lockedOrder->customer_voucher_id) {
                    \App\Models\CustomerVoucher::where('id', $lockedOrder->customer_voucher_id)
                        ->update(['status' => 'USED']);
                    
                    // Increment promotion used count
                    $op = \App\Models\OrderPromotion::where('order_id', $lockedOrder->id)->first();
                    if ($op && $op->promotion_id) {
                        \App\Models\Promotion::where('id', $op->promotion_id)->increment('used_count');
                    }
                }
            }

            $lockedOrder->status = $newStatus;
            $lockedOrder->save();

            if ($newStatus === 'COMPLETED') {
                $this->freeTableIfNoActiveOrders($lockedOrder);
            }

            return $lockedOrder->load('items');
        });
    }

    public function cancelOrder($order, $reason = null)
    {
        if (!in_array($order->status, ['PENDING', 'CONFIRMED'])) {
            throw new HttpException(409, 'Chỉ có thể hủy đơn khi ở trạng thái PENDING hoặc CONFIRMED.');
        }

        return DB::transaction(function () use ($order, $reason) {
            $order->status = 'CANCELLED';
            $order->cancel_reason = $reason;
            $order->cancelled_at = Carbon::now();
            $order->save();

            $this->freeTableIfNoActiveOrders($order);
            
            // Release voucher
            if ($order->customer_voucher_id) {
                \App\Models\CustomerVoucher::where('id', $order->customer_voucher_id)
                    ->update([
                        'status' => 'UNUSED',
                        'used_order_id' => null,
                        'used_at' => null
                    ]);
            }

            return $order;
        });
    }

    private function freeTableIfNoActiveOrders($order)
    {
        if ($order->order_type === 'DINE_IN' && $order->table_id) {
            $table = CafeTable::where('id', $order->table_id)->lockForUpdate()->first();
            if ($table && !in_array($table->status, ['INACTIVE'])) { // Don't override INACTIVE
                $activeOrderExists = Order::where('table_id', $table->id)
                    ->whereNotIn('status', ['COMPLETED', 'CANCELLED'])
                    ->exists();
                
                if (!$activeOrderExists) {
                    $table->status = 'AVAILABLE';
                    $table->save();
                }
            }
        }
    }

    public function recalculateTotals($order, $promotionCode = null)
    {
        $engine = app(PromotionEngine::class);
        $items = OrderItem::where('order_id', $order->id)->get();
        
        $payload = $items->map(function ($item) {
            return [
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
            ];
        })->toArray();

        try {
            // Apply code if provided, otherwise auto
            $result = $engine->calculate($payload, $promotionCode);
        } catch (\Exception $e) {
            // If code is invalid during recalculation, fallback to AUTO or clear it
            if ($promotionCode) {
                // Try fallback to auto
                $result = $engine->calculate($payload, null);
                // Can log or set a message here
            } else {
                throw $e;
            }
        }

        $order->subtotal = $result['subtotal'];
        $order->discount_amount = $result['discount_amount'];
        $order->total_amount = $result['total_amount'];
        $order->promotion_code = $result['promotion'] ? $result['promotion']['promotion_code'] : null;
        $order->save();

        // Update items with their specific discounts
        foreach ($items as $idx => $item) {
            $itemResult = $result['items'][$idx];
            $item->unit_price = $itemResult['base_price'];
            $item->line_total = $itemResult['line_total'];
            $item->discount_amount = $itemResult['discount_amount'];
            $item->final_line_total = $itemResult['final_line_total'];
            $item->save();
        }

        // Manage OrderPromotion snapshot
        OrderPromotion::where('order_id', $order->id)->delete();
        
        if ($result['promotion']) {
            OrderPromotion::create([
                'order_id' => $order->id,
                'promotion_id' => $result['promotion']['id'],
                'promotion_code' => $result['promotion']['promotion_code'],
                'promotion_name' => $result['promotion']['name'],
                'application_mode' => $result['promotion']['application_mode'],
                'discount_type' => $result['promotion']['discount_type'],
                'scope' => $result['promotion']['scope'],
                'discount_value' => $result['promotion']['discount_value'],
                'discount_amount' => $result['discount_amount'],
                'snapshot' => json_encode($result['promotion']),
                'applied_at' => Carbon::now(),
            ]);
        }
    }
}
