<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $input = $request->validate([
            'search' => 'nullable|string|max:150', 'page' => 'nullable|integer|min:1',
            'status' => ['nullable', Rule::in(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])],
        ]);
        $query = DB::table('reservations')->select('id', 'reservation_code', 'customer_name', 'customer_phone', 'reservation_at', 'party_size', 'status');
        if (! empty($input['status'])) {
            $query->where('status', $input['status']);
        }
        if (! empty($input['search'])) {
            $query->where(fn ($q) => $q->where('reservation_code', 'like', '%'.$input['search'].'%')->orWhere('customer_name', 'like', '%'.$input['search'].'%'));
        }

        return response()->json(['data' => $query->orderByDesc('reservation_at')->orderByDesc('id')->paginate(15)]);
    }
}
