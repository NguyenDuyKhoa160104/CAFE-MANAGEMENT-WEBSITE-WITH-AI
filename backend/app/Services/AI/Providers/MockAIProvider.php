<?php

namespace App\Services\AI\Providers;

use App\Services\AI\Contracts\AIProviderInterface;
use App\Models\AIKnowledgeEntry;

class MockAIProvider implements AIProviderInterface
{
    public function generateResponse(string $message, array $context = []): array|string
    {
        $messageLower = mb_strtolower($message);
        
        $intent = $this->detectIntent($messageLower);
        
        return $this->buildResponse($intent, $messageLower);
    }

    private function detectIntent(string $message): string
    {
        if (preg_match('/xin chào|hello|hi|chào/i', $message)) {
            return 'GREETING';
        }
        if (preg_match('/menu|thực đơn|có món gì|đồ uống/i', $message)) {
            return 'MENU';
        }
        if (preg_match('/đặt bàn|booking|bàn/i', $message)) {
            return 'RESERVATION_INFO';
        }
        if (preg_match('/thanh toán|tiền mặt|chuyển khoản|payment/i', $message)) {
            return 'PAYMENT_INFO';
        }
        if (preg_match('/đơn hàng|order|đơn của tôi/i', $message)) {
            return 'ORDER_INFO';
        }
        if (preg_match('/giá|bao nhiêu|dưới|rẻ/i', $message)) {
            return 'PRICE';
        }
        if (preg_match('/gợi ý|nên uống|món nào ngon|recommend/i', $message)) {
            return 'PRODUCT_RECOMMENDATION';
        }
        if (preg_match('/mấy giờ|giờ mở cửa|đóng cửa|open/i', $message)) {
            return 'OPENING_HOURS';
        }

        return 'FALLBACK';
    }

    private function buildResponse(string $intent, string $message): array
    {
        $response = [
            'intent' => $intent,
            'reply' => '',
            'metadata' => null,
            'status' => 'SUCCESS',
        ];

        switch ($intent) {
            case 'GREETING':
                $response['reply'] = 'Xin chào! Tôi là CafeFlow Assistant. Tôi có thể giúp bạn tìm món, tìm hiểu về đặt bàn hoặc kiểm tra thông tin dịch vụ của quán.';
                break;
            case 'MENU':
                $response['reply'] = 'CafeFlow có các nhóm đồ uống như cà phê, trà và các món đặc biệt. Bạn có thể mở trang Thực đơn để xem đầy đủ món, giá và tình trạng còn hàng.';
                $response['metadata'] = ['action' => 'OPEN_MENU', 'route' => '/menu'];
                break;
            case 'PRICE':
                $response['reply'] = 'Bạn có thể xem giá cập nhật của từng món tại trang Thực đơn. Giá hiển thị trên hệ thống là giá hiện tại của CafeFlow.';
                $response['metadata'] = ['action' => 'OPEN_MENU', 'route' => '/menu'];
                break;
            case 'PRODUCT_RECOMMENDATION':
                $response['reply'] = 'Nếu bạn thích vị cà phê đậm, bạn có thể thử nhóm cà phê truyền thống. Nếu thích nhẹ và dễ uống hơn, hãy xem các món có sữa hoặc trà. Bạn có thể mở Thực đơn để chọn món phù hợp.';
                break;
            case 'RESERVATION_INFO':
                $response['reply'] = 'Bạn có thể đặt bàn trực tiếp trên website CafeFlow. Hãy chọn thời gian, số khách và bàn còn phù hợp. Sau khi gửi, yêu cầu sẽ chờ quán xác nhận.';
                $response['metadata'] = ['action' => 'OPEN_RESERVATION', 'route' => '/reservation'];
                break;
            case 'ORDER_INFO':
                $response['reply'] = 'Bạn có thể xem trạng thái các đơn hàng của mình trong mục Đơn hàng. Lưu ý: Bạn cần đăng nhập để xem thông tin này.';
                $response['metadata'] = ['action' => 'OPEN_ORDERS', 'route' => '/orders'];
                break;
            case 'PAYMENT_INFO':
                $response['reply'] = 'CafeFlow hiện hỗ trợ thanh toán tiền mặt hoặc chuyển khoản tại quầy khi nhận đồ uống.';
                break;
            case 'OPENING_HOURS':
                $knowledge = AIKnowledgeEntry::where('category', 'OPENING_HOURS')->where('status', 'ACTIVE')->first();
                if ($knowledge) {
                    $response['reply'] = $knowledge->content;
                } else {
                    $response['reply'] = 'CafeFlow phục vụ hằng ngày. Vui lòng liên hệ quán để biết giờ đóng mở cửa chính xác.';
                }
                break;
            case 'FALLBACK':
            default:
                $response['status'] = 'FALLBACK';
                // The fallback message will be retrieved by the service
                $response['reply'] = '';
                break;
        }

        return $response;
    }
}
