<?php

namespace App\Services\Inventory;

use App\Models\Order;
use App\Models\Ingredient;
use App\Models\InventoryTransaction;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class InventoryConsumptionService
{
    /**
     * Consume inventory for an order.
     * This method MUST be called within a database transaction from the caller (e.g., StaffOrderService).
     *
     * @param Order $order
     * @param int|null $staffId
     * @throws HttpException
     */
    public function consumeForOrder(Order $order, $staffId = null)
    {
        // Prevent double consumption
        if ($order->inventory_consumed_at !== null) {
            return;
        }
        
        // Double check transaction explicitly if needed, but inventory_consumed_at is our main guard
        $hasConsumption = InventoryTransaction::where('reference_type', 'ORDER')
                            ->where('reference_id', $order->id)
                            ->where('type', 'ORDER_CONSUMPTION')
                            ->exists();
                            
        if ($hasConsumption) {
            $order->inventory_consumed_at = now();
            $order->save();
            return;
        }

        // Aggregate total required ingredients
        $aggregatedIngredients = [];
        
        $orderItems = $order->items()->with('product.productIngredients')->get();
        
        foreach ($orderItems as $item) {
            $product = $item->product;
            
            // Skip products that don't track inventory
            if (!$product || !$product->track_inventory) {
                continue;
            }
            
            $recipeItems = $product->productIngredients;
            
            // If tracking inventory is true but no recipe is configured, reject
            if ($recipeItems->isEmpty()) {
                throw new HttpException(409, "Sản phẩm '{$product->name}' chưa được cấu hình công thức kho.");
            }
            
            foreach ($recipeItems as $recipeItem) {
                $ingredientId = $recipeItem->ingredient_id;
                $qtyNeeded = $recipeItem->quantity_required * $item->quantity;
                
                if (!isset($aggregatedIngredients[$ingredientId])) {
                    $aggregatedIngredients[$ingredientId] = 0;
                }
                
                $aggregatedIngredients[$ingredientId] += $qtyNeeded;
            }
        }
        
        if (empty($aggregatedIngredients)) {
            // No ingredients to consume (e.g., all products are track_inventory = false)
            $order->inventory_consumed_at = now();
            $order->save();
            return;
        }
        
        // Lock ingredients in order of their IDs to prevent deadlock
        $ingredientIds = array_keys($aggregatedIngredients);
        sort($ingredientIds); // Sort ascending
        
        $ingredients = Ingredient::whereIn('id', $ingredientIds)->lockForUpdate()->get()->keyBy('id');
        
        $errors = [];
        
        // Validation check
        foreach ($aggregatedIngredients as $ingredientId => $totalNeeded) {
            $ingredient = $ingredients->get($ingredientId);
            
            if (!$ingredient) {
                throw new HttpException(409, "Một nguyên liệu trong công thức không còn tồn tại.");
            }
            
            if ($ingredient->current_stock < $totalNeeded) {
                $unit = $ingredient->unit;
                $errors[] = "Không đủ tồn kho: {$ingredient->name} cần {$totalNeeded} {$unit}, hiện còn {$ingredient->current_stock} {$unit}.";
            }
        }
        
        if (!empty($errors)) {
            throw new HttpException(409, implode(' ', $errors));
        }
        
        // Perform consumption
        foreach ($aggregatedIngredients as $ingredientId => $totalNeeded) {
            $ingredient = $ingredients->get($ingredientId);
            
            $balanceBefore = $ingredient->current_stock;
            $ingredient->current_stock -= $totalNeeded;
            $balanceAfter = $ingredient->current_stock;
            
            // Double check no negative stock
            if ($ingredient->current_stock < 0) {
                 throw new HttpException(409, "Lỗi trừ kho: {$ingredient->name} bị âm tồn kho.");
            }
            
            $ingredient->save();
            
            InventoryTransaction::create([
                'transaction_code' => 'TXN-' . date('YmdHis') . '-' . strtoupper(substr(uniqid(), -4)) . '-' . $ingredientId,
                'ingredient_id' => $ingredientId,
                'type' => 'ORDER_CONSUMPTION',
                'quantity_change' => -$totalNeeded,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'reference_type' => 'ORDER',
                'reference_id' => $order->id,
                'staff_id' => $staffId,
                'admin_id' => null,
                'note' => "Xuất nguyên liệu cho đơn {$order->order_code}"
            ]);
        }
        
        $order->inventory_consumed_at = now();
        $order->save();

        // Recalculate affected products
        $availabilityService = app(\App\Services\Inventory\ProductAvailabilityService::class);
        foreach ($ingredientIds as $ingredientId) {
            $availabilityService->recalculateProductsUsingIngredient($ingredientId);
        }
    }
}
