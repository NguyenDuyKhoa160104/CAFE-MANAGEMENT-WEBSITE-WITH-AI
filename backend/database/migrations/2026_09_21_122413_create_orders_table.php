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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->foreignId('table_id')->nullable()->constrained('cafe_tables')->nullOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('staffs')->nullOnDelete();
            
            $table->enum('customer_type', ['WALK_IN', 'MEMBER'])->default('WALK_IN');
            $table->unsignedBigInteger('customer_id')->nullable()->index();
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            
            $table->enum('order_type', ['DINE_IN', 'TAKEAWAY'])->default('DINE_IN');
            $table->enum('source', ['STAFF', 'CUSTOMER', 'QR'])->default('STAFF');
            $table->enum('status', [
                'PENDING', 
                'CONFIRMED', 
                'PREPARING', 
                'READY', 
                'SERVED', 
                'COMPLETED', 
                'CANCELLED'
            ])->default('PENDING');
            
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            
            $table->text('note')->nullable();
            $table->text('cancel_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
