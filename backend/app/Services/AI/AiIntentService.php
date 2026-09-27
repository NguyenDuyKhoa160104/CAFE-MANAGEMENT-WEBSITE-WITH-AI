<?php

namespace App\Services\AI;

class AiIntentService
{
    /**
     * Phân loại intent từ câu hỏi của khách hàng.
     * Sử dụng rule-based đơn giản để xác định.
     */
    public function detectIntent(string $message): string
    {
        $message = mb_strtolower($message);

        if (preg_match('/menu|thực đơn|có món gì|đồ uống|thức uống/i', $message)) {
            return 'MENU';
        }

        if (preg_match('/(có|tìm).*(trà|cà phê|cafe|sinh tố|nước ép|bánh)/i', $message)) {
            return 'PRODUCT_SEARCH';
        }

        if (preg_match('/giá|bao nhiêu|dưới|rẻ|mắc/i', $message)) {
            return 'PRODUCT_PRICE';
        }

        if (preg_match('/gợi ý|recommend|nên uống|món nào ngon|bán chạy/i', $message)) {
            return 'PRODUCT_RECOMMENDATION';
        }

        if (preg_match('/khuyến mãi|giảm giá|voucher|promo|ưu đãi/i', $message)) {
            return 'PROMOTION';
        }

        if (preg_match('/mấy giờ|giờ mở cửa|đóng cửa|open/i', $message)) {
            return 'OPENING_HOURS';
        }

        if (preg_match('/đặt bàn|booking|bàn/i', $message)) {
            if (preg_match('/của tôi|đã đặt|kiểm tra|xem/i', $message)) {
                return 'RESERVATION_STATUS';
            }
            return 'RESERVATION_GUIDE';
        }

        if (preg_match('/đơn hàng|order|đơn của tôi|đơn/i', $message)) {
            if (preg_match('/trạng thái|thế nào|đang ở đâu|của tôi/i', $message)) {
                return 'ORDER_STATUS';
            }
            return 'ORDER_GUIDE';
        }

        if (preg_match('/thanh toán|tiền mặt|chuyển khoản|payment/i', $message)) {
            return 'PAYMENT';
        }

        if (preg_match('/xin chào|hello|hi|chào/i', $message)) {
            return 'GREETING';
        }

        return 'OTHER';
    }
}
