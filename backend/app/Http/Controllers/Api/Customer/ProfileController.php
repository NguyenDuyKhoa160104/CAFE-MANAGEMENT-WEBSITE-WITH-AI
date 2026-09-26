<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\Profile\ChangePasswordRequest;
use App\Http\Requests\Customer\Profile\UpdateProfileRequest;
use App\Services\Customer\CustomerProfileService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    protected $profileService;

    public function __construct(CustomerProfileService $profileService)
    {
        $this->profileService = $profileService;
    }

    public function show(Request $request)
    {
        return response()->json([
            'customer' => $request->user(),
        ]);
    }

    public function update(UpdateProfileRequest $request)
    {
        $customer = $this->profileService->updateProfile($request->user(), $request->validated());

        return response()->json([
            'message' => 'Cập nhật hồ sơ thành công',
            'customer' => $customer,
        ]);
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $this->profileService->changePassword($request->user(), $request->validated());

        return response()->json([
            'message' => 'Đổi mật khẩu thành công',
        ]);
    }

    public function uploadAvatar(\App\Http\Requests\UploadAvatarRequest $request, \App\Services\Cloudinary\CloudinaryService $cloudinary)
    {
        $customer = $request->user();
        $oldPublicId = $customer->avatar_public_id;

        $result = $cloudinary->uploadAvatar($request->file('avatar'), 'customers');

        if (!$result) {
            return response()->json([
                'message' => 'Lỗi khi tải ảnh lên, vui lòng thử lại sau.'
            ], 500);
        }

        try {
            $customer->avatar = $result['url'];
            $customer->avatar_public_id = $result['public_id'];
            $customer->save();

            if ($oldPublicId) {
                $cloudinary->delete($oldPublicId);
            }

            return response()->json([
                'message' => 'Cập nhật ảnh đại diện thành công',
                'customer' => $customer,
            ]);
        } catch (\Exception $e) {
            $cloudinary->delete($result['public_id']);
            throw $e;
        }
    }

    public function removeAvatar(Request $request, \App\Services\Cloudinary\CloudinaryService $cloudinary)
    {
        $customer = $request->user();
        
        if ($customer->avatar_public_id) {
            $cloudinary->delete($customer->avatar_public_id);
            $customer->avatar = null;
            $customer->avatar_public_id = null;
            $customer->save();
        } elseif ($customer->avatar) {
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($customer->avatar)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($customer->avatar);
            }
            $customer->avatar = null;
            $customer->avatar_public_id = null;
            $customer->save();
        }

        return response()->json([
            'message' => 'Đã xóa ảnh đại diện',
            'customer' => $customer,
        ]);
    }
}
