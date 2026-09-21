<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_code',
        'admin_id',
        'supplier_name',
        'status',
        'total_amount',
        'received_at',
        'note',
    ];

    protected $casts = [
        'received_at' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }

    public function items()
    {
        return $this->hasMany(StockReceiptItem::class);
    }
}
