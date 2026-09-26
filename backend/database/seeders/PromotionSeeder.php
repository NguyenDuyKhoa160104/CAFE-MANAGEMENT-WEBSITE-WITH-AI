<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Promotion;
use App\Models\Product;
use Carbon\Carbon;

class PromotionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. AUTO Promotion - Toàn bộ đơn hàng giảm 5%
        Promotion::create([
            'name' => 'Khuyến mãi tháng 9 - Giảm 5%',
            'description' => 'Tự động giảm 5% cho tất cả các đơn hàng trong tháng 9.',
            'promotion_code' => 'KM_T9_5PT',
            'application_mode' => 'AUTO',
            'discount_type' => 'PERCENTAGE',
            'discount_value' => 5, // 5%
            'scope' => 'ORDER',
            'max_discount_amount' => 50000,
            'min_order_amount' => 100000,
            'starts_at' => Carbon::now()->subDays(2),
            'ends_at' => Carbon::now()->addDays(30),
            'status' => 'ACTIVE',
            'priority' => 1,
        ]);

        // 2. CODE Promotion - Mã khách mới giảm 30k
        Promotion::create([
            'name' => 'Khách hàng mới',
            'description' => 'Mã giảm 30k cho khách hàng mới với đơn từ 50k.',
            'promotion_code' => 'NEWBIE30K',
            'application_mode' => 'CODE',
            'discount_type' => 'FIXED_AMOUNT',
            'discount_value' => 30000,
            'scope' => 'ORDER',
            'max_discount_amount' => 30000,
            'min_order_amount' => 50000,
            'starts_at' => Carbon::now()->subDays(5),
            'ends_at' => Carbon::now()->addDays(90),
            'status' => 'ACTIVE',
            'usage_limit' => 100,
            'used_count' => 0,
            'priority' => 1,
        ]);

        // 3. AUTO Promotion - Giảm giá sản phẩm đặc biệt (Lấy ngẫu nhiên vài sản phẩm nếu có)
        $products = Product::where('status', 'ACTIVE')->take(3)->get();
        if ($products->count() > 0) {
            $productPromo = Promotion::create([
                'name' => 'Giảm giá sản phẩm nổi bật',
                'description' => 'Giảm 10k cho các sản phẩm best seller.',
                'promotion_code' => 'BEST_SELLER_10K',
                'application_mode' => 'AUTO',
                'discount_type' => 'FIXED_AMOUNT',
                'discount_value' => 10000,
                'scope' => 'PRODUCT',
                'starts_at' => Carbon::now()->subDays(1),
                'ends_at' => Carbon::now()->addDays(15),
                'status' => 'ACTIVE',
                'priority' => 2,
            ]);

            // Attach products
            $productPromo->products()->sync($products->pluck('id')->toArray());
        }

        // 4. INACTIVE Promotion - Đã kết thúc
        Promotion::create([
            'name' => 'Khuyến mãi hè',
            'description' => 'Đã kết thúc.',
            'promotion_code' => 'SUMMER_10',
            'application_mode' => 'AUTO',
            'discount_type' => 'PERCENTAGE',
            'discount_value' => 10,
            'scope' => 'ORDER',
            'starts_at' => Carbon::now()->subMonths(3),
            'ends_at' => Carbon::now()->subMonths(1),
            'status' => 'INACTIVE',
            'priority' => 1,
        ]);
    }
}
