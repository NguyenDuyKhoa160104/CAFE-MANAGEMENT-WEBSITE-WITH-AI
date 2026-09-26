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
        Schema::create('customer_vouchers', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('promotion_id')->constrained('promotions')->cascadeOnDelete();
            
            $table->string('voucher_code', 100)->nullable();
            
            $table->enum('status', ['UNUSED', 'RESERVED', 'USED', 'EXPIRED', 'REVOKED'])->default('UNUSED');
            
            $table->foreignId('assigned_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->dateTime('assigned_at')->nullable();
            
            $table->dateTime('used_at')->nullable();
            $table->foreignId('used_order_id')->nullable()->constrained('orders')->nullOnDelete();
            
            $table->dateTime('expires_at')->nullable();
            
            $table->text('note')->nullable();
            
            $table->timestamps();
            
            $table->index('customer_id');
            $table->index('promotion_id');
            $table->index('status');
            $table->index('expires_at');
        });
        
        // Add customer_voucher_id to orders
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('customer_voucher_id')->nullable()->after('promotion_code')->constrained('customer_vouchers')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['customer_voucher_id']);
            $table->dropColumn('customer_voucher_id');
        });
        Schema::dropIfExists('customer_vouchers');
    }
};
