<?php

namespace App\Http\Requests\Admin\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIngredientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'ingredient_code' => 'required|string|max:30|unique:ingredients,ingredient_code,' . $id,
            'name' => 'required|string|max:150',
            'unit' => 'required|in:GRAM,MILLILITER,PIECE',
            'minimum_stock' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:ACTIVE,INACTIVE',
            'description' => 'nullable|string|max:1000',
        ];
    }
}
