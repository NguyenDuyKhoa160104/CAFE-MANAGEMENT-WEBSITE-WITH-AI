<?php

namespace App\Services\Admin;

use Illuminate\Support\Facades\DB;

class RevenueService
{
    public function query(?DashboardRange $range = null)
    {
        $query = DB::table('payments')->where('payments.status', 'SUCCESS');

        return $range ? $range->apply($query, 'payments.paid_at') : $query;
    }

    public function summary(?DashboardRange $range = null): array
    {
        $row = $this->query($range)->selectRaw('COALESCE(SUM(amount), 0) as revenue, COUNT(DISTINCT order_id) as paid_orders')->first();

        return ['revenue' => (float) $row->revenue, 'paid_orders' => (int) $row->paid_orders,
            'average_order_value' => $row->paid_orders ? round($row->revenue / $row->paid_orders, 2) : 0];
    }
}
