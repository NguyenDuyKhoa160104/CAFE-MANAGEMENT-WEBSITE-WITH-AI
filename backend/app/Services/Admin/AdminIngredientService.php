<?php

namespace App\Services\Admin;

use App\Models\Ingredient;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AdminIngredientService
{
    public function paginate($request)
    {
        $query = Ingredient::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('ingredient_code', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('unit')) {
            $query->where('unit', $request->unit);
        }

        return $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));
    }

    public function findById($id)
    {
        $ingredient = Ingredient::find($id);
        if (!$ingredient) {
            throw new HttpException(404, 'Nguyên liệu không tồn tại.');
        }
        return $ingredient;
    }

    public function create(array $data)
    {
        // current_stock and average_cost are not allowed to be set via create
        return Ingredient::create([
            'ingredient_code' => $data['ingredient_code'],
            'name' => $data['name'],
            'unit' => $data['unit'],
            'minimum_stock' => $data['minimum_stock'] ?? 0,
            'status' => $data['status'] ?? 'ACTIVE',
            'description' => $data['description'] ?? null,
            'current_stock' => 0,
            'average_cost' => 0,
        ]);
    }

    public function update($id, array $data)
    {
        $ingredient = $this->findById($id);
        
        $ingredient->update([
            'ingredient_code' => $data['ingredient_code'],
            'name' => $data['name'],
            'unit' => $data['unit'],
            'minimum_stock' => $data['minimum_stock'] ?? $ingredient->minimum_stock,
            'status' => $data['status'] ?? $ingredient->status,
            'description' => $data['description'] ?? $ingredient->description,
        ]);

        return $ingredient;
    }

    public function updateStatus($id, $status)
    {
        $ingredient = $this->findById($id);
        $ingredient->update(['status' => $status]);
        return $ingredient;
    }

    public function deleteIfUnused($id)
    {
        $ingredient = $this->findById($id);

        $hasRecipe = $ingredient->productIngredients()->exists();
        $hasReceipts = $ingredient->stockReceiptItems()->exists();
        $hasTransactions = $ingredient->inventoryTransactions()->exists();

        if ($hasRecipe || $hasReceipts || $hasTransactions) {
            throw new HttpException(409, 'Nguyên liệu đã phát sinh dữ liệu kho hoặc đang dùng trong công thức và không thể xóa. Vui lòng chuyển trạng thái sang ngưng hoạt động (INACTIVE).');
        }

        $ingredient->delete();
        return true;
    }
}
