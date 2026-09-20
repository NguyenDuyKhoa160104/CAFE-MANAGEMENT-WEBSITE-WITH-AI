<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('admins')
            ->whereIn('admin_code', [
                'AD001',
                'AD002',
                'AD003',
            ])
            ->delete();

        DB::table('admins')->insert([
            [
                'admin_code' => 'AD001',
                'full_name' => 'Admin CafeFlow',
                'email' => 'admin@cafeflow.vn',
                'phone' => '0901234567',
                'password' => Hash::make('CafeFlow@2026'),
                'avatar' => null,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'admin_code' => 'AD002',
                'full_name' => 'Manager CafeFlow',
                'email' => 'manager@cafeflow.vn',
                'phone' => '0902345678',
                'password' => Hash::make('Manager@2026'),
                'avatar' => null,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'admin_code' => 'AD003',
                'full_name' => 'System Admin',
                'email' => 'system@cafeflow.vn',
                'phone' => null,
                'password' => Hash::make('System@2026'),
                'avatar' => null,
                'status' => 'LOCKED',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
