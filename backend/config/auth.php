<?php

return [

    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],


    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],

        // ADMIN
        'admin' => [
            'driver' => 'session',
            'provider' => 'admins',
        ],

        // STAFF
        'staff' => [
            'driver' => 'session',
            'provider' => 'staffs',
        ],

        // CUSTOMER
        'customer' => [
            'driver' => 'session', // Sanctum will intercept this, but standard practice is ok
            'provider' => 'customers',
        ],
    ],


    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => env('AUTH_MODEL', App\Models\User::class),
        ],

        // ADMIN
        'admins' => [
            'driver' => 'eloquent',
            'model' => App\Models\Admin::class,
        ],

        // STAFF
        'staffs' => [
            'driver' => 'eloquent',
            'model' => App\Models\Staff::class,
        ],

        // CUSTOMER
        'customers' => [
            'driver' => 'eloquent',
            'model' => App\Models\Customer::class,
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
        // ADMIN
        'admins' => [
            'provider' => 'admins',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
        // CUSTOMER
        'customers' => [
            'provider' => 'customers',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];
