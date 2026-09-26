<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AIConversation;
use App\Models\AIMessage;
use Illuminate\Support\Facades\DB;

class AIOverviewController extends Controller
{
    public function index()
    {
        $totalConversations = AIConversation::count();
        $totalMessages = AIMessage::count();
        $totalUserMessages = AIMessage::where('role', 'USER')->count();
        
        $totalCustomers = AIConversation::whereNotNull('customer_id')->distinct('customer_id')->count();
        $guestConversations = AIConversation::whereNull('customer_id')->count();
        
        $fallbackCount = AIMessage::where('status', 'FALLBACK')->count();
        $errorCount = AIMessage::where('status', 'ERROR')->count();
        
        $topIntents = AIMessage::select('intent', DB::raw('count(*) as count'))
            ->whereNotNull('intent')
            ->where('intent', '!=', 'FALLBACK')
            ->groupBy('intent')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        return response()->json([
            'message' => 'Lấy thống kê AI thành công',
            'data' => [
                'total_conversations' => $totalConversations,
                'total_messages' => $totalMessages,
                'total_user_messages' => $totalUserMessages,
                'total_customers' => $totalCustomers,
                'guest_conversations' => $guestConversations,
                'fallback_count' => $fallbackCount,
                'error_count' => $errorCount,
                'top_intents' => $topIntents
            ]
        ]);
    }
}
