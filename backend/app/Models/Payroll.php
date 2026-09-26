<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_period_id',
        'staff_id',
        'base_salary',
        'standard_work_days',
        'actual_work_days',
        'worked_minutes',
        'late_minutes',
        'overtime_minutes',
        'absent_days',
        'leave_days',
        'base_work_salary',
        'overtime_amount',
        'allowance_amount',
        'bonus_amount',
        'deduction_amount',
        'gross_salary',
        'net_salary',
        'note',
        'status',
        'paid_at'
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'standard_work_days' => 'decimal:2',
        'actual_work_days' => 'decimal:2',
        'absent_days' => 'decimal:2',
        'leave_days' => 'decimal:2',
        'base_work_salary' => 'decimal:2',
        'overtime_amount' => 'decimal:2',
        'allowance_amount' => 'decimal:2',
        'bonus_amount' => 'decimal:2',
        'deduction_amount' => 'decimal:2',
        'gross_salary' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function payrollPeriod()
    {
        return $this->belongsTo(PayrollPeriod::class);
    }
}
