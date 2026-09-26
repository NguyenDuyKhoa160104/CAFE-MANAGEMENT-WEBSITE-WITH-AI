<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'work_shift_id',
        'work_date',
        'check_in_at',
        'check_out_at',
        'status',
        'worked_minutes',
        'late_minutes',
        'overtime_minutes',
        'note',
        'adjusted_by',
        'adjusted_at'
    ];

    protected $casts = [
        'work_date' => 'date',
        'check_in_at' => 'datetime',
        'check_out_at' => 'datetime',
        'adjusted_at' => 'datetime',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function workShift()
    {
        return $this->belongsTo(WorkShift::class);
    }
}
