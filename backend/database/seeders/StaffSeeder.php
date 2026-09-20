<?php

namespace Database\Seeders;

use App\Models\Staff;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class StaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $staffs = [
            [
                'staff_code' => 'NV001',
                'full_name' => 'Nguyễn Minh Anh',
                'email' => 'manager@cafeflow.vn',
                'phone' => '0901234561',
                'position' => 'MANAGER',
            ],
            [
                'staff_code' => 'NV002',
                'full_name' => 'Trần Quốc Bảo',
                'email' => 'cashier01@cafeflow.vn',
                'phone' => '0901234562',
                'position' => 'CASHIER',
            ],
            [
                'staff_code' => 'NV003',
                'full_name' => 'Lê Minh Châu',
                'email' => 'barista01@cafeflow.vn',
                'phone' => '0901234563',
                'position' => 'BARISTA',
            ],
            [
                'staff_code' => 'NV004',
                'full_name' => 'Phạm Gia Huy',
                'email' => 'server01@cafeflow.vn',
                'phone' => '0901234564',
                'position' => 'SERVER',
            ],
            [
                'staff_code' => 'NV005',
                'full_name' => 'Hoàng Nhật Nam',
                'email' => 'server02@cafeflow.vn',
                'phone' => '0901234565',
                'position' => 'SERVER',
            ],
            [
                'staff_code' => 'NV006',
                'full_name' => 'Vũ Thị Ngọc',
                'email' => 'barista02@cafeflow.vn',
                'phone' => '0901234566',
                'position' => 'BARISTA',
            ],
            [
                'staff_code' => 'NV007',
                'full_name' => 'Bùi Tuấn Kiệt',
                'email' => 'cashier02@cafeflow.vn',
                'phone' => '0901234567',
                'position' => 'CASHIER',
            ],
            [
                'staff_code' => 'NV008',
                'full_name' => 'Đặng Thảo Vy',
                'email' => 'server03@cafeflow.vn',
                'phone' => '0901234568',
                'position' => 'SERVER',
            ],
        ];

        foreach ($staffs as $staff) {
            Staff::updateOrCreate(
                ['email' => $staff['email']],
                [
                    'staff_code' => $staff['staff_code'],
                    'full_name' => $staff['full_name'],
                    'phone' => $staff['phone'],
                    'password' => Hash::make('CafeFlow@2026'),
                    'position' => $staff['position'],
                    'hire_date' => Carbon::now()->subMonths(rand(1, 12))->format('Y-m-d'),
                    'base_salary' => rand(5000000, 15000000),
                    'status' => 'ACTIVE',
                ]
            );
        }
    }
}
