<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Services\Customer\CustomerInvoiceService;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    protected $invoiceService;

    public function __construct(CustomerInvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    public function index(Request $request)
    {
        return response()->json($this->invoiceService->getCustomerInvoices($request->user()->id));
    }

    public function show(Request $request, $id)
    {
        return response()->json($this->invoiceService->getCustomerInvoiceDetail($request->user()->id, $id));
    }
}
