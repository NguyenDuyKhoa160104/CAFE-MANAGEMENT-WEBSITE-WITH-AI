<?php

namespace App\Services\Customer;

use App\Models\Invoice;

class CustomerInvoiceService
{
    public function getCustomerInvoices($customerId)
    {
        return Invoice::whereHas('order', function ($query) use ($customerId) {
            $query->where('customer_id', $customerId);
        })
        ->with('order')
        ->orderBy('created_at', 'desc')
        ->get();
    }

    public function getCustomerInvoiceDetail($customerId, $id)
    {
        return Invoice::whereHas('order', function ($query) use ($customerId) {
            $query->where('customer_id', $customerId);
        })
        ->with(['order.items', 'payment'])
        ->findOrFail($id);
    }
}
