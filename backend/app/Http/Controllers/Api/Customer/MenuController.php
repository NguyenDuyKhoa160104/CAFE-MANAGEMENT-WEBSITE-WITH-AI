<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Services\Customer\CustomerMenuService;

class MenuController extends Controller
{
    protected $menuService;

    public function __construct(CustomerMenuService $menuService)
    {
        $this->menuService = $menuService;
    }

    public function categories()
    {
        return response()->json($this->menuService->getCategories());
    }

    public function products()
    {
        return response()->json($this->menuService->getProducts());
    }

    public function productDetail($id)
    {
        return response()->json($this->menuService->getProductDetail($id));
    }
}
