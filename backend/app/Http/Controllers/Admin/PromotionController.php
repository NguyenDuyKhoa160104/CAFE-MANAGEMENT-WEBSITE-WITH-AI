<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        $query = Promotion::with(['products', 'categories']);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('promotion_code', 'like', "%{$request->search}%");
            });
        }
        if ($request->application_mode) {
            $query->where('application_mode', $request->application_mode);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $promotions = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json([
            'message' => 'Lấy danh sách thành công',
            'data' => $promotions
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'promotion_code' => 'required|string|max:50|unique:promotions',
            'application_mode' => 'required|in:AUTO,CODE',
            'discount_type' => 'required|in:PERCENTAGE,FIXED_AMOUNT',
            'scope' => 'required|in:ORDER,CATEGORY,PRODUCT',
            'discount_value' => 'required|numeric|min:0',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'status' => 'nullable|in:ACTIVE,INACTIVE',
            'categories' => 'array',
            'categories.*' => 'exists:categories,id',
            'products' => 'array',
            'products.*' => 'exists:products,id'
        ]);

        return DB::transaction(function () use ($request) {
            $promo = Promotion::create($request->except(['categories', 'products']));
            
            if ($request->scope === 'CATEGORY' && $request->has('categories')) {
                $promo->categories()->sync($request->categories);
            }
            if ($request->scope === 'PRODUCT' && $request->has('products')) {
                $promo->products()->sync($request->products);
            }

            return response()->json([
                'message' => 'Tạo khuyến mãi thành công',
                'data' => $promo->load(['categories', 'products'])
            ], 201);
        });
    }

    public function show($id)
    {
        $promo = Promotion::with(['categories', 'products'])->findOrFail($id);
        return response()->json([
            'message' => 'Chi tiết khuyến mãi',
            'data' => $promo
        ]);
    }

    public function update(Request $request, $id)
    {
        $promo = Promotion::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:150',
            'promotion_code' => "required|string|max:50|unique:promotions,promotion_code,{$id}",
            'application_mode' => 'required|in:AUTO,CODE',
            'discount_type' => 'required|in:PERCENTAGE,FIXED_AMOUNT',
            'scope' => 'required|in:ORDER,CATEGORY,PRODUCT',
            'discount_value' => 'required|numeric|min:0',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'categories' => 'array',
            'categories.*' => 'exists:categories,id',
            'products' => 'array',
            'products.*' => 'exists:products,id'
        ]);

        return DB::transaction(function () use ($request, $promo) {
            $promo->update($request->except(['categories', 'products']));
            
            if ($request->scope === 'CATEGORY' && $request->has('categories')) {
                $promo->categories()->sync($request->categories);
            } else {
                $promo->categories()->detach();
            }
            
            if ($request->scope === 'PRODUCT' && $request->has('products')) {
                $promo->products()->sync($request->products);
            } else {
                $promo->products()->detach();
            }

            return response()->json([
                'message' => 'Cập nhật khuyến mãi thành công',
                'data' => $promo->load(['categories', 'products'])
            ]);
        });
    }

    public function updateStatus(Request $request, $id)
    {
        $promo = Promotion::findOrFail($id);
        $request->validate(['status' => 'required|in:ACTIVE,INACTIVE']);
        $promo->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công',
            'data' => $promo
        ]);
    }

    public function destroy($id)
    {
        $promo = Promotion::findOrFail($id);
        // Check if used in order
        $isUsed = \App\Models\OrderPromotion::where('promotion_id', $id)->exists();
        if ($isUsed) {
            return response()->json([
                'message' => 'Khuyến mãi đã được sử dụng trong đơn hàng, không thể xóa.'
            ], 409);
        }
        
        $promo->delete();
        return response()->json([
            'message' => 'Xóa khuyến mãi thành công'
        ]);
    }
}
