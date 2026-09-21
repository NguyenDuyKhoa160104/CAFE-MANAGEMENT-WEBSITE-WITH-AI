<?php

namespace App\Services\Admin;

use App\Models\StockReceipt;
use App\Models\StockReceiptItem;
use App\Models\Ingredient;
use App\Models\InventoryTransaction;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AdminStockReceiptService
{
    public function paginate($request)
    {
        $query = StockReceipt::with(['admin']);

        if ($request->has('search')) {
            $query->where('receipt_code', 'like', '%' . $request->search . '%');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));
    }

    public function findById($id)
    {
        $receipt = StockReceipt::with(['items', 'admin'])->find($id);
        if (!$receipt) {
            throw new HttpException(404, 'Phiếu nhập không tồn tại.');
        }
        return $receipt;
    }

    public function createDraft(array $data, $adminId)
    {
        return DB::transaction(function () use ($data, $adminId) {
            $receiptCode = 'RC-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            
            $receipt = StockReceipt::create([
                'receipt_code' => $receiptCode,
                'admin_id' => $adminId,
                'supplier_name' => $data['supplier_name'] ?? null,
                'status' => 'DRAFT',
                'note' => $data['note'] ?? null,
                'total_amount' => 0,
            ]);

            $total = 0;
            
            foreach ($data['items'] as $item) {
                $ingredient = Ingredient::find($item['ingredient_id']);
                if (!$ingredient) {
                    throw new HttpException(404, "Nguyên liệu không tồn tại: ID {$item['ingredient_id']}");
                }
                
                $lineTotal = $item['quantity'] * $item['unit_cost'];
                $total += $lineTotal;

                StockReceiptItem::create([
                    'stock_receipt_id' => $receipt->id,
                    'ingredient_id' => $ingredient->id,
                    'ingredient_name' => $ingredient->name,
                    'unit' => $ingredient->unit,
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'line_total' => $lineTotal,
                ]);
            }
            
            $receipt->update(['total_amount' => $total]);
            
            return $this->findById($receipt->id);
        });
    }

    public function updateDraft($id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $receipt = $this->findById($id);
            
            if ($receipt->status !== 'DRAFT') {
                throw new HttpException(409, 'Chỉ có thể sửa phiếu nhập ở trạng thái DRAFT.');
            }

            $receipt->update([
                'supplier_name' => $data['supplier_name'] ?? $receipt->supplier_name,
                'note' => $data['note'] ?? $receipt->note,
            ]);

            // Re-create items
            StockReceiptItem::where('stock_receipt_id', $receipt->id)->delete();
            
            $total = 0;
            
            foreach ($data['items'] as $item) {
                $ingredient = Ingredient::find($item['ingredient_id']);
                if (!$ingredient) {
                    throw new HttpException(404, "Nguyên liệu không tồn tại: ID {$item['ingredient_id']}");
                }
                
                $lineTotal = $item['quantity'] * $item['unit_cost'];
                $total += $lineTotal;

                StockReceiptItem::create([
                    'stock_receipt_id' => $receipt->id,
                    'ingredient_id' => $ingredient->id,
                    'ingredient_name' => $ingredient->name,
                    'unit' => $ingredient->unit,
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'line_total' => $lineTotal,
                ]);
            }
            
            $receipt->update(['total_amount' => $total]);
            
            return $this->findById($receipt->id);
        });
    }

    public function complete($id, $adminId)
    {
        return DB::transaction(function () use ($id, $adminId) {
            $receipt = StockReceipt::lockForUpdate()->find($id);
            
            if (!$receipt) {
                throw new HttpException(404, 'Phiếu nhập không tồn tại.');
            }
            
            if ($receipt->status !== 'DRAFT') {
                throw new HttpException(409, 'Chỉ có thể hoàn tất phiếu nhập ở trạng thái DRAFT.');
            }

            $items = $receipt->items;
            
            // Lock ingredients
            $ingredientIds = $items->pluck('ingredient_id')->filter()->toArray();
            sort($ingredientIds);
            
            $ingredients = Ingredient::whereIn('id', $ingredientIds)->lockForUpdate()->get()->keyBy('id');

            foreach ($items as $item) {
                if (!$item->ingredient_id) continue;
                
                $ingredient = $ingredients->get($item->ingredient_id);
                if (!$ingredient) continue;

                $balanceBefore = $ingredient->current_stock;
                
                // Calculate weighted average cost
                $oldValue = $ingredient->current_stock * $ingredient->average_cost;
                $incomingValue = $item->quantity * $item->unit_cost;
                
                $newStock = $ingredient->current_stock + $item->quantity;
                
                $newAverageCost = $newStock > 0 ? ($oldValue + $incomingValue) / $newStock : 0;
                
                $ingredient->current_stock = $newStock;
                $ingredient->average_cost = $newAverageCost;
                $ingredient->save();

                InventoryTransaction::create([
                    'transaction_code' => 'TXN-' . date('YmdHis') . '-' . strtoupper(substr(uniqid(), -4)) . '-' . $ingredient->id,
                    'ingredient_id' => $ingredient->id,
                    'type' => 'IMPORT',
                    'quantity_change' => $item->quantity,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $newStock,
                    'reference_type' => 'STOCK_RECEIPT',
                    'reference_id' => $receipt->id,
                    'admin_id' => $adminId,
                    'staff_id' => null,
                    'note' => "Nhập kho theo phiếu {$receipt->receipt_code}"
                ]);
            }

            $receipt->update([
                'status' => 'COMPLETED',
                'received_at' => Carbon::now(),
            ]);

            // Recalculate affected products
            $availabilityService = app(\App\Services\Inventory\ProductAvailabilityService::class);
            foreach ($ingredientIds as $ingredientId) {
                $availabilityService->recalculateProductsUsingIngredient($ingredientId);
            }

            return $receipt;
        });
    }

    public function cancelDraft($id)
    {
        $receipt = $this->findById($id);
        
        if ($receipt->status !== 'DRAFT') {
            throw new HttpException(409, 'Chỉ có thể hủy phiếu nhập ở trạng thái DRAFT.');
        }

        $receipt->update(['status' => 'CANCELLED']);
        return $receipt;
    }
}
