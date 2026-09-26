<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;

// ==========================================
// CUSTOMER PUBLIC ROUTES
// ==========================================
Route::post('/customer/register', [\App\Http\Controllers\Api\Customer\AuthController::class, 'register']);
Route::post('/customer/login', [\App\Http\Controllers\Api\Customer\AuthController::class, 'login']);

Route::get('/customer/categories', [\App\Http\Controllers\Api\Customer\MenuController::class, 'categories']);
Route::get('/customer/products', [\App\Http\Controllers\Api\Customer\MenuController::class, 'products']);
Route::get('/customer/products/{id}', [\App\Http\Controllers\Api\Customer\MenuController::class, 'productDetail']);

// Customer AI
Route::get('/customer/ai/config', [\App\Http\Controllers\Api\Customer\AIChatController::class, 'config']);
Route::post('/customer/ai/chat', [\App\Http\Controllers\Api\Customer\AIChatController::class, 'chat']);
// ==========================================
// CUSTOMER PROTECTED ROUTES
// ==========================================
Route::middleware(['auth:sanctum', 'customer_middleware'])->group(function () {
    // Auth
    Route::get('/customer/info', [\App\Http\Controllers\Api\Customer\AuthController::class, 'info']);
    Route::post('/customer/logout', [\App\Http\Controllers\Api\Customer\AuthController::class, 'logout']);
    Route::post('/customer/logout-all', [\App\Http\Controllers\Api\Customer\AuthController::class, 'logoutAll']);

    // Profile
    Route::get('/customer/profile', [\App\Http\Controllers\Api\Customer\ProfileController::class, 'show']);
    Route::put('/customer/profile', [\App\Http\Controllers\Api\Customer\ProfileController::class, 'update']);
    Route::patch('/customer/profile/password', [\App\Http\Controllers\Api\Customer\ProfileController::class, 'changePassword']);
    Route::post('/customer/profile/avatar', [\App\Http\Controllers\Api\Customer\ProfileController::class, 'uploadAvatar']);
    Route::delete('/customer/profile/avatar', [\App\Http\Controllers\Api\Customer\ProfileController::class, 'removeAvatar']);

    // Reservations
    Route::get('/customer/reservations/available-tables', [\App\Http\Controllers\Api\Customer\ReservationController::class, 'availableTables']);
    Route::get('/customer/reservations', [\App\Http\Controllers\Api\Customer\ReservationController::class, 'index']);
    Route::post('/customer/reservations', [\App\Http\Controllers\Api\Customer\ReservationController::class, 'store']);
    Route::get('/customer/reservations/{id}', [\App\Http\Controllers\Api\Customer\ReservationController::class, 'show']);
    Route::patch('/customer/reservations/{id}/cancel', [\App\Http\Controllers\Api\Customer\ReservationController::class, 'cancel']);

    // Orders
    Route::get('/customer/orders', [\App\Http\Controllers\Api\Customer\OrderController::class, 'index']);
    Route::post('/customer/orders', [\App\Http\Controllers\Api\Customer\OrderController::class, 'store']);
    Route::get('/customer/orders/{id}', [\App\Http\Controllers\Api\Customer\OrderController::class, 'show']);
    Route::patch('/customer/orders/{id}/cancel', [\App\Http\Controllers\Api\Customer\OrderController::class, 'cancel']);

    // Invoices
    Route::get('/customer/invoices', [\App\Http\Controllers\Api\Customer\InvoiceController::class, 'index']);
    Route::get('/customer/invoices/{id}', [\App\Http\Controllers\Api\Customer\InvoiceController::class, 'show']);
});

// LOGIN ADMIN
Route::post('/admin/login', [AdminController::class, 'login']);

