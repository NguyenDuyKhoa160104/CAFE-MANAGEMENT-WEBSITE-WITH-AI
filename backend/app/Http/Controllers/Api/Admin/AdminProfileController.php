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
        $data['avatar_url'] = $admin->avatar ? (str_starts_with($admin->avatar, 'http') ? $admin->avatar : url('storage/' . $admin->avatar)) : null;
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

        $admin->save();

        return response()->json([
            'message' => 'Cập nhật hồ sơ thành công',
            'data' => $this->formatAdminResponse($admin)
        ]);
    }

    /**
     * Upload ảnh đại diện mới qua Cloudinary
     */
    public function uploadAvatar(\App\Http\Requests\UploadAvatarRequest $request, \App\Services\Cloudinary\CloudinaryService $cloudinary)
    {
        $admin = $request->user();
        $oldPublicId = $admin->avatar_public_id;

        $result = $cloudinary->uploadAvatar($request->file('avatar'), 'admins');

        if (!$result) {
            return response()->json([
                'message' => 'Lỗi khi tải ảnh lên, vui lòng thử lại sau.'
            ], 500);
        }

        try {
            $admin->avatar = $result['url'];
            $admin->avatar_public_id = $result['public_id'];
            $admin->save();

            // Nếu update DB thành công và có ảnh cũ thì xóa ảnh cũ
            if ($oldPublicId) {
                $cloudinary->delete($oldPublicId);
            }

            return response()->json([
                'message' => 'Cập nhật ảnh đại diện thành công',
                'data' => $this->formatAdminResponse($admin)
            ]);
        } catch (\Exception $e) {
            // Xóa ảnh mới vừa upload lên nếu có lỗi DB
            $cloudinary->delete($result['public_id']);
            throw $e;
        }
    }

    /**
     * Xóa ảnh đại diện
     */
    public function removeAvatar(Request $request, \App\Services\Cloudinary\CloudinaryService $cloudinary)
    {
        $admin = $request->user();

        if ($admin->avatar_public_id) {
            $cloudinary->delete($admin->avatar_public_id);
            
            $admin->avatar = null;
            $admin->avatar_public_id = null;
            $admin->save();
        } elseif ($admin->avatar) {
            // In case there is an old local avatar
            if (Storage::disk('public')->exists($admin->avatar)) {
                Storage::disk('public')->delete($admin->avatar);
            }
            $admin->avatar = null;
            $admin->avatar_public_id = null;
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
