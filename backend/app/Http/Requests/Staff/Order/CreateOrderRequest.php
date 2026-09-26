<?php

namespace App\Http\Requests\Staff\Order;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorized by staff_middleware
    }

    public function rules(): array
    {
        return [
            'order_type' => ['required', 'in:DINE_IN,TAKEAWAY'],
            'table_id' => ['required_if:order_type,DINE_IN', 'nullable', 'exists:cafe_tables,id'],
            'customer_type' => ['nullable', 'in:WALK_IN,MEMBER'],
            'customer_id' => ['nullable', 'integer'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:20'],
            'note' => ['nullable', 'string'],
            'items' => ['nullable', 'array'],
            'items.*.product_id' => ['required_with:items', 'exists:products,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.note' => ['nullable', 'string'],
            'promotion_code' => ['nullable', 'string', 'max:50'],
        ];
    }
}
