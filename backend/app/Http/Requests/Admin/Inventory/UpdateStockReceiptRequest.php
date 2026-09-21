<?php

namespace App\Http\Requests\Admin\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStockReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_name' => 'nullable|string|max:150',
            'note' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.ingredient_id' => 'required|exists:ingredients,id|distinct',
            'items.*.quantity' => 'required|numeric|gt:0',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ];
    }
    
    public function messages()
    {
        return [
            'items.*.ingredient_id.distinct' => 'Không được cấu hình trùng lặp nguyên liệu trong một phiếu nhập.',
        ];
    }
}
