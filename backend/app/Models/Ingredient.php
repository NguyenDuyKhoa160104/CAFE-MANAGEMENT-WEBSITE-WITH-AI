<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    use HasFactory;

    protected $fillable = [
        'ingredient_code',
        'name',
        'unit',
        'current_stock',
        'minimum_stock',
        'average_cost',
        'status',
        'description',
    ];

    protected $appends = ['inventory_status'];

    public function productIngredients()
    {
        return $this->hasMany(ProductIngredient::class);
    }

    public function stockReceiptItems()
    {
        return $this->hasMany(StockReceiptItem::class);
    }

    public function inventoryTransactions()
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    public function getInventoryStatusAttribute()
    {
        $current = (float) $this->current_stock;
        $minimum = (float) $this->minimum_stock;

        if ($current <= 0) {
            return 'OUT';
        }

        if ($current <= $minimum) {
            return 'LOW';
        }

        return 'NORMAL';
    }
}
