<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $productsData = [
            [
                'product_code' => 'CF001',
                'category_code' => 'CAFE',
                'name' => 'Cà phê đen',
                'description' => 'Cà phê đậm vị truyền thống',
                'price' => 25000,
                'cost_price' => 10000,
                'status' => 'ACTIVE',
                'is_featured' => false,
                'sort_order' => 1,
            ],
            [
                'product_code' => 'CF002',
                'category_code' => 'CAFE',
                'name' => 'Cà phê sữa',
                'description' => null,
                'price' => 30000,
                'cost_price' => 12000,
                'status' => 'ACTIVE',
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'product_code' => 'CF003',
                'category_code' => 'CAFE',
                'name' => 'Bạc xỉu',
                'description' => null,
                'price' => 35000,
                'cost_price' => 15000,
                'status' => 'ACTIVE',
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'product_code' => 'TEA001',
                'category_code' => 'TEA',
                'name' => 'Trà đào',
                'description' => null,
                'price' => 39000,
                'cost_price' => 16000,
                'status' => 'ACTIVE',
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'product_code' => 'TEA002',
                'category_code' => 'TEA',
                'name' => 'Trà vải',
                'description' => null,
                'price' => 39000,
                'cost_price' => 16000,
                'status' => 'ACTIVE',
                'is_featured' => false,
                'sort_order' => 2,
            ],
            [
                'product_code' => 'MT001',
                'category_code' => 'MILK_TEA',
                'name' => 'Trà sữa truyền thống',
                'description' => null,
                'price' => 42000,
                'cost_price' => 18000,
                'status' => 'ACTIVE',
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'product_code' => 'ICE001',
                'category_code' => 'ICE_BLEND',
                'name' => 'Matcha đá xay',
                'description' => null,
                'price' => 49000,
                'cost_price' => 22000,
                'status' => 'ACTIVE',
                'is_featured' => false,
                'sort_order' => 1,
            ],
            [
                'product_code' => 'JUICE001',
                'category_code' => 'JUICE',
                'name' => 'Nước ép cam',
                'description' => null,
                'price' => 40000,
                'cost_price' => 17000,
                'status' => 'ACTIVE',
                'is_featured' => false,
                'sort_order' => 1,
            ],
        ];

        foreach ($productsData as $data) {
            $categoryCode = $data['category_code'];
            unset($data['category_code']);

            $categoryId = DB::table('categories')
                ->where('category_code', $categoryCode)
                ->value('id');

            if ($categoryId) {
                $data['category_id'] = $categoryId;
                $data['slug'] = Str::slug($data['name']);
                
                DB::table('products')->updateOrInsert(
                    ['product_code' => $data['product_code']],
                    $data
                );
            }
        }
    }
}
