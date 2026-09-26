<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'period_code',
        'name',
        'start_date',
        'end_date',
        'standard_work_days',
        'status',
        'confirmed_at',
        'confirmed_by',
        'paid_at',
        'paid_by',
        'note'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'standard_work_days' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }
}
