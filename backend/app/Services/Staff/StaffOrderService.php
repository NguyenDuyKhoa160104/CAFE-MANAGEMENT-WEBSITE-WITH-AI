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
                $this->recalculateTotals($order);
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

            $this->recalculateTotals($order);
            
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

            $this->recalculateTotals($order);

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

            $this->recalculateTotals($order);

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

    public function recalculateTotals($order)
    {
        $subtotal = OrderItem::where('order_id', $order->id)->sum('line_total');
        
        $order->subtotal = $subtotal;
        $order->total_amount = max($subtotal - $order->discount_amount, 0);
        $order->save();
    }
}
