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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_code', 50)->unique();
            $table->foreignId('order_id')->unique()->constrained('orders')->restrictOnDelete();
            $table->foreignId('payment_id')->unique()->constrained('payments')->restrictOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('staffs')->nullOnDelete();
            $table->string('customer_name', 100)->nullable();
            $table->string('customer_phone', 20)->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->enum('payment_method', ['CASH', 'BANK_TRANSFER']);
            $table->timestamp('issued_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
