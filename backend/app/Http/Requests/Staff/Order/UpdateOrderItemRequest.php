<?php

namespace App\Http\Requests\Staff\Order;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quantity' => ['nullable', 'integer', 'min:1'],
            'note' => ['nullable', 'string'],
        ];
    }
}
