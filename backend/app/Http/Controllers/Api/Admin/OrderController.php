<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['table.area', 'staff']);

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('order_code', 'like', '%' . $request->search . '%')
                  ->orWhere('customer_name', 'like', '%' . $request->search . '%')
                  ->orWhere('customer_phone', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('order_type')) {
            $query->where('order_type', $request->order_type);
        }
        
        if ($request->has('table_id')) {
            $query->where('table_id', $request->table_id);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $sort = $request->get('sort', 'desc');
        $orders = $query->orderBy('created_at', $sort)->paginate($request->get('per_page', 15));

        return response()->json([
            'message' => 'Lấy danh sách đơn hàng thành công',
            'data' => $orders
        ]);
    }

    public function show($id)
    {
        $order = Order::with(['table.area', 'staff', 'items', 'payment', 'invoice'])->findOrFail($id);
        return response()->json([
            'message' => 'Lấy chi tiết đơn hàng thành công',
            'data' => $order
        ]);
    }

    public function summary(Request $request)
    {
        $query = Order::query();

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $baseQuery = clone $query;

        // processing orders
        $processing = (clone $baseQuery)->whereIn('status', ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'])->count();
        $completed = (clone $baseQuery)->where('status', 'COMPLETED')->count();
        $cancelled = (clone $baseQuery)->where('status', 'CANCELLED')->count();

        // Revenue calculations
        // We join with payments where status = SUCCESS
        $revenueQuery = $baseQuery->join('payments', 'orders.id', '=', 'payments.order_id')
                                  ->where('payments.status', 'SUCCESS');
        
        $totalRevenue = (clone $revenueQuery)->sum('payments.amount');
        $revenueDineIn = (clone $revenueQuery)->where('orders.order_type', 'DINE_IN')->sum('payments.amount');
        $revenueTakeaway = (clone $revenueQuery)->where('orders.order_type', 'TAKEAWAY')->sum('payments.amount');
        $paymentCash = (clone $revenueQuery)->where('payments.payment_method', 'CASH')->sum('payments.amount');
        $paymentTransfer = (clone $revenueQuery)->where('payments.payment_method', 'BANK_TRANSFER')->sum('payments.amount');

        return response()->json([
            'message' => 'Lấy thống kê thành công',
            'data' => [
                'total_revenue' => $totalRevenue,
                'completed_orders' => $completed,
                'processing_orders' => $processing,
                'cancelled_orders' => $cancelled,
                'avg_order_value' => $completed > 0 ? round($totalRevenue / $completed) : 0,
                'revenue_dine_in' => $revenueDineIn,
                'revenue_takeaway' => $revenueTakeaway,
                'payment_cash' => $paymentCash,
                'payment_transfer' => $paymentTransfer
            ]
        ]);
    }
}
