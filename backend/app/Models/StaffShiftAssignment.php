<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffShiftAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'work_shift_id',
        'work_date',
        'note',
        'created_by'
    ];

    protected $casts = [
        'work_date' => 'date'
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
