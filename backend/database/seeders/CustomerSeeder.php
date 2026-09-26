<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            [
                'full_name' => 'Nguyễn Văn An',
                'email' => 'customer1@gmail.com',
                'phone' => '0901000001',
            ],
            [
                'full_name' => 'Trần Minh Bình',
                'email' => 'customer2@gmail.com',
                'phone' => '0901000002',
            ],
            [
                'full_name' => 'Lê Hoàng Chi',
                'email' => 'customer3@gmail.com',
                'phone' => '0901000003',
            ],
            [
                'full_name' => 'Phạm Gia Hân',
                'email' => 'customer4@gmail.com',
                'phone' => '0901000004',
            ],
            [
                'full_name' => 'Võ Minh Khang',
                'email' => 'customer5@gmail.com',
                'phone' => '0901000005',
            ]
        ];

        foreach ($customers as $customer) {
            Customer::updateOrCreate(
                ['email' => $customer['email']],
                [
                    'full_name' => $customer['full_name'],
                    'phone' => $customer['phone'],
                    'password' => Hash::make('12345678'),
                    'status' => 'ACTIVE',
                    'avatar' => null,
                ]
            );
        }
    }
}
