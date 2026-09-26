<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('promotion_code', 50)->unique();
            $table->string('name', 150);
            $table->text('description')->nullable();
            
            $table->enum('application_mode', ['AUTO', 'CODE']);
            $table->enum('discount_type', ['PERCENTAGE', 'FIXED_AMOUNT']);
            $table->enum('scope', ['ORDER', 'CATEGORY', 'PRODUCT']);
            
            $table->decimal('discount_value', 15, 2);
            $table->decimal('max_discount_amount', 15, 2)->nullable();
            $table->decimal('min_order_amount', 15, 2)->nullable();
            
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            
            $table->unsignedInteger('priority')->default(100);
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            
            $table->string('banner_image')->nullable();
            $table->string('banner_image_public_id')->nullable();
            
            $table->foreignId('created_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('admins')->nullOnDelete();
            
            $table->timestamps();
        });

        Schema::create('promotion_products', function (Blueprint $table) {
            $table->foreignId('promotion_id')->constrained('promotions')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->unique(['promotion_id', 'product_id']);
        });

        Schema::create('promotion_categories', function (Blueprint $table) {
            $table->foreignId('promotion_id')->constrained('promotions')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->unique(['promotion_id', 'category_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('promotion_code')->nullable()->after('subtotal');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('discount_amount', 15, 2)->default(0)->after('line_total');
            $table->decimal('final_line_total', 15, 2)->nullable()->after('discount_amount');
        });

        Schema::create('order_promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('promotion_id')->nullable()->constrained('promotions')->nullOnDelete();
            
            $table->string('promotion_code')->nullable();
            $table->string('promotion_name', 150);
            
            $table->string('application_mode');
            $table->string('discount_type');
            $table->string('scope');
            
            $table->decimal('discount_value', 15, 2);
            $table->decimal('discount_amount', 15, 2);
            
            $table->json('snapshot')->nullable();
            $table->dateTime('applied_at');
            
            $table->timestamps();
        });

        Schema::create('promotion_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_id')->constrained('promotions')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->unsignedBigInteger('customer_id')->nullable()->index();
            $table->enum('status', ['RESERVED', 'CONSUMED', 'RELEASED']);
            $table->dateTime('used_at')->nullable();
            $table->timestamps();
            
            $table->unique(['promotion_id', 'order_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotion_usages');
        Schema::dropIfExists('order_promotions');
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['discount_amount', 'final_line_total']);
        });
        
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('promotion_code');
        });
        
        Schema::dropIfExists('promotion_categories');
        Schema::dropIfExists('promotion_products');
        Schema::dropIfExists('promotions');
    }
};
