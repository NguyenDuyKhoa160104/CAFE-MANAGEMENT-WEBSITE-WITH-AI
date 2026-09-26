<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerVoucher;
use App\Models\Promotion;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CustomerVoucherController extends Controller
{
    public function index(Request $request)
    {
        $query = CustomerVoucher::with(['customer', 'promotion', 'admin', 'order']);

        if ($request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }
        if ($request->promotion_id) {
            $query->where('promotion_id', $request->promotion_id);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $vouchers = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json([
            'message' => 'Lấy danh sách thành công',
            'data' => $vouchers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'promotion_id' => 'required|exists:promotions,id',
            'expires_at' => 'nullable|date|after:now',
            'note' => 'nullable|string'
        ]);

        $promo = Promotion::findOrFail($request->promotion_id);
        
        if ($promo->application_mode !== 'CODE') {
            return response()->json([
                'message' => 'Chỉ có thể tặng khuyến mãi loại CODE.'
            ], 422);
        }

        $voucher = CustomerVoucher::create([
            'customer_id' => $request->customer_id,
            'promotion_id' => $request->promotion_id,
            'voucher_code' => 'CV-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
            'status' => 'UNUSED',
            'assigned_by' => $request->user()->id,
            'assigned_at' => now(),
            'expires_at' => $request->expires_at ?? $promo->ends_at,
            'note' => $request->note
        ]);

        return response()->json([
            'message' => 'Tặng voucher thành công',
            'data' => $voucher->load(['customer', 'promotion'])
        ], 201);
    }

    public function revoke($id)
    {
        $voucher = CustomerVoucher::findOrFail($id);
        
        if ($voucher->status !== 'UNUSED') {
            return response()->json([
                'message' => 'Chỉ có thể thu hồi voucher chưa sử dụng.'
            ], 422);
        }

        $voucher->update(['status' => 'REVOKED']);

        return response()->json([
            'message' => 'Thu hồi voucher thành công'
        ]);
    }
}
