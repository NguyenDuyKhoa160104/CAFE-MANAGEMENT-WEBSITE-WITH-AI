<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('reservation_code')->unique();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('table_id')->nullable()->constrained('cafe_tables')->nullOnDelete();
            $table->dateTime('reservation_at');
            $table->unsignedInteger('duration_minutes')->default(120);
            $table->unsignedInteger('party_size');
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->text('note')->nullable();
            
            $table->enum('status', [
                'PENDING',
                'CONFIRMED',
                'CHECKED_IN',
                'COMPLETED',
                'CANCELLED',
                'NO_SHOW'
            ])->default('PENDING');
            
            $table->text('cancel_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
