<?php

namespace App\Http\Requests\Staff\Order;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CheckoutOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method' => 'required|in:CASH,BANK_TRANSFER',
            'transfer_confirmed' => 'exclude_if:payment_method,CASH|required_if:payment_method,BANK_TRANSFER|boolean|accepted',
            'transaction_reference' => 'nullable|string|max:255',
            'note' => 'nullable|string|max:1000',
        ];
    }

    public function messages()
    {
        return [
            'payment_method.required' => 'Vui lòng chọn phương thức thanh toán.',
            'payment_method.in' => 'Phương thức thanh toán không hợp lệ.',
            'transfer_confirmed.required_if' => 'Vui lòng xác nhận đã nhận được tiền chuyển khoản.',
            'transfer_confirmed.accepted' => 'Vui lòng xác nhận đã nhận được tiền chuyển khoản.',
        ];
    }
}
