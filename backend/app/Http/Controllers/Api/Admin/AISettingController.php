<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AISetting;

class AISettingController extends Controller
{
    public function index()
    {
        $settings = AISetting::first();
        if (!$settings) {
            $settings = AISetting::create();
        }
        return response()->json([
            'message' => 'Lấy cấu hình AI thành công',
            'data' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $settings = AISetting::first();
        if (!$settings) {
            $settings = AISetting::create();
        }

        $validated = $request->validate([
            'enabled' => 'boolean',
            'assistant_name' => 'string|max:100',
            'welcome_message' => 'nullable|string',
            'fallback_message' => 'nullable|string',
            'maintenance_message' => 'nullable|string',
            'system_prompt' => 'nullable|string',
            'history_limit' => 'integer|min:1|max:100',
            'daily_message_limit' => 'integer|min:1|max:1000',
            'provider' => 'string|in:MOCK',
            'model' => 'nullable|string',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'max_tokens' => 'nullable|integer|min:100',
        ]);

        $settings->update($validated);

        return response()->json([
            'message' => 'Cập nhật cấu hình AI thành công',
            'data' => $settings
        ]);
    }
}
