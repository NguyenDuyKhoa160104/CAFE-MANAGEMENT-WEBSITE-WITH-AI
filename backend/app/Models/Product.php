<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_code',
        'category_id',
        'name',
        'slug',
        'description',
        'image',
        'price',
        'cost_price',
        'status',
        'track_inventory',
        'recipe_configured',
        'inventory_available',
        'max_producible_quantity',
        'is_featured',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'track_inventory' => 'boolean',
            'recipe_configured' => 'boolean',
            'inventory_available' => 'boolean',
            'max_producible_quantity' => 'integer',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'product_id');
    }

    public function productIngredients()
    {
        return $this->hasMany(ProductIngredient::class, 'product_id');
    }
}
