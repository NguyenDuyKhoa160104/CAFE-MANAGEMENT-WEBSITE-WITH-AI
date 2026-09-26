<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_code',
        'customer_id',
        'table_id',
        'reservation_at',
        'duration_minutes',
        'party_size',
        'customer_name',
        'customer_phone',
        'note',
        'status',
        'cancel_reason',
        'cancelled_at',
    ];

    protected $casts = [
        'reservation_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function table()
    {
        return $this->belongsTo(CafeTable::class, 'table_id');
    }
}
