<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Customer\CustomerAIService;

class AIChatController extends Controller
{
    protected $aiService;

    public function __construct(CustomerAIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function config()
    {
        $config = $this->aiService->getConfig();
        return response()->json([
            'message' => 'Lấy cấu hình AI thành công',
            'data' => $config
        ]);
    }

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:500',
            'session_key' => 'required_without:customer_id|string|nullable'
        ]);

        $data = $request->only(['message', 'session_key']);
        
        $response = $this->aiService->processChat($data);

        if (isset($response['status']) && $response['status'] === 'ERROR') {
            return response()->json([
                'message' => 'Có lỗi xảy ra',
                'data' => $response
            ], 400);
        }

        return response()->json([
            'message' => 'Phản hồi thành công',
            'data' => $response
        ]);
    }
}
