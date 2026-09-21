<?php

namespace App\Services\Staff;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\CafeTable;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Carbon\Carbon;
use Illuminate\Support\Str;

class StaffCheckoutService
{
    public function checkout($orderId, $staffId, array $data)
    {
        return DB::transaction(function () use ($orderId, $staffId, $data) {
            // 1. Lock Order
            $order = Order::lockForUpdate()->find($orderId);
            
            if (!$order) {
                throw new HttpException(404, 'Đơn hàng không tồn tại.');
            }

            // 2. Confirm status = SERVED
            if ($order->status !== 'SERVED') {
                throw new HttpException(422, 'Chỉ có thể thanh toán khi đơn hàng đã được phục vụ (SERVED).');
            }

            // 3. Confirm có items
            if ($order->items()->count() === 0) {
                throw new HttpException(422, 'Đơn hàng chưa có sản phẩm nào.');
            }

            // 4. Confirm chưa Payment SUCCESS
            $existingPayment = Payment::where('order_id', $order->id)->where('status', 'SUCCESS')->first();
            if ($existingPayment) {
                throw new HttpException(409, 'Đơn hàng đã được thanh toán.');
            }

            // 5. Confirm chưa Invoice
            $existingInvoice = Invoice::where('order_id', $order->id)->first();
            if ($existingInvoice) {
                throw new HttpException(409, 'Đơn hàng đã được xuất hóa đơn.');
            }

            $amount = $order->total_amount;

            // 6. Create Payment
            $paymentCode = 'PAY-' . strtoupper(Str::random(8));
            $payment = Payment::create([
                'payment_code' => $paymentCode,
                'order_id' => $order->id,
                'staff_id' => $staffId,
                'payment_method' => $data['payment_method'],
                'amount' => $amount,
                'status' => 'SUCCESS',
                'paid_at' => Carbon::now(),
                'transaction_reference' => $data['transaction_reference'] ?? null,
                'note' => $data['note'] ?? null,
            ]);

            // 7. Create Invoice
            $invoiceCode = 'INV-' . date('Ymd') . '-' . str_pad($order->id, 6, '0', STR_PAD_LEFT);
            $invoice = Invoice::create([
                'invoice_code' => $invoiceCode,
                'order_id' => $order->id,
                'payment_id' => $payment->id,
                'staff_id' => $staffId,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'subtotal' => $order->subtotal,
                'discount_amount' => $order->discount_amount,
                'total_amount' => $order->total_amount,
                'payment_method' => $data['payment_method'],
                'issued_at' => Carbon::now(),
            ]);

            // 8. Order -> COMPLETED
            $order->status = 'COMPLETED';
            $order->save();

            // 9. Free Table if DINE_IN
            if ($order->order_type === 'DINE_IN' && $order->table_id) {
                $table = CafeTable::where('id', $order->table_id)->lockForUpdate()->first();
                if ($table && !in_array($table->status, ['INACTIVE'])) {
                    $activeOrderExists = Order::where('table_id', $table->id)
                        ->whereNotIn('status', ['COMPLETED', 'CANCELLED'])
                        ->exists();
                    
                    if (!$activeOrderExists) {
                        $table->status = 'AVAILABLE';
                        $table->save();
                    }
                }
            }

            return [
                'order' => $order,
                'payment' => $payment,
                'invoice' => $invoice,
            ];
        });
    }
}
