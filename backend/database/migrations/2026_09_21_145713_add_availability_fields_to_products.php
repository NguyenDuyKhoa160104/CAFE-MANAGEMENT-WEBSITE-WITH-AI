<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Services\Inventory\ProductAvailabilityService;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('recipe_configured')->default(false)->after('track_inventory');
            $table->boolean('inventory_available')->default(false)->after('recipe_configured');
            $table->unsignedInteger('max_producible_quantity')->default(0)->after('inventory_available');
        });

        // 1. Ensure track_inventory is true for all products
        DB::table('products')->update(['track_inventory' => true]);

        // 2. Backfill the new fields
        $availabilityService = app(ProductAvailabilityService::class);
        $products = Product::all();
        foreach ($products as $product) {
            $availabilityService->calculateForProduct($product);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            //
        });
    }
};
