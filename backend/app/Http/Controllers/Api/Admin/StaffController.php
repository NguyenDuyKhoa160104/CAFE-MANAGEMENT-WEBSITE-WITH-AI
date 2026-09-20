<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Http\Requests\Admin\StoreStaffRequest;
use App\Http\Requests\Admin\UpdateStaffRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $query = Staff::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('staff_code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sort = $request->get('sort', 'created_at_desc');
        switch ($sort) {
            case 'full_name_asc':
                $query->orderBy('full_name', 'asc');
                break;
            case 'full_name_desc':
                $query->orderBy('full_name', 'desc');
                break;
            case 'staff_code_asc':
                $query->orderBy('staff_code', 'asc');
                break;
            case 'staff_code_desc':
                $query->orderBy('staff_code', 'desc');
                break;
            case 'hire_date_newest':
                $query->orderBy('hire_date', 'desc');
                break;
            case 'hire_date_oldest':
                $query->orderBy('hire_date', 'asc');
                break;
            case 'created_at_oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'created_at_desc':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $staffs = $query->paginate(10);

        // Map avatar_url for response
        $staffs->getCollection()->transform(function ($staff) {
            $staff->avatar_url = $staff->avatar ? url('storage/' . $staff->avatar) : null;
            return $staff;
        });

        return response()->json([
            'message' => 'Lấy danh sách nhân viên thành công',
            'data' => $staffs
        ]);
    }

    public function store(StoreStaffRequest $request)
    {
        $data = $request->validated();

        $data['password'] = Hash::make($data['password']);

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('staffs/avatars', 'public');
        }

        $staff = Staff::create($data);
        $staff->avatar_url = $staff->avatar ? url('storage/' . $staff->avatar) : null;

        return response()->json([
            'message' => 'Thêm nhân viên thành công',
            'data' => $staff
        ], 201);
    }

    public function show($id)
    {
        $staff = Staff::find($id);

        if (!$staff) {
            return response()->json(['message' => 'Không tìm thấy nhân viên'], 404);
        }

        $staff->avatar_url = $staff->avatar ? url('storage/' . $staff->avatar) : null;

        return response()->json([
            'message' => 'Lấy chi tiết nhân viên thành công',
            'data' => $staff
        ]);
    }

    public function update(UpdateStaffRequest $request, $id)
    {
        $staff = Staff::find($id);

        if (!$staff) {
            return response()->json(['message' => 'Không tìm thấy nhân viên'], 404);
        }

        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($staff->avatar && Storage::disk('public')->exists($staff->avatar)) {
                Storage::disk('public')->delete($staff->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('staffs/avatars', 'public');
        }

        $staff->update($data);
        $staff->avatar_url = $staff->avatar ? url('storage/' . $staff->avatar) : null;

        return response()->json([
            'message' => 'Cập nhật nhân viên thành công',
            'data' => $staff
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:ACTIVE,INACTIVE,LOCKED'
        ]);

        $staff = Staff::find($id);

        if (!$staff) {
            return response()->json(['message' => 'Không tìm thấy nhân viên'], 404);
        }

        $staff->update(['status' => $request->status]);

        if (in_array($request->status, ['INACTIVE', 'LOCKED'])) {
            $staff->tokens()->delete();
        }

        $staff->avatar_url = $staff->avatar ? url('storage/' . $staff->avatar) : null;

        return response()->json([
            'message' => 'Cập nhật trạng thái nhân viên thành công',
            'data' => $staff
        ]);
    }

    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed'
        ]);

        $staff = Staff::find($id);

        if (!$staff) {
            return response()->json(['message' => 'Không tìm thấy nhân viên'], 404);
        }

        $staff->update([
            'password' => Hash::make($request->password)
        ]);

        $staff->tokens()->delete();

        return response()->json([
            'message' => 'Đặt lại mật khẩu nhân viên thành công'
        ]);
    }

    public function destroy($id)
    {
        $staff = Staff::find($id);

        if (!$staff) {
            return response()->json(['message' => 'Không tìm thấy nhân viên'], 404);
        }

        // TODO: In the future, when Staff has Orders, Attendance, or Payroll,
        // we should NOT hard delete them. We should either SoftDelete or set status to INACTIVE.
        // For now, hard delete is acceptable as per requirements.

        if ($staff->avatar && Storage::disk('public')->exists($staff->avatar)) {
            Storage::disk('public')->delete($staff->avatar);
        }

        $staff->tokens()->delete();
        $staff->delete();

        return response()->json([
            'message' => 'Xóa nhân viên thành công'
        ]);
    }
}
