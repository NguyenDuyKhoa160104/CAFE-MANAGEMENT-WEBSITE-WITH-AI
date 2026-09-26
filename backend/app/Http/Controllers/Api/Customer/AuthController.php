<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\Auth\LoginRequest;
use App\Http\Requests\Customer\Auth\RegisterRequest;
use App\Services\Customer\CustomerAuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(CustomerAuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(RegisterRequest $request)
    {
        $result = $this->authService->register($request->validated());

        return response()->json([
            'message' => 'Đăng ký thành công',
            'customer' => $result['customer'],
            'token' => $result['token'],
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $result = $this->authService->login($request->validated());

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'customer' => $result['customer'],
            'token' => $result['token'],
        ]);
    }

    public function info(Request $request)
    {
        return response()->json([
            'customer' => $request->user(),
        ]);
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return response()->json([
            'message' => 'Đăng xuất thành công',
        ]);
    }

    public function logoutAll(Request $request)
    {
        $this->authService->logoutAll($request->user());

        return response()->json([
            'message' => 'Đăng xuất tất cả thiết bị thành công',
        ]);
    }
}
