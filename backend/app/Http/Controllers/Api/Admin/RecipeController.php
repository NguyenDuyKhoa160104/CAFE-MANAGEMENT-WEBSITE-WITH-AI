<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Admin\AdminRecipeService;
use App\Http\Requests\Admin\Inventory\UpdateProductRecipeRequest;

class RecipeController extends Controller
{
    protected $recipeService;

    public function __construct(AdminRecipeService $recipeService)
    {
        $this->recipeService = $recipeService;
    }

    public function show($productId)
    {
        $recipe = $this->recipeService->getProductRecipe($productId);
        return response()->json([
            'message' => 'Lấy công thức thành công',
            'data' => $recipe
        ]);
    }

    public function update(UpdateProductRecipeRequest $request, $productId)
    {
        $recipe = $this->recipeService->updateProductRecipe($productId, $request->validated());
        return response()->json([
            'message' => 'Cập nhật công thức thành công',
            'data' => $recipe
        ]);
    }
}
