<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user instanceof Admin) {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập'
            ], 403);
        }

        // if ($user->status !== 'ACTIVE') {
        //     return response()->json([
        //         'message' => 'Tài khoản Admin không hoạt động'
        //     ], 403);
        // }

        return $next($request);
    }
}
