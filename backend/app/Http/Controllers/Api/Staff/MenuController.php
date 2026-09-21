<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Staff\StaffMenuService;

class MenuController extends Controller
{
    protected $menuService;

    public function __construct(StaffMenuService $menuService)
    {
        $this->menuService = $menuService;
    }

    public function getCategories()
    {
        $categories = $this->menuService->getCategories();
        return response()->json([
            'message' => 'Lấy danh sách danh mục thành công',
            'data' => $categories
        ]);
    }

    public function getProducts(Request $request)
    {
        $products = $this->menuService->getProducts($request);
        return response()->json([
            'message' => 'Lấy danh sách sản phẩm thành công',
            'data' => $products
        ]);
    }

    public function getProductDetail($id)
    {
        $product = $this->menuService->getProductDetail($id);
        return response()->json([
            'message' => 'Lấy chi tiết sản phẩm thành công',
            'data' => $product
        ]);
    }
}
