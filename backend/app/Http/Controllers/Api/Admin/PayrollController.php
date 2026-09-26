<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PayrollPeriod;
use App\Models\Payroll;
use App\Models\Staff;
use App\Models\Attendance;
use Illuminate\Support\Facades\DB;

class PayrollController extends Controller
{
    public function periods()
    {
        $periods = PayrollPeriod::orderBy('start_date', 'desc')->get();
        return response()->json(['message' => 'Lấy danh sách kỳ lương thành công', 'data' => $periods]);
    }

    public function periodDetail($id)
    {
        $period = PayrollPeriod::with(['payrolls.staff'])->findOrFail($id);
        return response()->json(['message' => 'Chi tiết kỳ lương', 'data' => $period]);
    }

    public function storePeriod(Request $request)
    {
        $validated = $request->validate([
            'period_code' => 'required|string|max:50|unique:payroll_periods,period_code',
            'name' => 'required|string|max:150',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'standard_work_days' => 'required|numeric|min:0.5',
            'note' => 'nullable|string'
        ]);

        $period = PayrollPeriod::create($validated);
        return response()->json(['message' => 'Tạo kỳ lương thành công', 'data' => $period], 201);
    }

    public function updatePeriod(Request $request, $id)
    {
        $period = PayrollPeriod::findOrFail($id);
        if ($period->status !== 'DRAFT') {
            return response()->json(['message' => 'Chỉ có thể sửa kỳ lương DRAFT'], 400);
        }

        $validated = $request->validate([
            'period_code' => 'required|string|max:50|unique:payroll_periods,period_code,' . $id,
            'name' => 'required|string|max:150',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'standard_work_days' => 'required|numeric|min:0.5',
            'note' => 'nullable|string'
        ]);

        $period->update($validated);
        return response()->json(['message' => 'Cập nhật kỳ lương thành công', 'data' => $period]);
    }

    public function destroyPeriod($id)
    {
        $period = PayrollPeriod::findOrFail($id);
        if ($period->status !== 'DRAFT') {
            return response()->json(['message' => 'Chỉ có thể xóa kỳ lương DRAFT'], 400);
        }
        $period->delete();
        return response()->json(['message' => 'Xóa kỳ lương thành công']);
    }

    public function generate($id)
    {
        $period = PayrollPeriod::findOrFail($id);
        if ($period->status !== 'DRAFT') {
            return response()->json(['message' => 'Chỉ có thể tạo bảng lương cho kỳ DRAFT'], 400);
        }

        DB::transaction(function () use ($period) {
            $staffs = Staff::where('status', 'ACTIVE')->get();
            
            foreach ($staffs as $staff) {
                // Get attendance summary for this staff in period
                $attendances = Attendance::where('staff_id', $staff->id)
                    ->whereBetween('work_date', [$period->start_date, $period->end_date])
                    ->get();
                
                // Group by date to handle multiple shifts -> count as 1 actual_work_day max per date
                $workDays = 0;
                $absentDays = 0;
                $leaveDays = 0;
                $workedMinutes = 0;
                $lateMinutes = 0;
                $overtimeMinutes = 0;

                $dates = $attendances->groupBy(function($a) {
                    return $a->work_date->format('Y-m-d');
                });

                foreach ($dates as $date => $dayAttendances) {
                    $hasPresentOrLate = $dayAttendances->contains(fn($a) => in_array($a->status, ['PRESENT', 'LATE']));
                    if ($hasPresentOrLate) {
                        $workDays += 1; // MVP: 1 shift = 1 day, or multiple shifts = 1 day
                    } else if ($dayAttendances->contains(fn($a) => $a->status === 'ABSENT')) {
                        $absentDays += 1;
                    } else if ($dayAttendances->contains(fn($a) => $a->status === 'LEAVE')) {
                        $leaveDays += 1;
                    }
                    
                    $workedMinutes += $dayAttendances->sum('worked_minutes');
                    $lateMinutes += $dayAttendances->sum('late_minutes');
                    $overtimeMinutes += $dayAttendances->sum('overtime_minutes');
                }

                $payroll = Payroll::firstOrNew([
                    'payroll_period_id' => $period->id,
                    'staff_id' => $staff->id
                ]);

                // Snapshot salary only if it's new, or update it?
                // The requirement: "Generate lại khi period DRAFT: được phép recalculate attendance fields. Nhưng giữ adjustments manual."
                if (!$payroll->exists) {
                    $payroll->base_salary = $staff->base_salary;
                    $payroll->allowance_amount = 0;
                    $payroll->bonus_amount = 0;
                    $payroll->deduction_amount = 0;
                    $payroll->overtime_amount = 0;
                }

                $payroll->standard_work_days = $period->standard_work_days;
                $payroll->actual_work_days = $workDays;
                $payroll->worked_minutes = $workedMinutes;
                $payroll->late_minutes = $lateMinutes;
                $payroll->overtime_minutes = $overtimeMinutes;
                $payroll->absent_days = $absentDays;
                $payroll->leave_days = $leaveDays;

                // Calculate base work salary
                $daily = $payroll->base_salary / $period->standard_work_days;
                $payroll->base_work_salary = $daily * $workDays;
                
                // Gross & Net
                $payroll->gross_salary = $payroll->base_work_salary + $payroll->overtime_amount + $payroll->allowance_amount + $payroll->bonus_amount;
                $payroll->net_salary = $payroll->gross_salary - $payroll->deduction_amount;

                $payroll->save();
            }
        });

        return response()->json(['message' => 'Tính lương thành công']);
    }

