<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Admin\AdminInventoryService;
use App\Http\Requests\Admin\Inventory\AdjustStockRequest;

class InventoryController extends Controller
{
    protected $inventoryService;

    public function __construct(AdminInventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function summary()
    {
        $summary = $this->inventoryService->getSummary();
        return response()->json([
            'message' => 'Lấy tổng quan kho thành công',
            'data' => $summary
        ]);
    }

    public function transactions(Request $request)
    {
        $transactions = $this->inventoryService->getTransactions($request);
        return response()->json([
            'message' => 'Lấy lịch sử giao dịch kho thành công',
            'data' => $transactions
        ]);
    }

    public function lowStock()
    {
        $lowStock = $this->inventoryService->getLowStock();
        return response()->json([
            'message' => 'Lấy danh sách nguyên liệu sắp hết thành công',
            'data' => $lowStock
        ]);
    }

    public function ingredientDetail($id)
    {
        $detail = $this->inventoryService->getIngredientStockDetail($id);
        return response()->json([
            'message' => 'Lấy chi tiết nguyên liệu thành công',
            'data' => $detail
        ]);
    }

    public function adjust(AdjustStockRequest $request)
    {
        $transaction = $this->inventoryService->adjustStock($request->validated(), $request->user()->id);
        return response()->json([
            'message' => 'Điều chỉnh tồn kho thành công',
            'data' => $transaction
        ]);
    }
}
