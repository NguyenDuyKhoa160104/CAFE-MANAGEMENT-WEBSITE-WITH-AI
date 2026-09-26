<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\StaffShiftAssignment;
use App\Models\Attendance;
use App\Models\CafeTable;
use App\Models\Order;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $staff = $request->user();
        $today = Carbon::now()->toDateString();
        $now = Carbon::now();

        // 1. Lấy ca làm việc hôm nay
        // Nếu có nhiều ca, lấy ca đang active (trong khoảng start_time và end_time) hoặc ca chưa hoàn thành (chưa checkout), 
        // hoặc ưu tiên ca sớm nhất nếu chưa vào ca nào.
        
        $assignments = StaffShiftAssignment::with('workShift')
            ->where('staff_id', $staff->id)
            ->where('work_date', $today)
            ->get();
            
        $currentShift = null;
        $attendance = null;

        if ($assignments->isNotEmpty()) {
            // Sắp xếp các assignments
            $assignments = $assignments->sortBy(function($a) {
                return $a->workShift ? $a->workShift->start_time : '00:00:00';
            });
            
            // Tìm ca phù hợp
            foreach ($assignments as $assignment) {
                $att = Attendance::where('staff_id', $staff->id)
                    ->where('work_date', $today)
                    ->where('work_shift_id', $assignment->work_shift_id)
                    ->first();
                
                if (!$att) {
                    $currentShift = $assignment;
                    $attendance = null;
                    break;
                } elseif ($att->status !== 'ABSENT' && $att->status !== 'LEAVE' && !$att->check_out_at) {
                    // Đang trong ca
                    $currentShift = $assignment;
                    $attendance = $att;
                    break;
                }
            }
            
            if (!$currentShift) {
                // Đã check-out hoặc absent hết các ca, lấy ca cuối cùng
                $currentShift = $assignments->last();
                $attendance = Attendance::where('staff_id', $staff->id)
                    ->where('work_date', $today)
                    ->where('work_shift_id', $currentShift->work_shift_id)
                    ->first();
            }
        }

        // 2. Thống kê bàn
        $availableTables = CafeTable::where('status', 'AVAILABLE')->count();
        $occupiedTables = CafeTable::where('status', 'OCCUPIED')->count();
        
        // Tóm tắt danh sách bàn
        $tables = CafeTable::orderBy('name')->get(['id', 'name', 'status', 'capacity']);

        // 3. Thống kê đơn hàng (Active)
        $activeOrderStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'];
        $activeOrdersCount = Order::whereIn('status', $activeOrderStatuses)->count();

        // Đơn hoàn thành trong ca (Nếu đang trong ca)
        $completedOrdersCount = 0;
        $servedTablesCount = 0;
        
        if ($attendance && $attendance->check_in_at) {
            $checkOutLimit = $attendance->check_out_at ?: $now;
            $completedOrdersCount = Order::where('status', 'COMPLETED')
                ->where('staff_id', $staff->id)
                ->whereBetween('created_at', [$attendance->check_in_at, $checkOutLimit])
                ->count();
                
            $servedTablesCount = Order::where('status', 'COMPLETED')
                ->where('staff_id', $staff->id)
                ->whereNotNull('table_id')
                ->whereBetween('created_at', [$attendance->check_in_at, $checkOutLimit])
                ->distinct('table_id')
                ->count();
        } else {
            // Lấy hôm nay
            $completedOrdersCount = Order::where('status', 'COMPLETED')
                ->where('staff_id', $staff->id)
                ->whereDate('created_at', $today)
                ->count();
            
            $servedTablesCount = Order::where('status', 'COMPLETED')
                ->where('staff_id', $staff->id)
                ->whereNotNull('table_id')
                ->whereDate('created_at', $today)
                ->distinct('table_id')
                ->count();
        }

        return response()->json([
            'message' => 'Lấy dữ liệu dashboard thành công',
            'data' => [
                'staff' => [
                    'id' => $staff->id,
                    'full_name' => $staff->full_name,
                ],
                'shift' => $currentShift ? [
                    'assignment_id' => $currentShift->id,
                    'shift_id' => $currentShift->work_shift_id,
                    'name' => $currentShift->workShift ? $currentShift->workShift->name : 'Ca linh hoạt',
                    'start_time' => $currentShift->workShift ? $currentShift->workShift->start_time : null,
                    'end_time' => $currentShift->workShift ? $currentShift->workShift->end_time : null,
                    'grace_minutes' => $currentShift->workShift ? $currentShift->workShift->grace_minutes : 0
                ] : null,
                'attendance' => $attendance ? [
                    'id' => $attendance->id,
                    'status' => $attendance->status,
                    'check_in_at' => $attendance->check_in_at,
                    'check_out_at' => $attendance->check_out_at,
                    'worked_minutes' => $attendance->worked_minutes,
                    'late_minutes' => $attendance->late_minutes,
                    'overtime_minutes' => $attendance->overtime_minutes,
                ] : null,
                'table_summary' => [
                    'available' => $availableTables,
                    'occupied' => $occupiedTables,
                    'tables' => $tables
                ],
                'order_summary' => [
                    'active_count' => $activeOrdersCount,
                    'completed_in_shift' => $completedOrdersCount,
                ],
                'performance' => [
                    'processed_orders' => $completedOrdersCount,
                    'served_tables' => $servedTablesCount
                ]
            ]
        ], 200);
    }
}
