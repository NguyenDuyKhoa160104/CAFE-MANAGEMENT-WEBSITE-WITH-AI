<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\Admin\UpdateAdminProfileRequest;
use App\Http\Requests\Admin\ChangeAdminPasswordRequest;

class AdminProfileController extends Controller
{
    /**
     * Format admin data for response
     */
    private function formatAdminResponse($admin)
    {
        $data = $admin->toArray();
        $data['avatar_url'] = $admin->avatar ? url('storage/' . $admin->avatar) : null;
        return $data;
    }

    /**
     * Lấy thông tin hồ sơ Admin hiện tại
     */
    public function show(Request $request)
    {
        $admin = $request->user();
        
        return response()->json([
            'message' => 'Lấy thông tin hồ sơ thành công',
            'data' => $this->formatAdminResponse($admin)
        ]);
    }

    /**
     * Cập nhật thông tin hồ sơ
     */
    public function update(UpdateAdminProfileRequest $request)
    {
        $admin = $request->user();

        $admin->full_name = $request->full_name;
        $admin->email = $request->email;
        $admin->phone = $request->phone;

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($admin->avatar && Storage::disk('public')->exists($admin->avatar)) {
                Storage::disk('public')->delete($admin->avatar);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('admins/avatars', 'public');
            $admin->avatar = $path;
        } elseif ($request->has('remove_image') && $request->remove_image == 1) {
            if ($admin->avatar && Storage::disk('public')->exists($admin->avatar)) {
                Storage::disk('public')->delete($admin->avatar);
            }
            $admin->avatar = null;
        }

        $admin->save();

        return response()->json([
            'message' => 'Cập nhật hồ sơ thành công',
            'data' => $this->formatAdminResponse($admin)
        ]);
    }

    /**
     * Xóa ảnh đại diện
     */
    public function removeAvatar(Request $request)
    {
        $admin = $request->user();

        if ($admin->avatar) {
            if (Storage::disk('public')->exists($admin->avatar)) {
                Storage::disk('public')->delete($admin->avatar);
            }
            
            $admin->avatar = null;
            $admin->save();
        }

        return response()->json([
            'message' => 'Xóa ảnh đại diện thành công',
            'data' => $this->formatAdminResponse($admin)
        ]);
    }

    /**
     * Đổi mật khẩu
     */
    public function changePassword(ChangeAdminPasswordRequest $request)
    {
        $admin = $request->user();

        // Check current password
        if (!Hash::check($request->current_password, $admin->password)) {
            return response()->json([
                'message' => 'Mật khẩu hiện tại không chính xác',
                'errors' => [
                    'current_password' => ['Mật khẩu hiện tại không chính xác']
                ]
            ], 422);
        }

        // Check if new password is same as old password
        if ($request->current_password === $request->password) {
            return response()->json([
                'message' => 'Mật khẩu mới phải khác mật khẩu hiện tại',
                'errors' => [
                    'password' => ['Mật khẩu mới phải khác mật khẩu hiện tại']
                ]
            ], 422);
        }

        // Update password
        $admin->password = Hash::make($request->password);
        $admin->save();

        // Delete all other tokens except the current one
        $currentToken = $admin->currentAccessToken();
        $admin->tokens()->where('id', '!=', $currentToken->id)->delete();

        return response()->json([
            'message' => 'Đổi mật khẩu thành công. Các phiên đăng nhập khác đã được đăng xuất.'
        ]);
    }
}
