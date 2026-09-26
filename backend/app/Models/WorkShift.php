<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkShift extends Model
{
    use HasFactory;

    protected $fillable = [
        'shift_code',
        'name',
        'start_time',
        'end_time',
        'grace_minutes',
        'status',
        'sort_order'
    ];
}
