<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Admin\AdminIngredientService;
use App\Http\Requests\Admin\Inventory\StoreIngredientRequest;
use App\Http\Requests\Admin\Inventory\UpdateIngredientRequest;
use App\Http\Requests\Admin\Inventory\UpdateIngredientStatusRequest;

class IngredientController extends Controller
{
    protected $ingredientService;

    public function __construct(AdminIngredientService $ingredientService)
    {
        $this->ingredientService = $ingredientService;
    }

    public function index(Request $request)
    {
        $ingredients = $this->ingredientService->paginate($request);
        return response()->json([
            'message' => 'Lấy danh sách nguyên liệu thành công',
            'data' => $ingredients
        ]);
    }

    public function store(StoreIngredientRequest $request)
    {
        $ingredient = $this->ingredientService->create($request->validated());
        return response()->json([
            'message' => 'Thêm nguyên liệu thành công',
            'data' => $ingredient
        ], 201);
    }

    public function show($id)
    {
        $ingredient = $this->ingredientService->findById($id);
        return response()->json([
            'message' => 'Lấy chi tiết nguyên liệu thành công',
            'data' => $ingredient
        ]);
    }

    public function update(UpdateIngredientRequest $request, $id)
    {
        $ingredient = $this->ingredientService->update($id, $request->validated());
        return response()->json([
            'message' => 'Cập nhật nguyên liệu thành công',
            'data' => $ingredient
        ]);
    }

    public function updateStatus(UpdateIngredientStatusRequest $request, $id)
    {
        $ingredient = $this->ingredientService->updateStatus($id, $request->status);
        return response()->json([
            'message' => 'Cập nhật trạng thái thành công',
            'data' => $ingredient
        ]);
    }

    public function destroy($id)
    {
        $this->ingredientService->deleteIfUnused($id);
        return response()->json([
            'message' => 'Xóa nguyên liệu thành công'
        ]);
    }
}
