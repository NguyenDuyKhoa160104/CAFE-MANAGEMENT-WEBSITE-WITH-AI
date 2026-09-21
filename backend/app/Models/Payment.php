<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_code',
        'order_id',
        'staff_id',
        'payment_method',
        'amount',
        'status',
        'paid_at',
        'transaction_reference',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
