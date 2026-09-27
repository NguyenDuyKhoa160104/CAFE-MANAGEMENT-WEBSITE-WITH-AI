<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Services\Admin\DashboardRange;
use App\Services\Admin\RevenueService;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with(['order.table', 'staff']);

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('invoice_code', 'like', '%'.$request->search.'%')
                    ->orWhere('customer_name', 'like', '%'.$request->search.'%')
                    ->orWhere('customer_phone', 'like', '%'.$request->search.'%');
            });
        }

        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->has('date_from')) {
            $query->whereDate('issued_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('issued_at', '<=', $request->date_to);
        }

        $invoices = $query->orderBy('issued_at', 'desc')->paginate($request->get('per_page', 15));

        return response()->json([
            'message' => 'Lấy danh sách hóa đơn thành công',
            'data' => $invoices,
        ]);
    }

    public function show($id)
    {
        $invoice = Invoice::with(['order.items', 'order.table', 'staff', 'payment'])->findOrFail($id);

        return response()->json([
            'message' => 'Lấy chi tiết hóa đơn thành công',
            'data' => $invoice,
        ]);
    }

    public function dashboardSummary()
    {
        $query = app(RevenueService::class)->query(DashboardRange::make(['range' => 'TODAY']));
        $totalRevenue = (clone $query)->sum('amount');
        $totalOrders = (clone $query)->distinct()->count('order_id');
        $cashRevenue = (clone $query)->where('payment_method', 'CASH')->sum('amount');
        $transferRevenue = (clone $query)->where('payment_method', 'BANK_TRANSFER')->sum('amount');

        return response()->json([
            'message' => 'Lấy thống kê thành công',
            'data' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'cash_revenue' => $cashRevenue,
                'transfer_revenue' => $transferRevenue,
            ],
        ]);
    }
}
