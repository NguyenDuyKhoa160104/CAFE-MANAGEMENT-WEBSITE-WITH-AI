<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AIKnowledgeEntry;

class AIKnowledgeController extends Controller
{
    public function index(Request $request)
    {
        $query = AIKnowledgeEntry::query();
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        $entries = $query->orderBy('sort_order', 'asc')->orderBy('id', 'desc')->get();
        
        return response()->json([
            'message' => 'Lấy danh sách kiến thức thành công',
            'data' => $entries
        ]);
    }

    public function show($id)
    {
        $entry = AIKnowledgeEntry::findOrFail($id);
        return response()->json([
            'message' => 'Lấy chi tiết kiến thức thành công',
            'data' => $entry
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'category' => 'nullable|string|max:50',
            'content' => 'required|string',
            'status' => 'in:ACTIVE,INACTIVE',
            'sort_order' => 'integer',
        ]);

        $validated['created_by'] = auth('admin')->id() ?? 1; // Default to 1 if no auth in tests

        $entry = AIKnowledgeEntry::create($validated);

        return response()->json([
            'message' => 'Thêm kiến thức thành công',
            'data' => $entry
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $entry = AIKnowledgeEntry::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'string|max:200',
            'category' => 'nullable|string|max:50',
            'content' => 'string',
            'status' => 'in:ACTIVE,INACTIVE',
            'sort_order' => 'integer',
        ]);

        $validated['updated_by'] = auth('admin')->id() ?? 1;

        $entry->update($validated);

        return response()->json([
            'message' => 'Cập nhật kiến thức thành công',
            'data' => $entry
        ]);
    }
    
    public function updateStatus(Request $request, $id)
    {
        $entry = AIKnowledgeEntry::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:ACTIVE,INACTIVE',
        ]);

        $entry->update($validated);

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công',
            'data' => $entry
        ]);
    }

    public function destroy($id)
    {
        $entry = AIKnowledgeEntry::findOrFail($id);
        $entry->delete();

        return response()->json([
            'message' => 'Xóa kiến thức thành công'
        ]);
    }
}
