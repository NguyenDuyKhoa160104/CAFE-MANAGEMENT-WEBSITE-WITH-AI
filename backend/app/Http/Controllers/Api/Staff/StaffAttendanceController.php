<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\StaffShiftAssignment;
use Carbon\Carbon;

class StaffAttendanceController extends Controller
{
    public function checkIn(Request $request)
    {
        $staff = $request->user();
        $today = Carbon::now()->toDateString();
        $now = Carbon::now();

        // Tìm ca được phân công hôm nay
        $assignment = StaffShiftAssignment::with('workShift')
            ->where('staff_id', $staff->id)
            ->where('work_date', $today)
            // Lấy id từ query nếu client truyền lên (trong trường hợp 1 ngày có nhiều ca)
            ->when($request->has('assignment_id'), function($q) use ($request) {
                return $q->where('id', $request->assignment_id);
            })
            ->first();

        if (!$assignment) {
            return response()->json(['message' => 'Bạn chưa được xếp ca hôm nay.'], 403);
        }

        // Kiểm tra xem đã chấm công ca này chưa
        $existing = Attendance::where('staff_id', $staff->id)
            ->where('work_date', $today)
            ->where('work_shift_id', $assignment->work_shift_id)
            ->first();

        if ($existing && $existing->check_in_at) {
            return response()->json(['message' => 'Bạn đã chấm công vào ca này rồi.'], 400);
        }

        $shift = $assignment->workShift;
        $status = 'PRESENT';
        $lateMinutes = 0;

        if ($shift) {
            $expectedStartTime = Carbon::parse($today . ' ' . $shift->start_time);
            
            // Chỉ cho phép chấm công sớm tối đa 30 phút
            $earliestCheckIn = $expectedStartTime->copy()->subMinutes(30);
            if ($now->lessThan($earliestCheckIn)) {
                return response()->json(['message' => 'Chưa tới giờ làm việc. Bạn chỉ có thể chấm công trước 30 phút.'], 400);
            }

            $graceTime = $expectedStartTime->copy()->addMinutes($shift->grace_minutes);

            if ($now->greaterThan($graceTime)) {
                $status = 'LATE';
                $lateMinutes = (int) abs($now->diffInMinutes($expectedStartTime));
            }
        }

        if ($existing) {
            $existing->update([
                'check_in_at' => $now,
                'status' => $status,
                'late_minutes' => $lateMinutes
            ]);
            $attendance = $existing;
        } else {
            $attendance = Attendance::create([
                'staff_id' => $staff->id,
                'work_date' => $today,
                'work_shift_id' => $assignment->work_shift_id,
                'check_in_at' => $now,
                'status' => $status,
                'late_minutes' => $lateMinutes,
                'overtime_minutes' => 0,
                'worked_minutes' => 0,
            ]);
        }

        return response()->json([
            'message' => 'Chấm công vào thành công.',
            'data' => $attendance
        ]);
    }

    public function checkOut(Request $request)
    {
        $staff = $request->user();
        $today = Carbon::now()->toDateString();
        $now = Carbon::now();

        // Tìm ca được phân công
        $assignment = StaffShiftAssignment::with('workShift')
            ->where('staff_id', $staff->id)
            ->where('work_date', $today)
            ->when($request->has('assignment_id'), function($q) use ($request) {
                return $q->where('id', $request->assignment_id);
            })
            ->first();

        if (!$assignment) {
            return response()->json(['message' => 'Không tìm thấy ca làm việc.'], 404);
        }

        $attendance = Attendance::where('staff_id', $staff->id)
            ->where('work_date', $today)
            ->where('work_shift_id', $assignment->work_shift_id)
            ->first();

        if (!$attendance || !$attendance->check_in_at) {
            return response()->json(['message' => 'Bạn chưa chấm công vào ca này.'], 400);
        }

        if ($attendance->check_out_at) {
            return response()->json(['message' => 'Bạn đã chấm công ra ca này rồi.'], 400);
        }

        $checkInTime = Carbon::parse($attendance->check_in_at);
        $workedMinutes = (int) abs($now->diffInMinutes($checkInTime));
        $overtimeMinutes = 0;

        $shift = $assignment->workShift;
        if ($shift) {
            $expectedEndTime = Carbon::parse($today . ' ' . $shift->end_time);
            if ($now->greaterThan($expectedEndTime)) {
                $overtimeMinutes = (int) abs($now->diffInMinutes($expectedEndTime));
            }
        }

        $attendance->update([
            'check_out_at' => $now,
            'worked_minutes' => $workedMinutes,
            'overtime_minutes' => $overtimeMinutes
        ]);

        return response()->json([
            'message' => 'Chấm công ra thành công.',
            'data' => $attendance
        ]);
    }
}
