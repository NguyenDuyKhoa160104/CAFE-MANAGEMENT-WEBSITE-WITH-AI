<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;

// LOGIN ADMIN
Route::post('/admin/login', [AdminController::class, 'login']);

// LOGIN STAFF
Route::post('/staff/login', [\App\Http\Controllers\Api\Staff\StaffAuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'staff_middleware'])->group(function () {
    Route::get('/staff/info', [\App\Http\Controllers\Api\Staff\StaffAuthController::class, 'info']);
    Route::post('/staff/logout', [\App\Http\Controllers\Api\Staff\StaffAuthController::class, 'logout']);
    Route::post('/staff/logout-all', [\App\Http\Controllers\Api\Staff\StaffAuthController::class, 'logoutAll']);
});

Route::middleware(['auth:sanctum', 'admin_middleware'])->group(function () {
    Route::post('/admin/info', [AdminController::class, 'info']);
    Route::post('/admin/logout', [AdminController::class, 'logout']);
    Route::post('/admin/logout-all', [AdminController::class, 'logoutAll']);

    // Profile
    Route::get('/admin/profile', [\App\Http\Controllers\Api\Admin\AdminProfileController::class, 'show']);
    Route::put('/admin/profile', [\App\Http\Controllers\Api\Admin\AdminProfileController::class, 'update']);
    Route::post('/admin/profile', [\App\Http\Controllers\Api\Admin\AdminProfileController::class, 'update']); // Fallback for multipart form-data
    Route::patch('/admin/profile/password', [\App\Http\Controllers\Api\Admin\AdminProfileController::class, 'changePassword']);
    Route::delete('/admin/profile/avatar', [\App\Http\Controllers\Api\Admin\AdminProfileController::class, 'removeAvatar']);
    // Categories
    Route::get('/admin/categories', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'index']);
    Route::post('/admin/categories', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'store']);
    Route::get('/admin/categories/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'show']);
    Route::put('/admin/categories/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'update']);
    Route::delete('/admin/categories/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'destroy']);
    Route::patch('/admin/categories/{id}/status', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'updateStatus']);

    // Products
    Route::get('/admin/products', [\App\Http\Controllers\Api\Admin\ProductController::class, 'index']);
    Route::post('/admin/products', [\App\Http\Controllers\Api\Admin\ProductController::class, 'store']);
    Route::get('/admin/products/{id}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'show']);
    Route::put('/admin/products/{id}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'update']);
    Route::delete('/admin/products/{id}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'destroy']);
    Route::patch('/admin/products/{id}/status', [\App\Http\Controllers\Api\Admin\ProductController::class, 'updateStatus']);
    Route::patch('/admin/products/{id}/featured', [\App\Http\Controllers\Api\Admin\ProductController::class, 'toggleFeatured']);

    // Areas
    Route::get('/admin/areas', [\App\Http\Controllers\Api\Admin\AreaController::class, 'index']);
    Route::post('/admin/areas', [\App\Http\Controllers\Api\Admin\AreaController::class, 'store']);
    Route::get('/admin/areas/{id}', [\App\Http\Controllers\Api\Admin\AreaController::class, 'show']);
    Route::put('/admin/areas/{id}', [\App\Http\Controllers\Api\Admin\AreaController::class, 'update']);
    Route::delete('/admin/areas/{id}', [\App\Http\Controllers\Api\Admin\AreaController::class, 'destroy']);
    Route::patch('/admin/areas/{id}/status', [\App\Http\Controllers\Api\Admin\AreaController::class, 'updateStatus']);

    // Tables
    Route::get('/admin/tables', [\App\Http\Controllers\Api\Admin\CafeTableController::class, 'index']);
    Route::post('/admin/tables', [\App\Http\Controllers\Api\Admin\CafeTableController::class, 'store']);
    Route::get('/admin/tables/{id}', [\App\Http\Controllers\Api\Admin\CafeTableController::class, 'show']);
    Route::put('/admin/tables/{id}', [\App\Http\Controllers\Api\Admin\CafeTableController::class, 'update']);
    Route::delete('/admin/tables/{id}', [\App\Http\Controllers\Api\Admin\CafeTableController::class, 'destroy']);
    Route::patch('/admin/tables/{id}/status', [\App\Http\Controllers\Api\Admin\CafeTableController::class, 'updateStatus']);

    // Staffs
    Route::get('/admin/staffs', [\App\Http\Controllers\Api\Admin\StaffController::class, 'index']);
    Route::post('/admin/staffs', [\App\Http\Controllers\Api\Admin\StaffController::class, 'store']);
    Route::get('/admin/staffs/{id}', [\App\Http\Controllers\Api\Admin\StaffController::class, 'show']);
    Route::put('/admin/staffs/{id}', [\App\Http\Controllers\Api\Admin\StaffController::class, 'update']);
    Route::post('/admin/staffs/{id}', [\App\Http\Controllers\Api\Admin\StaffController::class, 'update']); // Fallback for multipart form-data
    Route::delete('/admin/staffs/{id}', [\App\Http\Controllers\Api\Admin\StaffController::class, 'destroy']);
    Route::patch('/admin/staffs/{id}/status', [\App\Http\Controllers\Api\Admin\StaffController::class, 'updateStatus']);
    Route::patch('/admin/staffs/{id}/reset-password', [\App\Http\Controllers\Api\Admin\StaffController::class, 'resetPassword']);
});
