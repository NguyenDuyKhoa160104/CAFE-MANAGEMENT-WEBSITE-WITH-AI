<?php

namespace App\Services\Staff;

use App\Models\Area;
use App\Models\CafeTable;

class StaffTableService
{
    /**
     * Get active areas
     */
    public function getAreas($request)
    {
        $query = Area::where('status', 'ACTIVE')
            ->withCount('tables');
            
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        
        return $query->orderBy('sort_order', 'asc')->get();
    }

    /**
     * Get tables with optional active order
     */
    public function getTables($request)
    {
        $query = CafeTable::with(['area', 'activeOrder' => function ($q) {
            $q->select('orders.id', 'orders.table_id', 'orders.order_code', 'orders.status', 'orders.total_amount', 'orders.customer_name', 'orders.customer_type', 'orders.created_at', 'orders.staff_id');
        }]);

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('table_code', 'like', '%' . $request->search . '%');
        }

        if ($request->has('area_id')) {
            $query->where('area_id', $request->area_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $query->orderBy('sort_order', 'asc');

        if ($request->has('per_page')) {
            return $query->paginate($request->per_page);
        }

        return $query->get();
    }

    /**
     * Get table detail with active order
     */
    public function getTableDetail($id)
    {
        return CafeTable::with(['area', 'activeOrder.staff'])->findOrFail($id);
    }
}
