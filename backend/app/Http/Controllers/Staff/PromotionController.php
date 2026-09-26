<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Services\Promotions\PromotionEngine;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
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
