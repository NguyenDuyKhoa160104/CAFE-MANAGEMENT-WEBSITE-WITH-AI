<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_code',
        'ingredient_id',
        'type',
        'quantity_change',
        'balance_before',
        'balance_after',
        'reference_type',
        'reference_id',
        'admin_id',
        'staff_id',
        'note',
    ];

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
