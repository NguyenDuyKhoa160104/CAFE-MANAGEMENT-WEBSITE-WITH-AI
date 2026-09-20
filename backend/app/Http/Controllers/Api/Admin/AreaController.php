<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Http\Requests\Admin\StoreAreaRequest;
use App\Http\Requests\Admin\UpdateAreaRequest;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    public function index(Request $request)
    {
        $query = Area::withCount('tables');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('area_code', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sort = $request->get('sort', 'sort_order_asc');
        switch ($sort) {
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'sort_order_desc':
                $query->orderBy('sort_order', 'desc');
                break;
            case 'sort_order_asc':
            default:
                $query->orderBy('sort_order', 'asc');
                break;
        }

        $areas = $query->paginate(10);

        return response()->json([
            'message' => 'Lấy danh sách khu vực thành công',
            'data' => $areas
        ]);
    }

    public function store(StoreAreaRequest $request)
    {
        $area = Area::create($request->validated());

        return response()->json([
            'message' => 'Thêm khu vực thành công',
            'data' => $area
        ], 201);
    }

    public function show($id)
    {
        $area = Area::withCount('tables')->find($id);

        if (!$area) {
            return response()->json(['message' => 'Không tìm thấy khu vực'], 404);
        }

        return response()->json([
            'message' => 'Lấy chi tiết khu vực thành công',
            'data' => $area
        ]);
    }

    public function update(UpdateAreaRequest $request, $id)
    {
        $area = Area::find($id);

        if (!$area) {
            return response()->json(['message' => 'Không tìm thấy khu vực'], 404);
        }

        $area->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật khu vực thành công',
            'data' => $area
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:ACTIVE,INACTIVE'
        ]);

        $area = Area::find($id);

        if (!$area) {
            return response()->json(['message' => 'Không tìm thấy khu vực'], 404);
        }

        $area->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Cập nhật trạng thái khu vực thành công',
            'data' => $area
        ]);
    }

    public function destroy($id)
    {
        $area = Area::find($id);

        if (!$area) {
            return response()->json(['message' => 'Không tìm thấy khu vực'], 404);
        }

        if ($area->tables()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa khu vực đang có bàn'
            ], 409);
        }

        $area->delete();

        return response()->json([
            'message' => 'Xóa khu vực thành công'
        ]);
    }
}
