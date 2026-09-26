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
        Schema::create('ai_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('enabled')->default(true);
            $table->string('assistant_name', 100)->default('CafeFlow Assistant');
            $table->text('welcome_message')->nullable();
            $table->text('fallback_message')->nullable();
            $table->text('maintenance_message')->nullable();
            $table->text('system_prompt')->nullable();
            $table->string('provider', 30)->default('MOCK');
            $table->string('model', 100)->nullable();
            $table->decimal('temperature', 3, 2)->nullable();
            $table->unsignedInteger('max_tokens')->nullable();
            $table->unsignedInteger('history_limit')->default(20);
            $table->unsignedInteger('daily_message_limit')->default(50);
            $table->timestamps();
        });

        Schema::create('ai_knowledge_entries', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->string('category', 50)->nullable();
            $table->text('content');
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->unsignedInteger('sort_order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->string('conversation_code', 50)->unique();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('session_key', 100)->nullable();
            $table->enum('status', ['ACTIVE', 'CLOSED'])->default('ACTIVE');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
            
            $table->index(['session_key']);
        });

        Schema::create('ai_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('ai_conversations')->cascadeOnDelete();
            $table->enum('role', ['USER', 'ASSISTANT']);
            $table->text('content');
            $table->string('intent', 100)->nullable();
            $table->enum('status', ['SUCCESS', 'FALLBACK', 'ERROR'])->default('SUCCESS');
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['conversation_id', 'role']);
            $table->index('intent');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_messages');
        Schema::dropIfExists('ai_conversations');
        Schema::dropIfExists('ai_knowledge_entries');
        Schema::dropIfExists('ai_settings');
    }
};
