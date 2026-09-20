<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CafeTable;
use App\Http\Requests\Admin\StoreCafeTableRequest;
use App\Http\Requests\Admin\UpdateCafeTableRequest;
use Illuminate\Http\Request;

class CafeTableController extends Controller
{
    public function index(Request $request)
    {
        $query = CafeTable::with('area');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('table_code', 'like', "%{$search}%");
            });
        }

        if ($request->has('area_id')) {
            $query->where('area_id', $request->area_id);
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
            case 'capacity_asc':
                $query->orderBy('capacity', 'asc');
                break;
            case 'capacity_desc':
                $query->orderBy('capacity', 'desc');
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

        $tables = $query->paginate(10);

        return response()->json([
            'message' => 'Lấy danh sách bàn thành công',
            'data' => $tables
        ]);
    }

    public function store(StoreCafeTableRequest $request)
    {
        $table = CafeTable::create($request->validated());
        $table->load('area');

        return response()->json([
            'message' => 'Thêm bàn thành công',
            'data' => $table
        ], 201);
    }

    public function show($id)
    {
        $table = CafeTable::with('area')->find($id);

        if (!$table) {
            return response()->json(['message' => 'Không tìm thấy bàn'], 404);
        }

        return response()->json([
            'message' => 'Lấy chi tiết bàn thành công',
            'data' => $table
        ]);
    }

    public function update(UpdateCafeTableRequest $request, $id)
    {
        $table = CafeTable::find($id);

        if (!$table) {
            return response()->json(['message' => 'Không tìm thấy bàn'], 404);
        }

        $table->update($request->validated());
        $table->load('area');

        return response()->json([
            'message' => 'Cập nhật bàn thành công',
            'data' => $table
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:AVAILABLE,OCCUPIED,RESERVED,INACTIVE'
        ]);

        $table = CafeTable::find($id);

        if (!$table) {
            return response()->json(['message' => 'Không tìm thấy bàn'], 404);
        }

        $table->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Cập nhật trạng thái bàn thành công',
            'data' => $table
        ]);
    }

    public function destroy($id)
    {
        $table = CafeTable::find($id);

        if (!$table) {
            return response()->json(['message' => 'Không tìm thấy bàn'], 404);
        }

        // TODO: Sau này nếu bàn đã có lịch sử Order/Reservation,
        // không nên hard delete mà nên chuyển INACTIVE hoặc SoftDeletes.
        $table->delete();

        return response()->json([
            'message' => 'Xóa bàn thành công'
        ]);
    }
}