// LOGIN STAFF
Route::post('/staff/login', [\App\Http\Controllers\Api\Staff\StaffAuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'staff_middleware'])->group(function () {
    Route::get('/staff/info', [\App\Http\Controllers\Api\Staff\StaffAuthController::class, 'info']);
    Route::post('/staff/logout', [\App\Http\Controllers\Api\Staff\StaffAuthController::class, 'logout']);
    Route::post('/staff/logout-all', [\App\Http\Controllers\Api\Staff\StaffAuthController::class, 'logoutAll']);
    
    // Profile
    Route::post('/staff/profile/avatar', [\App\Http\Controllers\Api\Staff\StaffAuthController::class, 'uploadAvatar']);
    Route::delete('/staff/profile/avatar', [\App\Http\Controllers\Api\Staff\StaffAuthController::class, 'removeAvatar']);

    // Staff Table & Area
    Route::get('/staff/areas', [\App\Http\Controllers\Api\Staff\TableController::class, 'getAreas']);
    Route::get('/staff/tables', [\App\Http\Controllers\Api\Staff\TableController::class, 'getTables']);
    Route::get('/staff/tables/{id}', [\App\Http\Controllers\Api\Staff\TableController::class, 'getTableDetail']);

    // Staff Menu
    Route::get('/staff/categories', [\App\Http\Controllers\Api\Staff\MenuController::class, 'getCategories']);
    Route::get('/staff/products', [\App\Http\Controllers\Api\Staff\MenuController::class, 'getProducts']);
    Route::get('/staff/products/{id}', [\App\Http\Controllers\Api\Staff\MenuController::class, 'getProductDetail']);

    // Staff Orders
    Route::get('/staff/orders', [\App\Http\Controllers\Api\Staff\OrderController::class, 'index']);
    Route::post('/staff/orders', [\App\Http\Controllers\Api\Staff\OrderController::class, 'store']);
    Route::get('/staff/orders/{id}', [\App\Http\Controllers\Api\Staff\OrderController::class, 'show']);
    Route::put('/staff/orders/{id}', [\App\Http\Controllers\Api\Staff\OrderController::class, 'update']);
    Route::post('/staff/orders/{id}/items', [\App\Http\Controllers\Api\Staff\OrderController::class, 'addItem']);
    Route::put('/staff/orders/{id}/items/{itemId}', [\App\Http\Controllers\Api\Staff\OrderController::class, 'updateItem']);
    Route::delete('/staff/orders/{id}/items/{itemId}', [\App\Http\Controllers\Api\Staff\OrderController::class, 'removeItem']);
    Route::patch('/staff/orders/{id}/status', [\App\Http\Controllers\Api\Staff\OrderController::class, 'updateStatus']);
    Route::patch('/staff/orders/{id}/cancel', [\App\Http\Controllers\Api\Staff\OrderController::class, 'cancel']);
    Route::post('/staff/orders/{id}/checkout', [\App\Http\Controllers\Api\Staff\OrderController::class, 'checkout']);

    // Staff Invoices
    Route::get('/staff/invoices', [\App\Http\Controllers\Api\Staff\InvoiceController::class, 'index']);
    Route::get('/staff/invoices/{id}', [\App\Http\Controllers\Api\Staff\InvoiceController::class, 'show']);
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
    Route::post('/admin/profile/avatar', [\App\Http\Controllers\Api\Admin\AdminProfileController::class, 'uploadAvatar']);
    Route::delete('/admin/profile/avatar', [\App\Http\Controllers\Api\Admin\AdminProfileController::class, 'removeAvatar']);
    // Categories
    Route::get('/admin/categories', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'index']);
    Route::post('/admin/categories', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'store']);
    Route::get('/admin/categories/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'show']);
    Route::put('/admin/categories/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'update']);
    Route::post('/admin/categories/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'update']); // Fallback for multipart form-data
    Route::delete('/admin/categories/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'destroy']);
    Route::patch('/admin/categories/{id}/status', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'updateStatus']);
    Route::delete('/admin/categories/{id}/image', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'removeImage']);

    // Products
    Route::get('/admin/products', [\App\Http\Controllers\Api\Admin\ProductController::class, 'index']);
    Route::post('/admin/products', [\App\Http\Controllers\Api\Admin\ProductController::class, 'store']);
    Route::get('/admin/products/{id}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'show']);
    Route::put('/admin/products/{id}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'update']);
    Route::post('/admin/products/{id}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'update']); // Fallback for multipart form-data
    Route::delete('/admin/products/{id}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'destroy']);
    Route::patch('/admin/products/{id}/status', [\App\Http\Controllers\Api\Admin\ProductController::class, 'updateStatus']);
    Route::patch('/admin/products/{id}/featured', [\App\Http\Controllers\Api\Admin\ProductController::class, 'toggleFeatured']);
    Route::delete('/admin/products/{id}/image', [\App\Http\Controllers\Api\Admin\ProductController::class, 'removeImage']);

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

    // Orders
    Route::get('/admin/orders', [\App\Http\Controllers\Api\Admin\OrderController::class, 'index']);
    Route::get('/admin/orders/summary', [\App\Http\Controllers\Api\Admin\OrderController::class, 'summary']);
    Route::get('/admin/orders/{id}', [\App\Http\Controllers\Api\Admin\OrderController::class, 'show']);

    // Invoices
    Route::get('/admin/invoices/summary', [\App\Http\Controllers\Api\Admin\InvoiceController::class, 'dashboardSummary']);
    Route::get('/admin/invoices', [\App\Http\Controllers\Api\Admin\InvoiceController::class, 'index']);
    Route::get('/admin/invoices/{id}', [\App\Http\Controllers\Api\Admin\InvoiceController::class, 'show']);

    // Inventory - Ingredients
    Route::get('/admin/inventory/ingredients', [\App\Http\Controllers\Api\Admin\IngredientController::class, 'index']);
    Route::post('/admin/inventory/ingredients', [\App\Http\Controllers\Api\Admin\IngredientController::class, 'store']);
    Route::get('/admin/inventory/ingredients/{id}', [\App\Http\Controllers\Api\Admin\IngredientController::class, 'show']);
    Route::put('/admin/inventory/ingredients/{id}', [\App\Http\Controllers\Api\Admin\IngredientController::class, 'update']);
    Route::patch('/admin/inventory/ingredients/{id}/status', [\App\Http\Controllers\Api\Admin\IngredientController::class, 'updateStatus']);
    Route::delete('/admin/inventory/ingredients/{id}', [\App\Http\Controllers\Api\Admin\IngredientController::class, 'destroy']);

    // Inventory - Recipes
    Route::get('/admin/inventory/recipes/{productId}', [\App\Http\Controllers\Api\Admin\RecipeController::class, 'show']);
    Route::put('/admin/inventory/recipes/{productId}', [\App\Http\Controllers\Api\Admin\RecipeController::class, 'update']);

    // Inventory - Stock Receipts
    Route::get('/admin/inventory/receipts', [\App\Http\Controllers\Api\Admin\StockReceiptController::class, 'index']);
    Route::post('/admin/inventory/receipts', [\App\Http\Controllers\Api\Admin\StockReceiptController::class, 'store']);
    Route::get('/admin/inventory/receipts/{id}', [\App\Http\Controllers\Api\Admin\StockReceiptController::class, 'show']);
    Route::put('/admin/inventory/receipts/{id}', [\App\Http\Controllers\Api\Admin\StockReceiptController::class, 'update']);
    Route::post('/admin/inventory/receipts/{id}/complete', [\App\Http\Controllers\Api\Admin\StockReceiptController::class, 'complete']);
    Route::post('/admin/inventory/receipts/{id}/cancel', [\App\Http\Controllers\Api\Admin\StockReceiptController::class, 'cancel']);

    // Inventory - General
    Route::get('/admin/inventory/summary', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'summary']);
    Route::get('/admin/inventory/transactions', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'transactions']);
    Route::get('/admin/inventory/low-stock', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'lowStock']);
    Route::get('/admin/inventory/detail/{id}', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'ingredientDetail']);
    Route::post('/admin/inventory/adjust', [\App\Http\Controllers\Api\Admin\InventoryController::class, 'adjust']);

    // Admin AI
    Route::get('/admin/ai/settings', [\App\Http\Controllers\Api\Admin\AISettingController::class, 'index']);
    Route::put('/admin/ai/settings', [\App\Http\Controllers\Api\Admin\AISettingController::class, 'update']);
    
    Route::get('/admin/ai/overview', [\App\Http\Controllers\Api\Admin\AIOverviewController::class, 'index']);
    
    Route::get('/admin/ai/conversations', [\App\Http\Controllers\Api\Admin\AIConversationController::class, 'index']);
    Route::get('/admin/ai/conversations/{id}', [\App\Http\Controllers\Api\Admin\AIConversationController::class, 'show']);
    
    Route::get('/admin/ai/knowledge', [\App\Http\Controllers\Api\Admin\AIKnowledgeController::class, 'index']);
    Route::post('/admin/ai/knowledge', [\App\Http\Controllers\Api\Admin\AIKnowledgeController::class, 'store']);
    Route::get('/admin/ai/knowledge/{id}', [\App\Http\Controllers\Api\Admin\AIKnowledgeController::class, 'show']);
    Route::put('/admin/ai/knowledge/{id}', [\App\Http\Controllers\Api\Admin\AIKnowledgeController::class, 'update']);
    Route::patch('/admin/ai/knowledge/{id}/status', [\App\Http\Controllers\Api\Admin\AIKnowledgeController::class, 'updateStatus']);
    Route::delete('/admin/ai/knowledge/{id}', [\App\Http\Controllers\Api\Admin\AIKnowledgeController::class, 'destroy']);
});
