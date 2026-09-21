<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CafeTable;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Staff;
use Illuminate\Support\Str;

class DevelopmentOrderSeeder extends Seeder
{
    public function run()
    {
        $staff = Staff::where('status', 'ACTIVE')->first();
        if (!$staff) return;

        $products = Product::where('status', 'ACTIVE')->take(5)->get();
        if ($products->isEmpty()) return;

        $occupiedTables = CafeTable::where('status', 'OCCUPIED')->get();

        foreach ($occupiedTables as $table) {
            $activeOrder = Order::where('table_id', $table->id)
                ->whereNotIn('status', ['COMPLETED', 'CANCELLED'])
                ->first();

            if (!$activeOrder) {
                $orderCode = 'ORD-' . strtoupper(Str::random(8));
                
                $order = Order::create([
                    'order_code' => $orderCode,
                    'order_type' => 'DINE_IN',
                    'table_id' => $table->id,
                    'customer_type' => 'WALK_IN',
                    'customer_name' => 'Khách tại ' . $table->name,
                    'staff_id' => $staff->id,
                    'status' => $table->id == 3 ? 'PREPARING' : 'READY',
                    'source' => 'STAFF',
                    'subtotal' => 0,
                    'discount_amount' => 0,
                    'total_amount' => 0,
                ]);

                $subtotal = 0;
                
                // Add 2 random items
                $itemsToAdd = $products->random(2);
                foreach ($itemsToAdd as $product) {
                    $qty = rand(1, 3);
                    $lineTotal = $product->price * $qty;
                    $subtotal += $lineTotal;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'unit_price' => $product->price,
                        'quantity' => $qty,
                        'line_total' => $lineTotal,
                    ]);
                }

                $order->update([
                    'subtotal' => $subtotal,
                    'total_amount' => $subtotal,
                ]);
            }
        }
    }
}
