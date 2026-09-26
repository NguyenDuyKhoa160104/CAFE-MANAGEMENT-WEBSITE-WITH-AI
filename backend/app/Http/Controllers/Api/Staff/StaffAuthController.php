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

        $avatarUrl = $staff->avatar ? (str_starts_with($staff->avatar, 'http') ? $staff->avatar : url('storage/' . $staff->avatar)) : null;

        $staff->load('role.permissions');
        $permissions = $staff->role && $staff->role->status === 'ACTIVE' 
            ? $staff->role->permissions->pluck('permission_code')->toArray() 
            : [];

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
                'role' => $staff->role,
                'permissions' => $permissions,
                'status' => $staff->status,
            ]
        ], 200);
    }

    public function info(Request $request)
    {
        $staff = $request->user();
        $avatarUrl = $staff->avatar ? (str_starts_with($staff->avatar, 'http') ? $staff->avatar : url('storage/' . $staff->avatar)) : null;
        
        $staff->load('role.permissions');
        $permissions = $staff->role && $staff->role->status === 'ACTIVE' 
            ? $staff->role->permissions->pluck('permission_code')->toArray() 
            : [];

        $staffData = $staff->toArray();
        $staffData['avatar_url'] = $avatarUrl;
        $staffData['permissions'] = $permissions;

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
    public function uploadAvatar(\App\Http\Requests\UploadAvatarRequest $request, \App\Services\Cloudinary\CloudinaryService $cloudinary)
    {
        $staff = $request->user();
        $oldPublicId = $staff->avatar_public_id;

        $result = $cloudinary->uploadAvatar($request->file('avatar'), 'staffs');

        if (!$result) {
            return response()->json([
                'message' => 'Lỗi khi tải ảnh lên, vui lòng thử lại sau.'
            ], 500);
        }

        try {
            $staff->avatar = $result['url'];
            $staff->avatar_public_id = $result['public_id'];
            $staff->save();

            if ($oldPublicId) {
                $cloudinary->delete($oldPublicId);
            }

            return response()->json([
                'message' => 'Cập nhật ảnh đại diện thành công',
                'data' => array_merge($staff->toArray(), [
                    'avatar_url' => $staff->avatar
                ])
            ]);
        } catch (\Exception $e) {
            $cloudinary->delete($result['public_id']);
            throw $e;
        }
    }

    public function removeAvatar(Request $request, \App\Services\Cloudinary\CloudinaryService $cloudinary)
    {
        $staff = $request->user();

        if ($staff->avatar_public_id) {
            $cloudinary->delete($staff->avatar_public_id);
            $staff->avatar = null;
            $staff->avatar_public_id = null;
            $staff->save();
        } elseif ($staff->avatar) {
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($staff->avatar)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($staff->avatar);
            }
            $staff->avatar = null;
            $staff->avatar_public_id = null;
            $staff->save();
        }

        return response()->json([
            'message' => 'Xóa ảnh đại diện thành công',
            'data' => array_merge($staff->toArray(), [
                'avatar_url' => null
            ])
        ]);
    }
}
