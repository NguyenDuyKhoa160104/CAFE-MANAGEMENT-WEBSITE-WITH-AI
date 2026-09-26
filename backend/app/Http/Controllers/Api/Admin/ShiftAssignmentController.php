<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StaffShiftAssignment;

class ShiftAssignmentController extends Controller
{
    public function index(Request $request)
    {
        $query = StaffShiftAssignment::with(['staff', 'workShift']);
        
        if ($request->has('work_date')) {
            $query->where('work_date', $request->work_date);
        }
        if ($request->has('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }
        if ($request->has('work_shift_id')) {
            $query->where('work_shift_id', $request->work_shift_id);
        }
        
        $assignments = $query->orderBy('work_date', 'desc')->get();
        return response()->json(['message' => 'Lấy lịch làm việc thành công', 'data' => $assignments]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'staff_id' => 'required|exists:staffs,id',
            'work_shift_id' => 'required|exists:work_shifts,id',
            'work_date' => 'required|date',
            'note' => 'nullable|string'
        ]);
        
        $validated['created_by'] = auth('admin')->id();

        // Check if exists
        $exists = StaffShiftAssignment::where('staff_id', $validated['staff_id'])
            ->where('work_shift_id', $validated['work_shift_id'])
            ->where('work_date', $validated['work_date'])
            ->exists();
            
        if ($exists) {
            return response()->json(['message' => 'Nhân viên đã được xếp ca này trong ngày hôm nay.'], 400);
        }

        $assignment = StaffShiftAssignment::create($validated);
        
        return response()->json(['message' => 'Xếp ca thành công', 'data' => $assignment], 201);
    }

    public function update(Request $request, $id)
    {
        $assignment = StaffShiftAssignment::findOrFail($id);
        
        $validated = $request->validate([
            'staff_id' => 'required|exists:staffs,id',
            'work_shift_id' => 'required|exists:work_shifts,id',
            'work_date' => 'required|date',
            'note' => 'nullable|string'
        ]);
        
        // Check if exists for another assignment
        $exists = StaffShiftAssignment::where('staff_id', $validated['staff_id'])
            ->where('work_shift_id', $validated['work_shift_id'])
            ->where('work_date', $validated['work_date'])
            ->where('id', '!=', $id)
            ->exists();
            
        if ($exists) {
            return response()->json(['message' => 'Nhân viên đã được xếp ca này trong ngày hôm nay.'], 400);
        }

        $assignment->update($validated);
        
        return response()->json(['message' => 'Cập nhật phân ca thành công', 'data' => $assignment]);
    }

    public function destroy($id)
    {
        $assignment = StaffShiftAssignment::findOrFail($id);
        $assignment->delete();
        return response()->json(['message' => 'Xóa lịch phân ca thành công']);
    }
}
