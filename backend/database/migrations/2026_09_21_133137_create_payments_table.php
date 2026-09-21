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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_code', 50)->unique();
            $table->foreignId('order_id')->unique()->constrained('orders')->restrictOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('staffs')->nullOnDelete();
            $table->enum('payment_method', ['CASH', 'BANK_TRANSFER']);
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['SUCCESS', 'FAILED', 'CANCELLED'])->default('SUCCESS');
            $table->timestamp('paid_at')->nullable();
            $table->string('transaction_reference')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
