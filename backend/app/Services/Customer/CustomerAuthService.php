<?php

namespace App\Services\Customer;

use App\Models\Customer;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CustomerAuthService
{
    public function register(array $data)
    {
        $customer = Customer::create([
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'status' => 'ACTIVE',
        ]);

        $token = $customer->createToken('customer_token')->plainTextToken;

        return [
            'customer' => $customer,
            'token' => $token,
        ];
    }

    public function login(array $data)
    {
        $customer = Customer::where('email', $data['email'])->first();

        if (!$customer || !Hash::check($data['password'], $customer->password)) {
            throw ValidationException::withMessages([
                'email' => ['Thông tin đăng nhập không chính xác.'],
            ]);
        }

        if ($customer->status !== 'ACTIVE') {
            throw ValidationException::withMessages([
                'email' => ['Tài khoản đã bị khóa.'],
            ]);
        }

        $token = $customer->createToken('customer_token')->plainTextToken;

        return [
            'customer' => $customer,
            'token' => $token,
        ];
    }

    public function logout($customer)
    {
        if ($customer->currentAccessToken()) {
            $customer->currentAccessToken()->delete();
        }
    }

    public function logoutAll($customer)
    {
        $customer->tokens()->delete();
    }
}
