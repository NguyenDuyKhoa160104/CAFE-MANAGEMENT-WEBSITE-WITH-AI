<?php

namespace App\Services\Inventory;

use App\Models\Product;
use App\Models\ProductIngredient;
use App\Models\Ingredient;
use Illuminate\Support\Facades\Log;

class ProductAvailabilityService
{
    /**
     * Recalculate and update the derived availability fields for a single Product.
     */
    public function calculateForProduct(Product $product): void
    {
        // 1. Check if the product has a configured recipe
        $recipeCount = $product->productIngredients()->count();
        if ($recipeCount === 0) {
            $product->update([
                'recipe_configured' => false,
                'inventory_available' => false,
                'max_producible_quantity' => 0,
            ]);
            return;
        }

        // 2. Load product ingredients with their related ingredient
        $ingredients = $product->productIngredients()->with('ingredient')->get();

        $maxProducible = null;

        foreach ($ingredients as $item) {
            $ingredient = $item->ingredient;
            
            // If the ingredient is somehow deleted or inactive, we treat stock as 0
            $currentStock = ($ingredient && $ingredient->status === 'ACTIVE') ? (float)$ingredient->current_stock : 0;
            $quantityRequired = (float)$item->quantity_required;

            if ($quantityRequired <= 0) {
                continue; // Prevent division by zero
            }

            // Calculate floor(current_stock / quantity_required)
            $possibleItems = floor($currentStock / $quantityRequired);

            // The max producible is the MIN of all possible items for each ingredient
            if ($maxProducible === null || $possibleItems < $maxProducible) {
                $maxProducible = $possibleItems;
            }
        }

        if ($maxProducible === null) {
            $maxProducible = 0;
        }

        // 3. Update the cached fields
        $product->update([
            'recipe_configured' => true,
            'inventory_available' => $maxProducible > 0,
            'max_producible_quantity' => (int) $maxProducible,
        ]);
    }

    /**
     * Recalculate a specific product by its ID.
     */
    public function recalculateProduct(int $productId): void
    {
        $product = Product::find($productId);
        if ($product) {
            $this->calculateForProduct($product);
        }
    }

    /**
     * Recalculate all products that use a specific ingredient.
     */
    public function recalculateProductsUsingIngredient(int $ingredientId): void
    {
        $productIds = ProductIngredient::where('ingredient_id', $ingredientId)
            ->pluck('product_id')
            ->unique()
            ->toArray();

        $this->recalculateProducts($productIds);
    }

    /**
     * Recalculate an array of product IDs.
     * Use this to batch recalculate efficiently without duplicating work.
     */
    public function recalculateProducts(array $productIds): void
    {
        // Ensure uniqueness
        $productIds = array_unique($productIds);

        foreach ($productIds as $productId) {
            $this->recalculateProduct($productId);
        }
    }
}
