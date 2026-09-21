<?php

namespace App\Http\Requests\Admin\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ingredient_id' => 'required|exists:ingredients,id',
            'type' => 'required|in:ADJUSTMENT_IN,ADJUSTMENT_OUT,WASTE',
            'quantity' => 'required|numeric|gt:0',
            'reason' => 'required|string|max:1000',
        ];
    }
}
