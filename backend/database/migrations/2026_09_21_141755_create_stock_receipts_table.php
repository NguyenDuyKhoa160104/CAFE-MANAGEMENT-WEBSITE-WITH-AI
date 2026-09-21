<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_code', 30)->unique();
            $table->foreignId('admin_id')->nullable()->constrained('admins')->nullOnDelete();
            $table->string('supplier_name', 150)->nullable();
            $table->enum('status', ['DRAFT', 'COMPLETED', 'CANCELLED'])->default('DRAFT');
            $table->decimal('total_amount', 14, 2)->default(0);
            $table->timestamp('received_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_receipts');
    }
};
