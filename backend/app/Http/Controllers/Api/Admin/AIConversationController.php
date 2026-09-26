<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AIConversation;

class AIConversationController extends Controller
{
    public function index(Request $request)
    {
        $query = AIConversation::with(['customer', 'messages' => function($q) {
            $q->latest()->limit(1);
        }]);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Count messages for each conversation
        $query->withCount('messages');

        $conversations = $query->orderBy('last_message_at', 'desc')->paginate(15);
        
        return response()->json([
            'message' => 'Lấy danh sách hội thoại thành công',
            'data' => $conversations
        ]);
    }

    public function show($id)
    {
        $conversation = AIConversation::with(['customer', 'messages' => function($q) {
            $q->orderBy('created_at', 'asc');
        }])->findOrFail($id);
        
        return response()->json([
            'message' => 'Lấy chi tiết hội thoại thành công',
            'data' => $conversation
        ]);
    }
}
