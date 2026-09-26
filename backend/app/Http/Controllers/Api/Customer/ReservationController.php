<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\Reservation\StoreReservationRequest;
use App\Services\Customer\CustomerReservationService;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    protected $reservationService;

    public function __construct(CustomerReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }

    public function availableTables(Request $request)
    {
        $request->validate([
            'reservation_at' => 'required|date|after:now',
            'party_size' => 'required|integer|min:1',
        ]);

        return response()->json($this->reservationService->getAvailableTables(
            $request->reservation_at,
            $request->party_size
        ));
    }

    public function index(Request $request)
    {
        return response()->json($this->reservationService->getCustomerReservations($request->user()->id));
    }

    public function store(StoreReservationRequest $request)
    {
        $reservation = $this->reservationService->storeReservation($request->user(), $request->validated());

        return response()->json([
            'message' => 'Đặt bàn thành công',
            'reservation' => $reservation,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        return response()->json($this->reservationService->getCustomerReservationDetail($request->user()->id, $id));
    }

    public function cancel(Request $request, $id)
    {
        $reservation = $this->reservationService->cancelReservation($request->user()->id, $id);

        return response()->json([
            'message' => 'Đã hủy đặt bàn',
            'reservation' => $reservation,
        ]);
    }
}
