<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $indexes = [
        'payments' => [['status', 'paid_at']],
        'orders' => [['created_at', 'status']],
        'reservations' => [['reservation_at', 'status']],
        'customers' => [['created_at']],
        'ai_conversations' => [['created_at']],
        'staff_shift_assignments' => [['work_date', 'work_shift_id']],
    ];

    public function up(): void
    {
        foreach ($this->indexes as $table => $indexes) {
            foreach ($indexes as $columns) {
                Schema::table($table, fn (Blueprint $t) => $t->index($columns, 'dashboard_'.implode('_', $columns).'_'.$table));
            }
        }
    }

    public function down(): void
    {
        foreach ($this->indexes as $table => $indexes) {
            foreach ($indexes as $columns) {
                Schema::table($table, fn (Blueprint $t) => $t->dropIndex('dashboard_'.implode('_', $columns).'_'.$table));
            }
        }
    }
};
