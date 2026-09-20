<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'category_code' => 'CAFE',
                'name' => 'Cà phê',
                'description' => 'Các loại cà phê truyền thống và hiện đại',
                'sort_order' => 1,
                'status' => 'ACTIVE',
            ],
            [
                'category_code' => 'TEA',
                'name' => 'Trà',
                'description' => 'Các loại trà thanh mát',
                'sort_order' => 2,
                'status' => 'ACTIVE',
            ],
            [
                'category_code' => 'MILK_TEA',
                'name' => 'Trà sữa',
                'description' => null,
                'sort_order' => 3,
                'status' => 'ACTIVE',
            ],
            [
                'category_code' => 'ICE_BLEND',
                'name' => 'Đá xay',
                'description' => null,
                'sort_order' => 4,
                'status' => 'ACTIVE',
            ],
            [
                'category_code' => 'JUICE',
                'name' => 'Nước ép',
                'description' => null,
                'sort_order' => 5,
                'status' => 'ACTIVE',
            ],
            [
                'category_code' => 'OTHER',
                'name' => 'Khác',
                'description' => null,
                'sort_order' => 6,
                'status' => 'ACTIVE',
            ],
        ];

        foreach ($categories as $category) {
            $category['slug'] = Str::slug($category['name']);
            
            DB::table('categories')->updateOrInsert(
                ['category_code' => $category['category_code']],
                $category
            );
        }
    }
}
