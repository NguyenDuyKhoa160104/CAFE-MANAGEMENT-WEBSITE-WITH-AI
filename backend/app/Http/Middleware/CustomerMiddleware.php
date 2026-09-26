<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !($user instanceof \App\Models\Customer)) {
            return response()->json(['message' => 'Forbidden. Customer access only.'], 403);
        }

        if ($user->status !== 'ACTIVE') {
            return response()->json(['message' => 'Account is inactive.'], 403);
        }

        return $next($request);
    }
}
