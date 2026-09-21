<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_code',
        'order_id',
        'payment_id',
        'staff_id',
        'customer_name',
        'customer_phone',
        'subtotal',
        'discount_amount',
        'total_amount',
        'payment_method',
        'issued_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'issued_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
