<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $admin = $this->user();

        return [
            'full_name' => 'required|string|max:100',
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('admins', 'email')->ignore($admin->id),
            ],
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Họ và tên không được để trống',
            'full_name.max' => 'Họ và tên không được vượt quá 100 ký tự',
            'email.required' => 'Email không được để trống',
            'email.email' => 'Email không đúng định dạng',
            'email.max' => 'Email không được vượt quá 150 ký tự',
            'email.unique' => 'Email này đã được sử dụng bởi quản trị viên khác',
            'phone.max' => 'Số điện thoại không được vượt quá 20 ký tự',
            'avatar.image' => 'File tải lên phải là hình ảnh',
            'avatar.mimes' => 'Hình ảnh phải có định dạng jpg, jpeg, png, webp',
            'avatar.max' => 'Kích thước hình ảnh không được vượt quá 2MB',
        ];
    }
}
