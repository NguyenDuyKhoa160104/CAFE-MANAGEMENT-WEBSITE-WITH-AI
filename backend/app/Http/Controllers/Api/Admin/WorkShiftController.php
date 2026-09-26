<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WorkShift;

class WorkShiftController extends Controller
{
    public function index()
    {
        $shifts = WorkShift::orderBy('sort_order')->get();
        return response()->json(['message' => 'Lấy danh sách ca làm việc thành công', 'data' => $shifts]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'shift_code' => 'required|string|max:30|unique:work_shifts,shift_code',
            'name' => 'required|string|max:100',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'grace_minutes' => 'integer|min:0',
            'status' => 'in:ACTIVE,INACTIVE',
            'sort_order' => 'integer'
        ]);

        $shift = WorkShift::create($validated);
        return response()->json(['message' => 'Tạo ca làm việc thành công', 'data' => $shift], 201);
    }

    public function update(Request $request, $id)
    {
        $shift = WorkShift::findOrFail($id);
        
        $validated = $request->validate([
            'shift_code' => 'required|string|max:30|unique:work_shifts,shift_code,' . $id,
            'name' => 'required|string|max:100',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'grace_minutes' => 'integer|min:0',
            'status' => 'in:ACTIVE,INACTIVE',
            'sort_order' => 'integer'
        ]);

        $shift->update($validated);
        return response()->json(['message' => 'Cập nhật ca làm việc thành công', 'data' => $shift]);
    }

    public function updateStatus(Request $request, $id)
    {
        $shift = WorkShift::findOrFail($id);
        $request->validate(['status' => 'required|in:ACTIVE,INACTIVE']);
        $shift->update(['status' => $request->status]);
        return response()->json(['message' => 'Cập nhật trạng thái thành công', 'data' => $shift]);
    }

    public function destroy($id)
    {
        $shift = WorkShift::findOrFail($id);
        // Delete gracefully or check constraint, MVP will just delete it
        $shift->delete();
        return response()->json(['message' => 'Xóa ca làm việc thành công']);
    }
}
