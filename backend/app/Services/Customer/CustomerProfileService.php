<?php

namespace App\Services\Customer;

use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CustomerProfileService
{
    public function updateProfile($customer, array $data)
    {
        $customer->update([
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
        ]);

        return $customer;
    }

    public function changePassword($customer, array $data)
    {
        $customer->update([
            'password' => Hash::make($data['password']),
        ]);

        return $customer;
    }
}
