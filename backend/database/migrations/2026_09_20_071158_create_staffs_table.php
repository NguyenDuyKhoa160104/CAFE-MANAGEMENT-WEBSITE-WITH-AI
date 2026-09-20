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
        Schema::create('staffs', function (Blueprint $table) {
            $table->id();
            $table->string('staff_code', 20)->unique();
            $table->string('full_name', 100);
            $table->string('email', 150)->unique();
            $table->string('phone', 20)->nullable();
            $table->string('password');
            $table->string('avatar')->nullable();
            $table->enum('position', [
                'MANAGER',
                'CASHIER',
                'BARISTA',
                'SERVER'
            ])->default('SERVER');
            $table->date('hire_date')->nullable();
            $table->decimal('base_salary', 12, 2)->nullable();
            $table->enum('status', [
                'ACTIVE',
                'INACTIVE',
                'LOCKED'
            ])->default('ACTIVE');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staffs');
    }
};
