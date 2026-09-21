<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_code',
        'table_id',
        'staff_id',
        'customer_type',
        'customer_id',
        'customer_name',
        'customer_phone',
        'order_type',
        'source',
        'status',
        'subtotal',
        'discount_amount',
        'total_amount',
        'note',
        'cancel_reason',
        'cancelled_at',
        'inventory_consumed_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'cancelled_at' => 'datetime',
        'inventory_consumed_at' => 'datetime',
    ];

    public function table()
    {
        return $this->belongsTo(CafeTable::class, 'table_id');
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }
}
