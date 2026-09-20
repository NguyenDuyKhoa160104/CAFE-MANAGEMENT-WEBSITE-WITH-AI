<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCafeTableRequest extends FormRequest
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
        return [
            'table_code' => 'required|string|max:30|unique:cafe_tables,table_code',
            'area_id' => 'required|exists:areas,id',
            'name' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1|max:50',
            'status' => 'required|in:AVAILABLE,OCCUPIED,RESERVED,INACTIVE',
            'sort_order' => 'nullable|integer|min:0',
        ];
    }
}
