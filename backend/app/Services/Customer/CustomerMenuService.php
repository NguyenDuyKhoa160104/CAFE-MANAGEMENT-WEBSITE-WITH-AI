<?php

namespace App\Services\Customer;

use App\Models\Category;
use App\Models\Product;

class CustomerMenuService
{
    public function getCategories()
    {
        return Category::where('status', 'ACTIVE')
            ->orderBy('sort_order', 'asc')
            ->get();
    }

    public function getProducts()
    {
        $products = Product::where('status', 'ACTIVE')
            ->where('recipe_configured', true)
            ->get([
                'id',
                'product_code',
                'category_id',
                'name',
                'slug',
                'description',
                'image',
                'price',
                'is_featured',
                'status',
                'recipe_configured',
                'inventory_available',
                'max_producible_quantity'
            ]);

        $engine = app(\App\Services\Promotions\PromotionEngine::class);
        return $engine->attachPricingToProducts($products);
    }

    public function getProductDetail($id)
    {
        $product = Product::where('status', 'ACTIVE')
            ->where('recipe_configured', true)
            ->findOrFail($id, [
                'id',
                'product_code',
                'category_id',
                'name',
                'slug',
                'description',
                'image',
                'price',
                'is_featured',
                'status',
                'recipe_configured',
                'inventory_available',
                'max_producible_quantity'
            ]);

        $engine = app(\App\Services\Promotions\PromotionEngine::class);
        return $engine->attachPricingToProducts(collect([$product]))->first();
    }
}
