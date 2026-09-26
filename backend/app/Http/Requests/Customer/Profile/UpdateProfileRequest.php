<?php

namespace App\Http\Requests\Customer\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $customerId = $this->user()->id;
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:customers,email,' . $customerId],
            'phone' => ['nullable', 'string', 'max:20', 'unique:customers,phone,' . $customerId],
        ];
    }
}
