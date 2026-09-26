<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AISetting;

class AISettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AISetting::updateOrCreate(
            ['id' => 1],
            [
                'enabled' => true,
                'assistant_name' => 'CafeFlow Assistant',
                'welcome_message' => 'Xin chào! Tôi là trợ lý CafeFlow. Tôi có thể hỗ trợ bạn về thực đơn, đặt bàn, đơn hàng và thông tin của quán.',
                'fallback_message' => 'Xin lỗi, tôi chưa hiểu rõ câu hỏi này. Bạn có thể hỏi tôi về thực đơn, giá món, đặt bàn, đơn hàng hoặc thông tin của CafeFlow.',
                'maintenance_message' => 'Trợ lý CafeFlow hiện đang tạm bảo trì. Vui lòng quay lại sau.',
                'provider' => 'MOCK',
                'history_limit' => 20,
                'daily_message_limit' => 50,
            ]
        );
    }
}
