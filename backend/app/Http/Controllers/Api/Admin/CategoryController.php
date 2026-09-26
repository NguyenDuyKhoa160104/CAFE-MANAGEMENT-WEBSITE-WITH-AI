<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\StoreCategoryRequest;
use App\Http\Requests\Api\Admin\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::withCount('products');

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('category_code', 'like', "%{$search}%");
            });
        }

        // Filter status
        if ($request->filled('status') && in_array($request->input('status'), ['ACTIVE', 'INACTIVE'])) {
            $query->where('status', $request->input('status'));
        }

        // Sort
        $sort = $request->input('sort', 'sort_order_asc');
        switch ($sort) {
            case 'sort_order_desc':
                $query->orderBy('sort_order', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'created_at_newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'created_at_oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'sort_order_asc':
            default:
                $query->orderBy('sort_order', 'asc');
                break;
        }

        $categories = $query->paginate(15);

        return response()->json([
            'message' => 'Lấy danh sách danh mục thành công',
            'data' => $categories
        ]);
    }

    public function store(StoreCategoryRequest $request)
    {
        $data = $request->validated();
        
        $data['slug'] = Str::slug($data['name']);
        
        // Ensure slug uniqueness (simple implementation)
        $originalSlug = $data['slug'];
        $counter = 1;
        while (Category::where('slug', $data['slug'])->exists()) {
            $data['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        if ($request->hasFile('image')) {
            $cloudinaryService = app(\App\Services\Cloudinary\CloudinaryService::class);
            $uploadResult = $cloudinaryService->uploadCategory($request->file('image'));
            if ($uploadResult) {
                $data['image'] = $uploadResult['url'];
                $data['image_public_id'] = $uploadResult['public_id'];
            }
        }

        if (!isset($data['status'])) {
            $data['status'] = 'ACTIVE';
        }

        $category = Category::create($data);

        return response()->json([
            'message' => 'Thêm danh mục thành công',
            'data' => $category
        ], 201);
    }

    public function show($id)
    {
        $category = Category::withCount('products')->find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Không tìm thấy danh mục'
            ], 404);
        }

        return response()->json([
            'message' => 'Lấy chi tiết danh mục thành công',
            'data' => $category
        ]);
    }

    public function update(UpdateCategoryRequest $request, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Không tìm thấy danh mục'
            ], 404);
        }

        $data = $request->validated();

        if (isset($data['name']) && $data['name'] !== $category->name) {
            $data['slug'] = Str::slug($data['name']);
            
            $originalSlug = $data['slug'];
            $counter = 1;
            while (Category::where('slug', $data['slug'])->where('id', '!=', $category->id)->exists()) {
                $data['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        if ($request->hasFile('image')) {
            $cloudinaryService = app(\App\Services\Cloudinary\CloudinaryService::class);
            $uploadResult = $cloudinaryService->uploadCategory($request->file('image'));
            
            if ($uploadResult) {
                $data['image'] = $uploadResult['url'];
                $data['image_public_id'] = $uploadResult['public_id'];
                
                // Delete old image after successful upload
                if ($category->image_public_id) {
                    $cloudinaryService->delete($category->image_public_id);
                }
            }
        } elseif ($request->has('image') && is_string($request->image)) {
            // Do not update image field if it's a string URL from frontend
            unset($data['image']);
        }

        $category->update($data);

        return response()->json([
            'message' => 'Cập nhật danh mục thành công',
            'data' => $category
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:ACTIVE,INACTIVE'
        ]);

        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Không tìm thấy danh mục'
            ], 404);
        }

        $category->update([
            'status' => $request->input('status')
        ]);

        return response()->json([
            'message' => 'Cập nhật trạng thái danh mục thành công',
            'data' => $category
        ]);
    }

    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Không tìm thấy danh mục'
            ], 404);
        }

        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa danh mục đang có sản phẩm'
            ], 409);
        }

        $imagePublicId = $category->image_public_id;
        $category->delete();

        if ($imagePublicId) {
            $cloudinaryService = app(\App\Services\Cloudinary\CloudinaryService::class);
            $cloudinaryService->delete($imagePublicId);
        }

        return response()->json([
            'message' => 'Xóa danh mục thành công'
        ]);
    }

    public function removeImage($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Không tìm thấy danh mục'
            ], 404);
        }

        if ($category->image_public_id) {
            $cloudinaryService = app(\App\Services\Cloudinary\CloudinaryService::class);
            $cloudinaryService->delete($category->image_public_id);
        }

        $category->update([
            'image' => null,
            'image_public_id' => null
        ]);

        return response()->json([
            'message' => 'Xóa ảnh danh mục thành công',
            'data' => $category
        ]);
    }
}
