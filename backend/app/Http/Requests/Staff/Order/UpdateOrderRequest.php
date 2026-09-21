<?php

namespace App\Http\Requests\Staff\Order;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_type' => ['nullable', 'in:WALK_IN,MEMBER'],
            'customer_id' => ['nullable', 'integer'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:20'],
            'note' => ['nullable', 'string'],
        ];
    }
}
