<?php

namespace App\Http\Requests\Admin\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'track_inventory' => 'required|boolean',
            'ingredients' => 'exclude_if:track_inventory,false|required_if:track_inventory,true|array|min:1',
            'ingredients.*.ingredient_id' => 'required|exists:ingredients,id|distinct',
            'ingredients.*.quantity_required' => 'required|numeric|gt:0',
        ];
    }
    
    public function messages()
    {
        return [
            'ingredients.*.ingredient_id.distinct' => 'Không được cấu hình trùng lặp nguyên liệu.',
            'ingredients.*.quantity_required.gt' => 'Số lượng nguyên liệu phải lớn hơn 0.',
        ];
    }
}
