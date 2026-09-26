<?php

namespace App\Services\Staff;

use App\Models\Category;
use App\Models\Product;

class StaffMenuService
{
    /**
     * Get active categories
     */
    public function getCategories()
    {
        return Category::where('status', 'ACTIVE')
            ->orderBy('sort_order', 'asc')
            ->get();
    }

    /**
     * Get products
     */
    public function getProducts($request)
    {
        $query = Product::with(['category', 'productIngredients.ingredient'])
            ->whereIn('status', ['ACTIVE', 'OUT_OF_STOCK']); // Exclude INACTIVE

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('product_code', 'like', '%' . $request->search . '%');
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('is_featured')) {
            $query->where('is_featured', filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN));
        }

        $query->orderBy('sort_order', 'asc');

        $products = null;
        
        $engine = app(\App\Services\Promotions\PromotionEngine::class);

        if ($request->has('per_page')) {
            $products = $query->paginate($request->per_page);
            $products->getCollection()->transform(function ($product) {
                return $this->appendInventoryData($product);
            });
            // Attach pricing
            $products->setCollection($engine->attachPricingToProducts($products->getCollection()));
            return $products;
        }

        $products = $query->get();
        $products = $products->map(function ($product) {
            return $this->appendInventoryData($product);
        });
        
        return $engine->attachPricingToProducts($products);
    }

    /**
     * Get product detail
     */
    public function getProductDetail($id)
    {
        $product = Product::with(['category', 'productIngredients.ingredient'])->findOrFail($id);
        $product = $this->appendInventoryData($product);
        
        $engine = app(\App\Services\Promotions\PromotionEngine::class);
        return $engine->attachPricingToProducts(collect([$product]))->first();
    }
    
    /**
     * Append inventory availability and max producible quantity to product in memory
     */
    private function appendInventoryData(Product $product)
    {
        if (!$product->track_inventory) {
            $product->inventory_available = true;
            $product->max_producible_quantity = null;
            return $product;
        }
        
        $recipeItems = $product->productIngredients;
        
        if ($recipeItems->isEmpty()) {
            $product->inventory_available = false;
            $product->max_producible_quantity = 0;
            return $product;
        }
        
        $maxProducible = PHP_INT_MAX;
        
        foreach ($recipeItems as $item) {
            $ingredient = $item->ingredient;
            if (!$ingredient || $item->quantity_required <= 0) {
                $maxProducible = 0;
                break;
            }
            
            $possible = floor($ingredient->current_stock / $item->quantity_required);
            if ($possible < $maxProducible) {
                $maxProducible = $possible;
            }
        }
        
        if ($maxProducible === PHP_INT_MAX) {
            $maxProducible = 0;
        }
        
        $product->inventory_available = $maxProducible > 0;
        $product->max_producible_quantity = max(0, $maxProducible);
        
        // Hide the relations from the final JSON so we don't leak recipe to frontend staff
        $product->makeHidden('productIngredients');
        
        return $product;
    }
}
