<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Admin\AdminStockReceiptService;
use App\Http\Requests\Admin\Inventory\StoreStockReceiptRequest;
use App\Http\Requests\Admin\Inventory\UpdateStockReceiptRequest;

class StockReceiptController extends Controller
{
    protected $receiptService;

    public function __construct(AdminStockReceiptService $receiptService)
    {
        $this->receiptService = $receiptService;
    }

    public function index(Request $request)
    {
        $receipts = $this->receiptService->paginate($request);
        return response()->json([
            'message' => 'Lấy danh sách phiếu nhập thành công',
            'data' => $receipts
        ]);
    }

    public function store(StoreStockReceiptRequest $request)
    {
        $receipt = $this->receiptService->createDraft($request->validated(), $request->user()->id);
        return response()->json([
            'message' => 'Tạo phiếu nhập nháp thành công',
            'data' => $receipt
        ], 201);
    }

    public function show($id)
    {
        $receipt = $this->receiptService->findById($id);
        return response()->json([
            'message' => 'Lấy chi tiết phiếu nhập thành công',
            'data' => $receipt
        ]);
    }

    public function update(UpdateStockReceiptRequest $request, $id)
    {
        $receipt = $this->receiptService->updateDraft($id, $request->validated());
        return response()->json([
            'message' => 'Cập nhật phiếu nhập nháp thành công',
            'data' => $receipt
        ]);
    }

    public function complete(Request $request, $id)
    {
        $receipt = $this->receiptService->complete($id, $request->user()->id);
        return response()->json([
            'message' => 'Hoàn tất nhập kho thành công',
            'data' => $receipt
        ]);
    }

    public function cancel($id)
    {
        $receipt = $this->receiptService->cancelDraft($id);
        return response()->json([
            'message' => 'Hủy phiếu nhập thành công',
            'data' => $receipt
        ]);
    }
}
