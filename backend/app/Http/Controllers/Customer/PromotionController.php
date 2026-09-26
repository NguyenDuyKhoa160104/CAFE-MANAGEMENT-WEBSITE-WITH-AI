<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Services\Promotions\PromotionEngine;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function active()
    {
        $promotions = Promotion::activeNow()
            ->where('application_mode', 'AUTO') // typically display AUTO promotions to everyone
            ->select('id', 'name', 'description', 'discount_type', 'discount_value', 'scope', 'ends_at', 'banner_image')
            ->get();

        return response()->json([
            'message' => 'Lấy danh sách khuyến mãi thành công',
            'data' => $promotions
        ]);
    }

    public function preview(Request $request, PromotionEngine $engine)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'promotion_code' => 'nullable|string|max:50'
        ]);

        try {
            $result = $engine->calculate($request->items, $request->promotion_code);
            return response()->json([
                'message' => 'Preview khuyến mãi thành công',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }
}
