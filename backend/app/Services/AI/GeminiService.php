<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected $apiKey;
    protected $baseUrl;
    protected $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
        $this->baseUrl = config('services.gemini.base_url');
        $this->model = config('services.gemini.model');
    }

    /**
     * Generate content via Gemini REST API.
     */
    public function generateContent(string $prompt, array $history = [], ?string $systemInstruction = null): array
    {
        if (empty($this->apiKey)) {
            Log::error('Gemini API key is not configured.');
            return [
                'status' => 'ERROR',
                'message' => 'Lỗi hệ thống: API key chưa được cấu hình.',
            ];
        }

        $url = "{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}";

        $contents = [];
        
        // Map history to Gemini API format
        foreach ($history as $msg) {
            $role = ($msg['role'] === 'ASSISTANT') ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [
                    ['text' => $msg['content']]
                ]
            ];
        }

        // Add current user prompt
        $contents[] = [
            'role' => 'user',
            'parts' => [
                ['text' => $prompt]
            ]
        ];

        $payload = [
            'contents' => $contents,
        ];

        // System Instruction support (Gemini Pro/Flash 1.5+)
        if ($systemInstruction) {
            $payload['system_instruction'] = [
                'parts' => [
                    ['text' => $systemInstruction]
                ]
            ];
        }

        try {
            $response = Http::timeout(15)
                ->retry(2, 100)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($url, $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                    return [
                        'status' => 'SUCCESS',
                        'reply' => $data['candidates'][0]['content']['parts'][0]['text'],
                    ];
                }

                return [
                    'status' => 'ERROR',
                    'message' => 'Không thể đọc dữ liệu phản hồi từ Gemini.',
                ];
            }

            Log::error('Gemini API Error: ' . $response->body());
            
            return [
                'status' => 'ERROR',
                'message' => 'Có lỗi xảy ra khi giao tiếp với AI. Vui lòng thử lại sau.',
            ];
        } catch (\Exception $e) {
            Log::error('Gemini API Exception: ' . $e->getMessage());
            return [
                'status' => 'ERROR',
                'message' => 'Lỗi kết nối AI: ' . $e->getMessage(),
            ];
        }
    }
}