    public function confirmPeriod($id)
    {
        $period = PayrollPeriod::with('payrolls')->findOrFail($id);
        if ($period->status !== 'DRAFT') {
            return response()->json(['message' => 'Chỉ có thể confirm kỳ lương DRAFT'], 400);
        }
        if ($period->payrolls->isEmpty()) {
            return response()->json(['message' => 'Kỳ lương trống, vui lòng tính lương trước'], 400);
        }

        DB::transaction(function () use ($period) {
            $period->update([
                'status' => 'CONFIRMED',
                'confirmed_at' => now(),
                'confirmed_by' => auth('admin')->id()
            ]);
            $period->payrolls()->update(['status' => 'CONFIRMED']);
        });

        return response()->json(['message' => 'Xác nhận kỳ lương thành công', 'data' => $period]);
    }

    public function markPaidPeriod($id)
    {
        $period = PayrollPeriod::findOrFail($id);
        if ($period->status !== 'CONFIRMED') {
            return response()->json(['message' => 'Kỳ lương phải ở trạng thái CONFIRMED'], 400);
        }

        DB::transaction(function () use ($period) {
            $period->update([
                'status' => 'PAID',
                'paid_at' => now(),
                'paid_by' => auth('admin')->id()
            ]);
            $period->payrolls()->update(['status' => 'PAID', 'paid_at' => now()]);
        });

        return response()->json(['message' => 'Đã đánh dấu thanh toán thành công', 'data' => $period]);
    }

    public function adjustPayroll(Request $request, $id)
    {
        $payroll = Payroll::findOrFail($id);
        if ($payroll->status !== 'DRAFT') {
            return response()->json(['message' => 'Chỉ có thể điều chỉnh bảng lương DRAFT'], 400);
        }

        $validated = $request->validate([
            'overtime_amount' => 'numeric|min:0',
            'allowance_amount' => 'numeric|min:0',
            'bonus_amount' => 'numeric|min:0',
            'deduction_amount' => 'numeric|min:0',
            'note' => 'nullable|string'
        ]);

        foreach ($validated as $key => $val) {
            $payroll->{$key} = $val;
        }

        $payroll->gross_salary = $payroll->base_work_salary + $payroll->overtime_amount + $payroll->allowance_amount + $payroll->bonus_amount;
        $payroll->net_salary = $payroll->gross_salary - $payroll->deduction_amount;

        $payroll->save();
        return response()->json(['message' => 'Điều chỉnh lương thành công', 'data' => $payroll]);
    }
}
