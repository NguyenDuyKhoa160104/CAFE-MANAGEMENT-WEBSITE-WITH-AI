<?php

namespace App\Services\Admin;

use App\Models\Ingredient;
use App\Models\InventoryTransaction;
use App\Models\ProductIngredient;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Support\Facades\DB;

class AdminInventoryService
{
    public function getSummary()
    {
        $ingredients = Ingredient::all();
        
        $totalIngredients = $ingredients->count();
        $activeIngredients = $ingredients->where('status', 'ACTIVE')->count();
        
        $lowStockCount = $ingredients->filter(function($ing) {
            return $ing->current_stock > 0 && $ing->current_stock <= $ing->minimum_stock;
        })->count();
        
        $outOfStockCount = $ingredients->where('current_stock', '<=', 0)->count();

        $normalStockCount = $ingredients->filter(function($ing) {
            return $ing->current_stock > $ing->minimum_stock;
        })->count();
        
        $inventoryValue = $ingredients->reduce(function ($carry, $ing) {
            return $carry + ($ing->current_stock * $ing->average_cost);
        }, 0);

        return [
            'total_ingredients' => $totalIngredients,
            'active_ingredients' => $activeIngredients,
            'normal_stock_count' => $normalStockCount,
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
            'inventory_value' => $inventoryValue,
        ];
    }

    public function getTransactions($request)
    {
        $query = InventoryTransaction::with(['ingredient', 'admin', 'staff']);

        if ($request->has('ingredient_id')) {
            $query->where('ingredient_id', $request->ingredient_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->has('reference_type')) {
            $query->where('reference_type', $request->reference_type);
        }
        
        if ($request->has('admin_id')) {
            $query->where('admin_id', $request->admin_id);
        }
        
        if ($request->has('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('ingredient', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('ingredient_code', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));
    }

    public function getLowStock()
    {
        return Ingredient::where('status', 'ACTIVE')
                ->where(function($q) {
                    $q->where('current_stock', '<=', 0)
                      ->orWhereColumn('current_stock', '<=', 'minimum_stock');
                })
                ->get()
                ->map(function ($ing) {
                    $status = 'NORMAL';
                    if ($ing->current_stock <= 0) {
                        $status = 'OUT';
                    } elseif ($ing->current_stock <= $ing->minimum_stock) {
                        $status = 'LOW';
                    }
                    
                    return [
                        'id' => $ing->id,
                        'ingredient_code' => $ing->ingredient_code,
                        'name' => $ing->name,
                        'unit' => $ing->unit,
                        'current_stock' => $ing->current_stock,
                        'minimum_stock' => $ing->minimum_stock,
                        'inventory_status' => $status
                    ];
                });
    }

    public function getIngredientStockDetail($id)
    {
        $ingredient = Ingredient::find($id);
        if (!$ingredient) {
            throw new HttpException(404, 'Nguyên liệu không tồn tại.');
        }
        
        $estimatedValue = $ingredient->current_stock * $ingredient->average_cost;
        
        $recentTransactions = InventoryTransaction::where('ingredient_id', $id)
                                ->orderBy('created_at', 'desc')
                                ->take(10)
                                ->get();
                                
        $productsUsing = ProductIngredient::with('product')
                            ->where('ingredient_id', $id)
                            ->get()
                            ->map(function ($pi) {
                                return [
                                    'product_id' => $pi->product->id,
                                    'product_name' => $pi->product->name,
                                    'quantity_required' => $pi->quantity_required,
                                ];
                            });

        return [
            'ingredient' => $ingredient,
            'estimated_inventory_value' => $estimatedValue,
            'recent_transactions' => $recentTransactions,
            'products_using_ingredient' => $productsUsing
        ];
    }

    public function adjustStock(array $data, $adminId)
    {
        return DB::transaction(function () use ($data, $adminId) {
            $ingredient = Ingredient::lockForUpdate()->find($data['ingredient_id']);
            
            if (!$ingredient) {
                throw new HttpException(404, 'Nguyên liệu không tồn tại.');
            }

            $quantity = $data['quantity']; // guaranteed > 0 by validation
            $type = $data['type'];
            
            $qtyChange = 0;
            if ($type === 'ADJUSTMENT_IN') {
                $qtyChange = $quantity;
            } else {
                // ADJUSTMENT_OUT or WASTE
                $qtyChange = -$quantity;
            }
            
            $balanceBefore = $ingredient->current_stock;
            $newStock = $ingredient->current_stock + $qtyChange;
            
            if ($newStock < 0) {
                throw new HttpException(409, 'Không đủ tồn kho để thực hiện điều chỉnh.');
            }
            
            $ingredient->current_stock = $newStock;
            $ingredient->save();
            
            $transaction = InventoryTransaction::create([
                'transaction_code' => 'TXN-' . date('YmdHis') . '-' . strtoupper(substr(uniqid(), -4)) . '-' . $ingredient->id,
                'ingredient_id' => $ingredient->id,
                'type' => $type,
                'quantity_change' => $qtyChange,
                'balance_before' => $balanceBefore,
                'balance_after' => $newStock,
                'reference_type' => 'ADJUSTMENT',
                'reference_id' => null,
                'admin_id' => $adminId,
                'staff_id' => null,
                'note' => $data['reason']
            ]);
            
            // Recalculate affected products
            app(\App\Services\Inventory\ProductAvailabilityService::class)->recalculateProductsUsingIngredient($ingredient->id);
            
            return $transaction;
        });
    }
}
