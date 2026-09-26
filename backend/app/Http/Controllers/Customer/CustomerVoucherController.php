<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomerVoucher;
use App\Services\Promotions\PromotionEngine;
use Illuminate\Http\Request;

class CustomerVoucherController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status'); // e.g. UNUSED
        $query = CustomerVoucher::with('promotion')
            ->where('customer_id', $request->user()->id);

        if ($status) {
            $query->where('status', $status);
        }

        $vouchers = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'message' => 'Lấy ví voucher thành công',
            'data' => $vouchers
        ]);
    }

    public function show(Request $request, $id)
    {
        $voucher = CustomerVoucher::with('promotion')
            ->where('customer_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'message' => 'Chi tiết voucher',
            'data' => $voucher
        ]);
    }

    public function preview(Request $request, $id, PromotionEngine $engine)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $voucher = CustomerVoucher::with('promotion')
            ->where('customer_id', $request->user()->id)
            ->findOrFail($id);

        if (!$voucher->isUsable()) {
            return response()->json([
                'message' => 'Voucher này không khả dụng hoặc đã hết hạn.'
            ], 422);
        }

        try {
            // Note: PromotionEngine already has a parameter for promotion_code
            // But for voucher we can just pass the code of the promotion linked to this voucher
            $result = $engine->calculate($request->items, $voucher->promotion->promotion_code);
            return response()->json([
                'message' => 'Preview voucher thành công',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }
}
