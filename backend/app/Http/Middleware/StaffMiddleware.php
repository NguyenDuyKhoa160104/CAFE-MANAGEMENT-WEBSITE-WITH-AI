<?php

namespace App\Http\Middleware;

use App\Models\Staff;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaffMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user instanceof Staff) {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập'
            ], 403);
        }

        if ($user->status !== 'ACTIVE') {
            return response()->json([
                'message' => $user->status === 'LOCKED'
                    ? 'Tài khoản nhân viên đã bị khóa'
                    : 'Tài khoản nhân viên đã ngừng hoạt động'
            ], 403);
        }

        return $next($request);
    }
}
