<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\Order\StoreOrderRequest;
use App\Services\Customer\CustomerOrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected $orderService;

    public function __construct(CustomerOrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function index(Request $request)
    {
        return response()->json($this->orderService->getCustomerOrders($request->user()->id));
    }

    public function store(StoreOrderRequest $request)
    {
        $order = $this->orderService->storeOrder($request->user(), $request->validated());

        return response()->json([
            'message' => 'Đặt hàng thành công',
            'order' => $order,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        return response()->json($this->orderService->getCustomerOrderDetail($request->user()->id, $id));
    }

    public function cancel(Request $request, $id)
    {
        $order = $this->orderService->cancelOrder($request->user()->id, $id);

        return response()->json([
            'message' => 'Đã hủy đơn hàng',
            'order' => $order,
        ]);
    }
}
