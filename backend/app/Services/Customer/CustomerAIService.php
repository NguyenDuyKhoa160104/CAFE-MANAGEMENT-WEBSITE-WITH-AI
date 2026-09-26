<?php

namespace App\Services\Customer;

use App\Models\AISetting;
use App\Models\AIConversation;
use App\Models\AIMessage;
use App\Services\AI\Providers\MockAIProvider;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CustomerAIService
{
    protected $aiProvider;

    public function __construct(MockAIProvider $aiProvider)
    {
        $this->aiProvider = $aiProvider;
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
                'reply' => 'Bạn đã đạt giới hạn tin nhắn hôm nay.',
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
            ]);
        }

        // Save User Message
        AIMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'USER',
            'content' => $messageText,
        ]);

        // Generate Response
        $aiResponse = $this->aiProvider->generateResponse($messageText);

        if ($aiResponse['status'] === 'FALLBACK') {
            $aiResponse['reply'] = $settings->fallback_message;
        }

        // Save Assistant Message
        AIMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'ASSISTANT',
            'content' => $aiResponse['reply'],
            'intent' => $aiResponse['intent'],
            'status' => $aiResponse['status'],
            'metadata' => $aiResponse['metadata'] ?? null,
        ]);

        $conversation->update(['last_message_at' => now()]);

        return [
            'conversation_id' => $conversation->id,
            'conversation_code' => $conversation->conversation_code,
            'assistant_name' => $settings->assistant_name,
            'reply' => $aiResponse['reply'],
            'intent' => $aiResponse['intent'],
            'status' => $aiResponse['status'],
            'metadata' => $aiResponse['metadata'] ?? null,
        ];
    }
}
