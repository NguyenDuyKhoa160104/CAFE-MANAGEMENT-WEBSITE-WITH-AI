<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Staff\StaffOrderService;
use App\Http\Requests\Staff\Order\CreateOrderRequest;
use App\Http\Requests\Staff\Order\UpdateOrderRequest;
use App\Http\Requests\Staff\Order\AddOrderItemRequest;
use App\Http\Requests\Staff\Order\UpdateOrderItemRequest;
use App\Http\Requests\Staff\Order\UpdateOrderStatusRequest;
use App\Http\Requests\Staff\Order\CancelOrderRequest;
use App\Http\Requests\Staff\Order\CheckoutOrderRequest;
use App\Services\Staff\StaffCheckoutService;

class OrderController extends Controller
{
    protected $orderService;
    protected $checkoutService;

    public function __construct(StaffOrderService $orderService, StaffCheckoutService $checkoutService)
    {
        $this->orderService = $orderService;
        $this->checkoutService = $checkoutService;
    }

    public function index(Request $request)
    {
        $orders = $this->orderService->paginate($request);
        return response()->json([
            'message' => 'Lấy danh sách đơn hàng thành công',
            'data' => $orders
        ]);
    }

    public function store(CreateOrderRequest $request)
    {
        $order = $this->orderService->createOrder($request->validated(), $request->user()->id);
        return response()->json([
            'message' => 'Tạo đơn hàng thành công',
            'data' => $order
        ], 201);
    }

    public function show($id)
    {
        $order = $this->orderService->findById($id);
        return response()->json([
            'message' => 'Lấy chi tiết đơn hàng thành công',
            'data' => $order
        ]);
    }

    public function update(UpdateOrderRequest $request, $id)
    {
        $order = $this->orderService->findById($id);
        $order = $this->orderService->updateOrder($order, $request->validated());
        return response()->json([
            'message' => 'Cập nhật thông tin đơn hàng thành công',
            'data' => $order
        ]);
    }

    public function addItem(AddOrderItemRequest $request, $id)
    {
        $order = $this->orderService->findById($id);
        $order = $this->orderService->addItem($order, $request->validated());
        return response()->json([
            'message' => 'Thêm món thành công',
            'data' => $order
        ]);
    }

    public function updateItem(UpdateOrderItemRequest $request, $id, $itemId)
    {
        $order = $this->orderService->findById($id);
        $order = $this->orderService->updateItem($order, $itemId, $request->validated());
        return response()->json([
            'message' => 'Cập nhật món thành công',
            'data' => $order
        ]);
    }

    public function removeItem($id, $itemId)
    {
        $order = $this->orderService->findById($id);
        $order = $this->orderService->removeItem($order, $itemId);
        return response()->json([
            'message' => 'Xóa món thành công',
            'data' => $order
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, $id)
    {
        $order = $this->orderService->findById($id);
        $order = $this->orderService->updateStatus($order, $request->status);
        return response()->json([
            'message' => 'Cập nhật trạng thái thành công',
            'data' => $order
        ]);
    }

    public function cancel(CancelOrderRequest $request, $id)
    {
        $order = $this->orderService->findById($id);
        $order = $this->orderService->cancelOrder($order, $request->reason);
        return response()->json([
            'message' => 'Hủy đơn hàng thành công',
            'data' => $order
        ]);
    }

    public function checkout(CheckoutOrderRequest $request, $id)
    {
        $result = $this->checkoutService->checkout($id, $request->user()->id, $request->validated());
        return response()->json([
            'message' => 'Thanh toán đơn hàng thành công',
            'data' => $result
        ]);
    }
}
