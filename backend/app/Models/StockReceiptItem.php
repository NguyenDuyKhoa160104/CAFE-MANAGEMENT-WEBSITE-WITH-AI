<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockReceiptItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_receipt_id',
        'ingredient_id',
        'ingredient_name',
        'unit',
        'quantity',
        'unit_cost',
        'line_total',
    ];

    public function receipt()
    {
        return $this->belongsTo(StockReceipt::class, 'stock_receipt_id');
    }

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }
}
