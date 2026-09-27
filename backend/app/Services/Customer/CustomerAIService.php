<?php

namespace App\Services\Customer;

use App\Models\AISetting;
use App\Models\AIConversation;
use App\Models\AIMessage;
use App\Services\AI\GeminiService;
use App\Services\AI\AiContextService;
use App\Services\AI\AiIntentService;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CustomerAIService
{
    protected $geminiService;
    protected $contextService;
    protected $intentService;

    public function __construct(
        GeminiService $geminiService,
        AiContextService $contextService,
        AiIntentService $intentService
    ) {
        $this->geminiService = $geminiService;
        $this->contextService = $contextService;
        $this->intentService = $intentService;
    }

    public function getConfig()
    {
        $settings = AISetting::first();
        if (!$settings) {
            return [
                'enabled' => false,
                'maintenance_message' => 'Hệ thống AI đang được cài đặt. Vui lòng quay lại sau.',
            ];
        }

        return [
            'enabled' => $settings->enabled,
            'assistant_name' => $settings->assistant_name,
            'welcome_message' => $settings->welcome_message,
            'maintenance_message' => $settings->maintenance_message,
            'suggested_questions' => [
                'CafeFlow có những món gì?',
                'Tôi muốn đặt bàn',
                'Thanh toán bằng cách nào?',
                'Giờ mở cửa của quán?'
            ]
        ];
    }

    public function processChat(array $data)
    {
        $settings = AISetting::first();
        if (!$settings || !$settings->enabled) {
            return [
                'status' => 'ERROR',
                'reply' => $settings ? $settings->maintenance_message : 'Hệ thống bảo trì.',
            ];
        }

        $customerId = auth('customer')->id();
        $sessionKey = $data['session_key'] ?? null;
        $messageText = $data['message'];

        // Prevent prompt injection somewhat
        if (preg_match('/system prompt|API key|password|ignore previous|bỏ qua mọi hướng dẫn/i', $messageText)) {
            return [
                'status' => 'SUCCESS',
                'intent' => 'OTHER',
                'reply' => 'Xin lỗi, tôi không thể trả lời câu hỏi này. Tôi chỉ có thể giúp bạn với các dịch vụ của CafeFlow.',
            ];
        }

        // Enforce basic limit
        $today = Carbon::today();
        $messageCount = 0;
        
        if ($customerId) {
            $messageCount = AIMessage::whereHas('conversation', function ($query) use ($customerId) {
                $query->where('customer_id', $customerId);
            })->where('role', 'USER')->whereDate('created_at', $today)->count();
        } elseif ($sessionKey) {
            $messageCount = AIMessage::whereHas('conversation', function ($query) use ($sessionKey) {
                $query->where('session_key', $sessionKey);
            })->where('role', 'USER')->whereDate('created_at', $today)->count();
        }

        if ($messageCount >= $settings->daily_message_limit) {
            return [
                'status' => 'ERROR',
                'reply' => 'Bạn đã đạt giới hạn trò chuyện hôm nay. Vui lòng quay lại vào ngày mai.',
            ];
        }

        // Find or create conversation
        $conversation = AIConversation::where('status', 'ACTIVE')
            ->where(function ($query) use ($customerId, $sessionKey) {
                if ($customerId) {
                    $query->where('customer_id', $customerId);
                } else {
                    $query->where('session_key', $sessionKey);
                }
            })->orderBy('updated_at', 'desc')->first();

        if (!$conversation) {
            $conversation = AIConversation::create([
                'conversation_code' => 'AI-' . strtoupper(Str::random(10)),
                'customer_id' => $customerId,
                'session_key' => $sessionKey,
                'started_at' => now(),
                'last_message_at' => now(),
                'status' => 'ACTIVE'
            ]);
        }

        // Save User Message
        $intent = $this->intentService->detectIntent($messageText);

        AIMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'USER',
            'content' => $messageText,
            'intent' => $intent,
            'status' => 'SUCCESS'
        ]);

        // Build context
        $context = $this->contextService->getContextByIntent($intent, $customerId);

        // Fetch History
        $historyLimit = $settings->history_limit ?? 5;
        $historyMessages = AIMessage::where('conversation_id', $conversation->id)
            ->where('status', 'SUCCESS')
            ->orderBy('created_at', 'desc')
            ->limit($historyLimit)
            ->get()
            ->reverse()
            ->toArray();

        // System Instruction
        $systemInstruction = $settings->system_prompt ?? "Bạn là CafeFlow Assistant, trợ lý AI của quán CafeFlow.
Bạn hỗ trợ khách hàng về thực đơn, giá sản phẩm, danh mục đồ uống, khuyến mãi, đặt bàn, đặt món, thanh toán, đơn hàng và thông tin hoạt động của quán. Luôn ưu tiên dữ liệu được cung cấp từ hệ thống.
Không được tự bịa thông tin. Trả lời bằng tiếng Việt tự nhiên, thân thiện, ngắn gọn và dễ hiểu.";

        // Append context to system instruction or as a system note
        if (!empty($context)) {
            $systemInstruction .= "\n\nDỮ LIỆU HỆ THỐNG HIỆN TẠI:\n" . $context;
        }

        // Generate Response via Gemini
        $aiResponse = $this->geminiService->generateContent($messageText, $historyMessages, $systemInstruction);

        if ($aiResponse['status'] === 'ERROR') {
            Log::error("Gemini fallback triggered for message: " . $messageText);
            
            // Save Assistant Message as ERROR
            AIMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'ASSISTANT',
                'content' => 'Error: ' . $aiResponse['message'],
                'intent' => $intent,
                'status' => 'ERROR',
            ]);
            
            $replyMessage = $settings->fallback_message;
            if (isset($aiResponse['error_type'])) {
                if ($aiResponse['error_type'] === 'QUOTA_EXCEEDED') {
                    $replyMessage = 'Hệ thống AI đang tạm ngưng do giới hạn của gói miễn phí. Vui lòng thử lại sau chốc lát!';
                } elseif ($aiResponse['error_type'] === 'HIGH_DEMAND') {
                    $replyMessage = 'Hệ thống AI của Google hiện đang quá tải. Xin bạn vui lòng thử lại sau ít phút!';
                }
            }
            
            return [
                'conversation_id' => $conversation->id,
                'conversation_code' => $conversation->conversation_code,
                'assistant_name' => $settings->assistant_name,
                'reply' => $replyMessage,
                'intent' => $intent,
                'status' => 'ERROR',
                'fallback' => true
            ];
        }

        // Save Assistant Message
        AIMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'ASSISTANT',
            'content' => $aiResponse['reply'],
            'intent' => $intent,
            'status' => 'SUCCESS',
        ]);

        $conversation->update(['last_message_at' => now()]);

        return [
            'conversation_id' => $conversation->id,
            'conversation_code' => $conversation->conversation_code,
            'assistant_name' => $settings->assistant_name,
            'reply' => $aiResponse['reply'],
            'intent' => $intent,
            'status' => 'SUCCESS',
            'fallback' => false
        ];
    }
}
