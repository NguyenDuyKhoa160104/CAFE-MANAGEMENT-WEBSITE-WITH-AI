<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Staff;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Dashboard
            ['code' => 'dashboard.view', 'name' => 'Xem Dashboard', 'module' => 'Dashboard'],
            // Orders
            ['code' => 'orders.view', 'name' => 'Xem Đơn hàng', 'module' => 'Đơn hàng'],
            ['code' => 'orders.create', 'name' => 'Tạo Đơn hàng', 'module' => 'Đơn hàng'],
            ['code' => 'orders.update', 'name' => 'Sửa Đơn hàng', 'module' => 'Đơn hàng'],
            ['code' => 'orders.status', 'name' => 'Đổi trạng thái Đơn hàng', 'module' => 'Đơn hàng'],
            ['code' => 'orders.checkout', 'name' => 'Thanh toán Đơn hàng', 'module' => 'Đơn hàng'],
            // Tables
            ['code' => 'tables.view', 'name' => 'Xem Bàn', 'module' => 'Bàn'],
            // Reservations
            ['code' => 'reservations.view', 'name' => 'Xem Đặt bàn', 'module' => 'Đặt bàn'],
            ['code' => 'reservations.update', 'name' => 'Cập nhật Đặt bàn', 'module' => 'Đặt bàn'],
            // Invoices
            ['code' => 'invoices.view', 'name' => 'Xem Hóa đơn', 'module' => 'Hóa đơn'],
            // Inventory
            ['code' => 'inventory.view', 'name' => 'Xem Kho', 'module' => 'Kho'],
            // Attendance
            ['code' => 'attendance.view_self', 'name' => 'Xem Chấm công cá nhân', 'module' => 'Chấm công'],
            ['code' => 'attendance.check_in', 'name' => 'Chấm công vào', 'module' => 'Chấm công'],
            ['code' => 'attendance.check_out', 'name' => 'Chấm công ra', 'module' => 'Chấm công'],
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(
                ['permission_code' => $p['code']],
                ['name' => $p['name'], 'module' => $p['module']]
            );
        }

        $roles = [
            [
                'code' => 'MANAGER_ROLE',
                'name' => 'Quản lý ca',
                'description' => 'Quản lý toàn bộ hoạt động trong ca làm việc',
                'is_system' => true,
                'perms' => [
                    'dashboard.view', 'orders.view', 'orders.create', 'orders.update', 'orders.status', 'orders.checkout',
                    'tables.view', 'reservations.view', 'reservations.update', 'invoices.view', 'inventory.view',
                    'attendance.view_self', 'attendance.check_in', 'attendance.check_out'
                ]
            ],
            [
                'code' => 'CASHIER_ROLE',
                'name' => 'Thu ngân',
                'description' => 'Thu ngân và xử lý thanh toán',
                'is_system' => true,
                'perms' => [
                    'dashboard.view', 'orders.view', 'orders.create', 'orders.update', 'orders.status', 'orders.checkout',
                    'tables.view', 'reservations.view', 'invoices.view',
                    'attendance.view_self', 'attendance.check_in', 'attendance.check_out'
                ]
            ],
            [
                'code' => 'BARISTA_ROLE',
                'name' => 'Pha chế',
                'description' => 'Pha chế đồ uống',
                'is_system' => true,
                'perms' => [
                    'dashboard.view', 'orders.view', 'orders.status',
                    'attendance.view_self', 'attendance.check_in', 'attendance.check_out'
                ]
            ],
            [
                'code' => 'SERVER_ROLE',
                'name' => 'Phục vụ',
                'description' => 'Phục vụ khách hàng',
                'is_system' => true,
                'perms' => [
                    'dashboard.view', 'orders.view', 'orders.create', 'orders.update', 'orders.status',
                    'tables.view', 'reservations.view',
                    'attendance.view_self', 'attendance.check_in', 'attendance.check_out'
                ]
            ]
        ];

        foreach ($roles as $r) {
            $role = Role::firstOrCreate(
                ['role_code' => $r['code']],
                ['name' => $r['name'], 'description' => $r['description'], 'is_system' => $r['is_system']]
            );
            
            $permIds = Permission::whereIn('permission_code', $r['perms'])->pluck('id')->toArray();
            $role->permissions()->sync($permIds);
        }

        // Map Staff -> Role
        $staffs = Staff::whereNull('role_id')->get();
        foreach ($staffs as $staff) {
            $roleCode = match ($staff->position) {
                'MANAGER' => 'MANAGER_ROLE',
                'CASHIER' => 'CASHIER_ROLE',
                'BARISTA' => 'BARISTA_ROLE',
                'SERVER' => 'SERVER_ROLE',
                default => null
            };

            if ($roleCode) {
                $role = Role::where('role_code', $roleCode)->first();
                if ($role) {
                    $staff->update(['role_id' => $role->id]);
                }
            }
        }
    }
}
