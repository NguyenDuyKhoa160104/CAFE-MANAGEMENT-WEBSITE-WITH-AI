<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AIKnowledgeEntry;

class AIKnowledgeEntrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $entries = [
            [
                'title' => 'Giờ mở cửa',
                'category' => 'OPENING_HOURS',
                'content' => 'CafeFlow phục vụ từ 07:00 đến 22:00 hằng ngày.',
                'status' => 'ACTIVE',
            ],
            [
                'title' => 'Thanh toán',
                'category' => 'PAYMENT',
                'content' => 'CafeFlow hiện hỗ trợ thanh toán tiền mặt hoặc chuyển khoản tại quầy.',
                'status' => 'ACTIVE',
            ],
            [
                'title' => 'Đơn hàng mang đi',
                'category' => 'TAKEAWAY',
                'content' => 'Khách hàng có thể đặt đồ uống mang đi trên website và nhận tại quầy.',
                'status' => 'ACTIVE',
            ],
            [
                'title' => 'Đặt bàn',
                'category' => 'RESERVATION',
                'content' => 'Khách hàng có thể gửi yêu cầu đặt bàn trên website. Yêu cầu sẽ ở trạng thái chờ xác nhận cho đến khi quán xác nhận.',
                'status' => 'ACTIVE',
            ]
        ];

        foreach ($entries as $entry) {
            AIKnowledgeEntry::firstOrCreate(
                ['title' => $entry['title']],
                $entry
            );
        }
    }
}
