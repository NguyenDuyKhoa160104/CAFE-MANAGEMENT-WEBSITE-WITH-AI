<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'admin_middleware' => \App\Http\Middleware\AdminMiddleware::class,
            'staff_middleware' => \App\Http\Middleware\StaffMiddleware::class,
            'customer_middleware' => \App\Http\Middleware\CustomerMiddleware::class,
            'staff.permission' => \App\Http\Middleware\StaffPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
