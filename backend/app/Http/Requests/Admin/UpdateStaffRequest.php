<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStaffRequest extends FormRequest
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
        $id = $this->route('staff');

        return [
            'staff_code' => 'required|string|max:20|unique:staffs,staff_code,' . $id,
            'full_name' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:staffs,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'position' => 'required|in:MANAGER,CASHIER,BARISTA,SERVER',
            'role_id' => 'nullable|exists:roles,id',
            'hire_date' => 'nullable|date',
            'base_salary' => 'nullable|numeric|min:0',
            'status' => 'required|in:ACTIVE,INACTIVE,LOCKED',
        ];
    }
}
