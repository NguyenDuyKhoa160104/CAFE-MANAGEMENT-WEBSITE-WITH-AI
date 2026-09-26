<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\StoreProductRequest;
use App\Http\Requests\Api\Admin\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('product_code', 'like', "%{$search}%");
            });
        }

        // Filter category_id
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        // Filter status
        if ($request->filled('status') && in_array($request->input('status'), ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'])) {
            $query->where('status', $request->input('status'));
        }

        // Filter is_featured
        if ($request->filled('is_featured')) {
            $query->where('is_featured', filter_var($request->input('is_featured'), FILTER_VALIDATE_BOOLEAN));
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
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
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

        $products = $query->paginate(15);

        return response()->json([
            'message' => 'Lấy danh sách sản phẩm thành công',
            'data' => $products
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();
        
        $data['slug'] = Str::slug($data['name']);
        
        // Ensure slug uniqueness
        $originalSlug = $data['slug'];
        $counter = 1;
        while (Product::where('slug', $data['slug'])->exists()) {
            $data['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        if ($request->hasFile('image')) {
            $cloudinaryService = app(\App\Services\Cloudinary\CloudinaryService::class);
            $uploadResult = $cloudinaryService->uploadProduct($request->file('image'));
            if ($uploadResult) {
                $data['image'] = $uploadResult['url'];
                $data['image_public_id'] = $uploadResult['public_id'];
            }
        }

        if (!isset($data['status'])) {
            $data['status'] = 'ACTIVE';
        }

        $product = Product::create($data);
        
        $product->load('category');

        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'data' => $product
        ], 201);
    }

    public function show($id)
    {
        $product = Product::with('category')->find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Không tìm thấy sản phẩm'
            ], 404);
        }

        return response()->json([
            'message' => 'Lấy chi tiết sản phẩm thành công',
            'data' => $product
        ]);
    }

    public function update(UpdateProductRequest $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Không tìm thấy sản phẩm'
            ], 404);
        }

        $data = $request->validated();

        if (isset($data['name']) && $data['name'] !== $product->name) {
            $data['slug'] = Str::slug($data['name']);
            
            $originalSlug = $data['slug'];
            $counter = 1;
            while (Product::where('slug', $data['slug'])->where('id', '!=', $product->id)->exists()) {
                $data['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        if ($request->hasFile('image')) {
            $cloudinaryService = app(\App\Services\Cloudinary\CloudinaryService::class);
            $uploadResult = $cloudinaryService->uploadProduct($request->file('image'));
            
            if ($uploadResult) {
                $data['image'] = $uploadResult['url'];
                $data['image_public_id'] = $uploadResult['public_id'];
                
                // Delete old image after successful upload
                if ($product->image_public_id) {
                    $cloudinaryService->delete($product->image_public_id);
                }
            }
        } elseif ($request->has('image') && is_string($request->image)) {
            // Do not update image field if it's a string URL from frontend
            unset($data['image']);
        }

        $product->update($data);
        
        $product->load('category');

        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => $product
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:ACTIVE,INACTIVE,OUT_OF_STOCK'
        ]);

        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Không tìm thấy sản phẩm'
            ], 404);
        }

        $product->update([
            'status' => $request->input('status')
        ]);

        return response()->json([
            'message' => 'Cập nhật trạng thái sản phẩm thành công',
            'data' => $product
        ]);
    }
    
    public function toggleFeatured(Request $request, $id)
    {
        $request->validate([
            'is_featured' => 'required|boolean'
        ]);

        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Không tìm thấy sản phẩm'
            ], 404);
        }

        $product->update([
            'is_featured' => $request->input('is_featured')
        ]);

        return response()->json([
            'message' => 'Cập nhật trạng thái nổi bật thành công',
            'data' => $product
        ]);
    }

    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Không tìm thấy sản phẩm'
            ], 404);
        }

        $imagePublicId = $product->image_public_id;
        $product->delete();

        if ($imagePublicId) {
            $cloudinaryService = app(\App\Services\Cloudinary\CloudinaryService::class);
            $cloudinaryService->delete($imagePublicId);
        }

        return response()->json([
            'message' => 'Xóa sản phẩm thành công'
        ]);
    }

    public function removeImage($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Không tìm thấy sản phẩm'
            ], 404);
        }

        if ($product->image_public_id) {
            $cloudinaryService = app(\App\Services\Cloudinary\CloudinaryService::class);
            $cloudinaryService->delete($product->image_public_id);
        }

        $product->update([
            'image' => null,
            'image_public_id' => null
        ]);
        
        $product->load('category');

        return response()->json([
            'message' => 'Xóa ảnh sản phẩm thành công',
            'data' => $product
        ]);
    }
}
