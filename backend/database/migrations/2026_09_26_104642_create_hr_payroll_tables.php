<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Roles
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('role_code', 50)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->boolean('is_system')->default(false);
            $table->timestamps();
        });

        // 2. Permissions
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('permission_code', 100)->unique();
            $table->string('name', 150);
            $table->string('module', 100);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 3. Role Permissions (Pivot)
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->unique(['role_id', 'permission_id']);
        });

        // 4. Add role_id to staffs
        Schema::table('staffs', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('position')->constrained('roles')->nullOnDelete();
        });

        // 5. Work Shifts
        Schema::create('work_shifts', function (Blueprint $table) {
            $table->id();
            $table->string('shift_code', 30)->unique();
            $table->string('name', 100);
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedInteger('grace_minutes')->default(0);
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // 6. Staff Shift Assignments
        Schema::create('staff_shift_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staffs')->cascadeOnDelete();
            $table->foreignId('work_shift_id')->constrained('work_shifts')->cascadeOnDelete();
            $table->date('work_date');
            $table->text('note')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamps();
            
            $table->unique(['staff_id', 'work_date', 'work_shift_id'], 'shift_assignment_unique');
        });

        // 7. Attendances
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staffs')->cascadeOnDelete();
            $table->foreignId('work_shift_id')->nullable()->constrained('work_shifts')->nullOnDelete();
            $table->date('work_date');
            $table->dateTime('check_in_at')->nullable();
            $table->dateTime('check_out_at')->nullable();
            $table->enum('status', ['PRESENT', 'LATE', 'ABSENT', 'LEAVE'])->default('ABSENT');
            $table->unsignedInteger('worked_minutes')->default(0);
            $table->unsignedInteger('late_minutes')->default(0);
            $table->unsignedInteger('overtime_minutes')->default(0);
            $table->text('note')->nullable();
            $table->foreignId('adjusted_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->dateTime('adjusted_at')->nullable();
            $table->timestamps();

            $table->index(['staff_id']);
            $table->index(['work_date']);
            $table->index(['status']);
        });

        // 8. Payroll Periods
        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->string('period_code', 50)->unique();
            $table->string('name', 150);
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('standard_work_days', 5, 2);
            $table->enum('status', ['DRAFT', 'CONFIRMED', 'PAID'])->default('DRAFT');
            $table->dateTime('confirmed_at')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->dateTime('paid_at')->nullable();
            $table->foreignId('paid_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();
        });

        // 9. Payrolls
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_period_id')->constrained('payroll_periods')->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('staffs')->cascadeOnDelete();
            $table->decimal('base_salary', 15, 2);
            $table->decimal('standard_work_days', 5, 2);
            $table->decimal('actual_work_days', 5, 2);
            $table->unsignedInteger('worked_minutes')->default(0);
            $table->unsignedInteger('late_minutes')->default(0);
            $table->unsignedInteger('overtime_minutes')->default(0);
            $table->decimal('absent_days', 5, 2)->default(0);
            $table->decimal('leave_days', 5, 2)->default(0);
            $table->decimal('base_work_salary', 15, 2)->default(0);
            $table->decimal('overtime_amount', 15, 2)->default(0);
            $table->decimal('allowance_amount', 15, 2)->default(0);
            $table->decimal('bonus_amount', 15, 2)->default(0);
            $table->decimal('deduction_amount', 15, 2)->default(0);
            $table->decimal('gross_salary', 15, 2)->default(0);
            $table->decimal('net_salary', 15, 2)->default(0);
            $table->text('note')->nullable();
            $table->enum('status', ['DRAFT', 'CONFIRMED', 'PAID'])->default('DRAFT');
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['payroll_period_id', 'staff_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payrolls');
        Schema::dropIfExists('payroll_periods');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('staff_shift_assignments');
        Schema::dropIfExists('work_shifts');
        Schema::table('staffs', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
