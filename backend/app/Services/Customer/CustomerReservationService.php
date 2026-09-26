<?php

namespace App\Services\Customer;

use App\Models\CafeTable;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomerReservationService
{
    public function getAvailableTables($reservationAt, $partySize, $durationMinutes = 120)
    {
        $start = Carbon::parse($reservationAt);
        $end = $start->copy()->addMinutes($durationMinutes);

        // Subquery to find table IDs that are overlapping
        $overlappingTables = Reservation::whereIn('status', ['PENDING', 'CONFIRMED'])
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('reservation_at', [$start, $end])
                    ->orWhereRaw('DATE_ADD(reservation_at, INTERVAL duration_minutes MINUTE) > ? AND reservation_at < ?', [$start, $end]);
            })
            ->pluck('table_id')
            ->toArray();

        return CafeTable::where('status', '!=', 'INACTIVE')
            ->where('capacity', '>=', $partySize)
            ->whereNotIn('id', $overlappingTables)
            ->get();
    }

    public function storeReservation($customer, array $data)
    {
        $reservationAt = Carbon::parse($data['reservation_at']);
        $durationMinutes = 120;
        $endAt = $reservationAt->copy()->addMinutes($durationMinutes);

        return DB::transaction(function () use ($customer, $data, $reservationAt, $endAt, $durationMinutes) {
            $table = CafeTable::where('id', $data['table_id'])
                ->where('status', '!=', 'INACTIVE')
                ->where('capacity', '>=', $data['party_size'])
                ->lockForUpdate()
                ->first();

            if (!$table) {
                throw ValidationException::withMessages([
                    'table_id' => ['Bàn không tồn tại, không hoạt động hoặc không đủ chỗ.'],
                ]);
            }

            // Re-check overlap
            $overlap = Reservation::where('table_id', $table->id)
                ->whereIn('status', ['PENDING', 'CONFIRMED'])
                ->where(function ($query) use ($reservationAt, $endAt) {
                    $query->whereBetween('reservation_at', [$reservationAt, $endAt])
                        ->orWhereRaw('DATE_ADD(reservation_at, INTERVAL duration_minutes MINUTE) > ? AND reservation_at < ?', [$reservationAt, $endAt]);
                })
                ->exists();

            if ($overlap) {
                abort(409, 'Bàn này đã được đặt trong khoảng thời gian bạn chọn.');
            }

            return Reservation::create([
                'reservation_code' => 'RES' . strtoupper(uniqid()),
                'customer_id' => $customer->id,
                'table_id' => $table->id,
                'reservation_at' => $reservationAt,
                'duration_minutes' => $durationMinutes,
                'party_size' => $data['party_size'],
                'customer_name' => $customer->full_name,
                'customer_phone' => $customer->phone,
                'note' => $data['note'] ?? null,
                'status' => 'PENDING',
            ]);
        });
    }

    public function getCustomerReservations($customerId)
    {
        return Reservation::where('customer_id', $customerId)
            ->with('table')
            ->orderBy('reservation_at', 'desc')
            ->get();
    }

    public function getCustomerReservationDetail($customerId, $id)
    {
        return Reservation::where('customer_id', $customerId)
            ->with('table')
            ->findOrFail($id);
    }

    public function cancelReservation($customerId, $id)
    {
        $reservation = Reservation::where('customer_id', $customerId)->findOrFail($id);

        if (!in_array($reservation->status, ['PENDING', 'CONFIRMED'])) {
            abort(409, 'Không thể hủy lịch đặt bàn ở trạng thái hiện tại.');
        }

        $reservation->update([
            'status' => 'CANCELLED',
            'cancelled_at' => now(),
            'cancel_reason' => 'Khách hàng tự hủy',
        ]);

        return $reservation;
    }
}
