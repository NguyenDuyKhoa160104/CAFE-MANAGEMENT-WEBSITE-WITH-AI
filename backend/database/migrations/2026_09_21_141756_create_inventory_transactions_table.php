<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_code', 50)->unique();
            $table->foreignId('ingredient_id')->constrained('ingredients')->restrictOnDelete();
            $table->enum('type', ['IMPORT', 'ORDER_CONSUMPTION', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'WASTE']);
            $table->decimal('quantity_change', 14, 3);
            $table->decimal('balance_before', 14, 3);
            $table->decimal('balance_after', 14, 3);
            
            $table->string('reference_type', 50)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            
            $table->foreignId('admin_id')->nullable()->constrained('admins')->nullOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('staffs')->nullOnDelete();
            
            $table->text('note')->nullable();
            $table->timestamps();
            
            $table->index('ingredient_id');
            $table->index('type');
            $table->index(['reference_type', 'reference_id']);
            $table->index('created_at');
            
            // As requested by user: (reference_type, reference_id, ingredient_id, type) to support deduplication
            $table->unique(['reference_type', 'reference_id', 'ingredient_id', 'type'], 'inv_trans_dedup_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};
