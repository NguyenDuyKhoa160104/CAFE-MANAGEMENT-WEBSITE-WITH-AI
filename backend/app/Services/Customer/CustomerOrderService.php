<?php

namespace App\Services\Customer;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
                'subtotal' => $subtotal,
                'discount_amount' => 0, // No discount logic applied yet for customer web
                'total_amount' => $subtotal,
                'note' => $data['note'] ?? null,
            ]);

            foreach ($orderItemsData as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            return $order->load('items');
        });
    }

    public function cancelOrder($customerId, $id)
    {
        $order = Order::where('customer_id', $customerId)->findOrFail($id);

        if ($order->status !== 'PENDING') {
            abort(409, 'Không thể hủy đơn hàng đã được xác nhận.');
        }

        $order->update([
            'status' => 'CANCELLED',
            'cancelled_at' => now(),
            'cancel_reason' => 'Khách hàng tự hủy',
        ]);

        return $order;
    }
}
