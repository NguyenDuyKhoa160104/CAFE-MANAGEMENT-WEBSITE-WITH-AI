<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_receipt_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_receipt_id')->constrained('stock_receipts')->cascadeOnDelete();
            $table->foreignId('ingredient_id')->nullable()->constrained('ingredients')->nullOnDelete();
            $table->string('ingredient_name', 150);
            $table->enum('unit', ['GRAM', 'MILLILITER', 'PIECE']);
            $table->decimal('quantity', 14, 3);
            $table->decimal('unit_cost', 14, 4);
            $table->decimal('line_total', 14, 2);
            $table->timestamps();
            
            // Note: Validation rule will ensure no duplicate ingredient_id per receipt,
            // but we don't put a DB unique constraint on (stock_receipt_id, ingredient_id)
            // in case ingredient_id becomes NULL when an ingredient is soft-deleted or similar,
            // or if the business allows multiple lines of the same item in the future.
            // The user said: "Validation phải reject duplicate ingredient."
            $table->unique(['stock_receipt_id', 'ingredient_id']); // Let's add it anyway as per best practice for 1 item/receipt rule.
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_receipt_items');
    }
};
