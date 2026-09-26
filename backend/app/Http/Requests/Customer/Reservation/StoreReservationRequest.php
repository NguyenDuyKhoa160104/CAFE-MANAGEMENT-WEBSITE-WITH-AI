<?php

namespace App\Http\Requests\Customer\Reservation;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'table_id' => ['required', 'exists:cafe_tables,id'],
            'reservation_at' => ['required', 'date', 'after:now'],
            'party_size' => ['required', 'integer', 'min:1'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
