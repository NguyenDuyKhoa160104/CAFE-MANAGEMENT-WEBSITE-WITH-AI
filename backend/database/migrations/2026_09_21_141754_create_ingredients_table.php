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
        Schema::create('ingredients', function (Blueprint $table) {
            $table->id();
            $table->string('ingredient_code', 30)->unique();
            $table->string('name', 150);
            $table->enum('unit', ['GRAM', 'MILLILITER', 'PIECE']);
            $table->decimal('current_stock', 14, 3)->default(0);
            $table->decimal('minimum_stock', 14, 3)->default(0);
            $table->decimal('average_cost', 14, 4)->default(0);
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ingredients');
    }
};
