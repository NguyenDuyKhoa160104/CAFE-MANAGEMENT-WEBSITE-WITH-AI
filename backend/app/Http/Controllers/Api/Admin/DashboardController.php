<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AdminDashboardService;
use App\Services\Admin\DashboardRange;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DashboardController extends Controller
{
    public function __invoke(Request $request, AdminDashboardService $service)
    {
        $input = $request->validate([
            'range' => ['sometimes', Rule::in(['TODAY', '7_DAYS', '30_DAYS', 'THIS_MONTH', 'CUSTOM'])],
            'from' => ['required_if:range,CUSTOM', 'nullable', 'date_format:Y-m-d'],
            'to' => ['required_if:range,CUSTOM', 'nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        return response()->json(['message' => 'Dashboard loaded', 'data' => $service->get(DashboardRange::make($input))]);
    }
}
