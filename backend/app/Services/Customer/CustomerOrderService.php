<?php

namespace App\Services\Customer;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Services\Promotions\PromotionEngine;
use App\Models\OrderPromotion;
use Carbon\Carbon;

class CustomerOrderService
{
    public function getCustomerOrders($customerId)
    {
        return Order::where('customer_id', $customerId)
            ->with(['items.product'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getCustomerOrderDetail($customerId, $id)
    {
        return Order::where('customer_id', $customerId)
            ->with(['items.product', 'invoice'])
            ->findOrFail($id);
    }

    public function storeOrder($customer, array $data)
    {
        return DB::transaction(function () use ($customer, $data) {
            $subtotal = 0;
            $orderItemsData = [];

            foreach ($data['items'] as $itemData) {
                // Fetch product with lock for update to prevent race conditions on inventory check
                $product = Product::lockForUpdate()->findOrFail($itemData['product_id']);

                if ($product->status !== 'ACTIVE' || !$product->recipe_configured || !$product->inventory_available) {
                    throw ValidationException::withMessages([
                        'items' => ["Sản phẩm '{$product->name}' hiện không thể đặt hàng (chưa cấu hình hoặc hết nguyên liệu)."],
                    ]);
                }

                if ($itemData['quantity'] > $product->max_producible_quantity) {
                    throw ValidationException::withMessages([
                        'items' => ["Sản phẩm '{$product->name}' chỉ còn tối đa {$product->max_producible_quantity} phần."],
                    ]);
                }

                $lineTotal = $product->price * $itemData['quantity'];
                $subtotal += $lineTotal;

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $itemData['quantity'],
                    'line_total' => $lineTotal,
                    'note' => $itemData['note'] ?? null,
                ];
            }

            if (isset($data['promotion_code']) && isset($data['customer_voucher_id'])) {
                throw ValidationException::withMessages([
                    'customer_voucher_id' => ["Bạn chỉ có thể sử dụng một ưu đãi (Mã khuyến mãi hoặc Voucher) cho mỗi đơn hàng."],
                ]);
            }

            $customerVoucher = null;
            $promotionCode = $data['promotion_code'] ?? null;

            if (isset($data['customer_voucher_id'])) {
                $customerVoucher = \App\Models\CustomerVoucher::where('id', $data['customer_voucher_id'])
                    ->where('customer_id', $customer->id)
                    ->lockForUpdate()
                    ->first();

                if (!$customerVoucher) {
                    throw ValidationException::withMessages([
                        'customer_voucher_id' => ["Voucher không tồn tại hoặc không thuộc về bạn."],
                    ]);
                }

                if (!$customerVoucher->isUsable()) {
                    throw ValidationException::withMessages([
                        'customer_voucher_id' => ["Voucher này đã được sử dụng, thu hồi hoặc đã hết hạn."],
                    ]);
                }
                
                // Get promotion code from voucher's promotion
                $promotionCode = $customerVoucher->promotion->promotion_code;
            }

            $engine = app(PromotionEngine::class);
            $payload = collect($orderItemsData)->map(function ($item) {
                return [
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity']
                ];
            })->toArray();

            $result = $engine->calculate($payload, $promotionCode);

            $order = Order::create([
                'order_code' => 'ORD' . strtoupper(uniqid()),
                'customer_type' => 'MEMBER',
                'customer_id' => $customer->id,
                'customer_name' => $customer->full_name,
                'customer_phone' => $customer->phone,
                'order_type' => 'TAKEAWAY',
                'source' => 'CUSTOMER',
                'table_id' => null,
                'staff_id' => null,
                'status' => 'PENDING',
                'subtotal' => $result['subtotal'],
                'discount_amount' => $result['discount_amount'],
                'total_amount' => $result['total_amount'],
                'promotion_code' => $result['promotion'] ? $result['promotion']['promotion_code'] : null,
                'customer_voucher_id' => $customerVoucher ? $customerVoucher->id : null,
                'note' => $data['note'] ?? null,
            ]);

            foreach ($orderItemsData as $idx => $itemData) {
                $itemResult = $result['items'][$idx];
                $itemData['order_id'] = $order->id;
                $itemData['discount_amount'] = $itemResult['discount_amount'];
                $itemData['final_line_total'] = $itemResult['final_line_total'];
                OrderItem::create($itemData);
            }

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
                
                if ($customerVoucher) {
                    $customerVoucher->update([
                        'status' => 'RESERVED',
                        'used_order_id' => $order->id,
                        'used_at' => Carbon::now(),
                    ]);
                }
            }

            return $order->load('items');
        });
    }

    public function cancelOrder($customerId, $id)
    {
        return DB::transaction(function () use ($customerId, $id) {
            $order = Order::where('customer_id', $customerId)->lockForUpdate()->findOrFail($id);

            if ($order->status !== 'PENDING') {
                abort(409, 'Không thể hủy đơn hàng đã được xác nhận.');
            }

            $order->update([
                'status' => 'CANCELLED',
                'cancelled_at' => now(),
                'cancel_reason' => 'Khách hàng tự hủy',
            ]);

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
}
