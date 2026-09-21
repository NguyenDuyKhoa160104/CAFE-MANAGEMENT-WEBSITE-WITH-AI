<?php

namespace App\Services\Admin;

use App\Models\Product;
use App\Models\ProductIngredient;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Support\Facades\DB;

class AdminRecipeService
{
    public function getProductRecipe($productId)
    {
        $product = Product::with(['productIngredients.ingredient'])->find($productId);
        
        if (!$product) {
            throw new HttpException(404, 'Sản phẩm không tồn tại.');
        }

        $cost = $this->calculateRecipeCost($product);

        return [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'track_inventory' => $product->track_inventory,
            'estimated_cost' => $cost,
            'inventory_available' => $product->inventory_available,
            'max_producible_quantity' => $product->max_producible_quantity,
            'ingredients' => $product->productIngredients->map(function ($pi) {
                return [
                    'ingredient_id' => $pi->ingredient_id,
                    'ingredient_name' => $pi->ingredient->name ?? 'N/A',
                    'unit' => $pi->ingredient->unit ?? 'N/A',
                    'quantity_required' => $pi->quantity_required,
                    'average_cost' => $pi->ingredient->average_cost ?? 0,
                    'line_cost' => ($pi->ingredient->average_cost ?? 0) * $pi->quantity_required
                ];
            })
        ];
    }

    public function updateProductRecipe($productId, array $data)
    {
        return DB::transaction(function () use ($productId, $data) {
            $product = Product::find($productId);
            if (!$product) {
                throw new HttpException(404, 'Sản phẩm không tồn tại.');
            }

            $product->track_inventory = $data['track_inventory'];
            $product->save();

            // Clear old recipe
            ProductIngredient::where('product_id', $productId)->delete();

            // Insert new if track_inventory is true
            if ($data['track_inventory'] && !empty($data['ingredients'])) {
                foreach ($data['ingredients'] as $item) {
                    ProductIngredient::create([
                        'product_id' => $productId,
                        'ingredient_id' => $item['ingredient_id'],
                        'quantity_required' => $item['quantity_required'],
                    ]);
                }
            }

            // Recalculate product availability
            app(\App\Services\Inventory\ProductAvailabilityService::class)->recalculateProduct($productId);

            return $this->getProductRecipe($productId);
        });
    }

    private function calculateRecipeCost(Product $product)
    {
        $cost = 0;
        foreach ($product->productIngredients as $pi) {
            if ($pi->ingredient) {
                $cost += $pi->ingredient->average_cost * $pi->quantity_required;
            }
        }
        return $cost;
    }
}
