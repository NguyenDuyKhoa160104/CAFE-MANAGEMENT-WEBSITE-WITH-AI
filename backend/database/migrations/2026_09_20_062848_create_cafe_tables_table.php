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
        Schema::create('cafe_tables', function (Blueprint $table) {
            $table->id();
            $table->string('table_code', 30)->unique();
            $table->foreignId('area_id')
                  ->constrained('areas')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();
            $table->string('name', 100);
            $table->unsignedInteger('capacity')->default(2);
            $table->enum('status', [
                'AVAILABLE',
                'OCCUPIED',
                'RESERVED',
                'INACTIVE'
            ])->default('AVAILABLE');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cafe_tables');
    }
};
