<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class StaffAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $staff = Staff::where('email', $request->email)->first();

        if (!$staff || !Hash::check($request->password, $staff->password)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác'
            ], 401);
        }

        if ($staff->status !== 'ACTIVE') {
            return response()->json([
                'message' => $staff->status === 'LOCKED' 
                    ? 'Tài khoản nhân viên đã bị khóa' 
                    : 'Tài khoản nhân viên đã ngừng hoạt động'
            ], 403);
        }

        $token = $staff
            ->createToken('staff_token')
            ->plainTextToken;

        $avatarUrl = $staff->avatar ? url('storage/' . $staff->avatar) : null;

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'token' => $token,
            'staff' => [
                'id' => $staff->id,
                'staff_code' => $staff->staff_code,
                'full_name' => $staff->full_name,
                'email' => $staff->email,
                'phone' => $staff->phone,
                'avatar' => $staff->avatar,
                'avatar_url' => $avatarUrl,
                'position' => $staff->position,
                'status' => $staff->status,
            ]
        ], 200);
    }

    public function info(Request $request)
    {
        $staff = $request->user();
        $avatarUrl = $staff->avatar ? url('storage/' . $staff->avatar) : null;
        
        $staffData = $staff->toArray();
        $staffData['avatar_url'] = $avatarUrl;

        // Ensure sensitive info is hidden (password and remember_token are already hidden in the Model)

        return response()->json([
            'message' => 'Lấy thông tin nhân viên thành công',
            'staff' => $staffData
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công'
        ], 200);
    }

    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Đã đăng xuất khỏi tất cả thiết bị'
        ], 200);
    }
}
