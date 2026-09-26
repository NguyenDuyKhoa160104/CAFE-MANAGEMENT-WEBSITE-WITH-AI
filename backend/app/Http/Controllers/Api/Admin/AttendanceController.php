<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\StaffShiftAssignment;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with(['staff', 'workShift']);
        
        if ($request->has('work_date')) {
            $query->where('work_date', $request->work_date);
        }
        if ($request->has('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }
        
        $attendances = $query->orderBy('work_date', 'desc')->get();
        return response()->json(['message' => 'Lấy danh sách chấm công thành công', 'data' => $attendances]);
    }

    public function adjust(Request $request, $id)
    {
        $attendance = Attendance::findOrFail($id);
        
        $validated = $request->validate([
            'check_in_at' => 'nullable|date',
            'check_out_at' => 'nullable|date',
            'status' => 'required|in:PRESENT,LATE,ABSENT,LEAVE',
            'note' => 'nullable|string'
        ]);
        
        $validated['adjusted_by'] = auth('admin')->id();
        $validated['adjusted_at'] = now();

        $attendance->update($validated);
        
        // Recalculate
        if ($attendance->check_in_at && $attendance->check_out_at && in_array($attendance->status, ['PRESENT', 'LATE'])) {
            $minutes = $attendance->check_out_at->diffInMinutes($attendance->check_in_at);
            $attendance->worked_minutes = $minutes;
            
            if ($attendance->workShift) {
                $start = \Carbon\Carbon::parse($attendance->work_date->format('Y-m-d') . ' ' . $attendance->workShift->start_time);
                $end = \Carbon\Carbon::parse($attendance->work_date->format('Y-m-d') . ' ' . $attendance->workShift->end_time);
                
                $expectedStart = $start->copy()->addMinutes($attendance->workShift->grace_minutes);
                if ($attendance->check_in_at > $expectedStart) {
                    $attendance->late_minutes = $attendance->check_in_at->diffInMinutes($expectedStart);
                } else {
                    $attendance->late_minutes = 0;
                }
                
                if ($attendance->check_out_at > $end) {
                    $attendance->overtime_minutes = $attendance->check_out_at->diffInMinutes($end);
                } else {
                    $attendance->overtime_minutes = 0;
                }
            }
            $attendance->save();
        }

        return response()->json(['message' => 'Điều chỉnh chấm công thành công', 'data' => $attendance]);
    }
}
