<?php

namespace App\Services\Admin;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class AdminDashboardService
{
    public function __construct(private RevenueService $revenue, private AdminInventoryService $inventory) {}

    private function counts($query, string $column, array $statuses): array
    {
        $counts = (clone $query)->select($column)->selectRaw('COUNT(*) as total')->groupBy($column)
            ->pluck('total', $column)->map(fn ($value) => (int) $value)->all();

        return array_replace(array_fill_keys($statuses, 0), $counts);
    }

    public function get(DashboardRange $range): array
    {
        $now = CarbonImmutable::now(DashboardRange::TIMEZONE);
        $orders = $range->apply(DB::table('orders'), 'orders.created_at');
        $summary = $this->revenue->summary($range);
        $previous = $this->revenue->summary($range->previous());
        $summary['orders'] = (clone $orders)->count();
        $summary['new_customers'] = $range->apply(DB::table('customers'), 'created_at')->count();
        $comparison = $previous['revenue'] > 0
            ? round(($summary['revenue'] - $previous['revenue']) / $previous['revenue'] * 100, 2) : null;
        $statuses = $this->counts($orders, 'orders.status', ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED']);
        $types = $this->counts($orders, 'orders.order_type', ['DINE_IN', 'TAKEAWAY']);
        $paidOrders = $this->revenue->query($range)->select('payments.order_id');
        // Sales and discounts use the payment period and exclude cancelled orders.
        $sales = DB::table('orders')->whereIn('orders.id', $paidOrders)->where('orders.status', '!=', 'CANCELLED');
        $topProducts = DB::table('order_items')->whereIn('order_id', (clone $sales)->select('orders.id'))
            ->select('product_id', 'product_name')->selectRaw('SUM(quantity) as quantity')
            ->groupBy('product_id', 'product_name')->orderByDesc('quantity')->orderBy('product_name')->limit(5)->get();
        $recentOrders = (clone $orders)->leftJoin('customers', 'customers.id', '=', 'orders.customer_id')
            ->select('orders.id', 'orders.order_code', 'orders.order_type', 'orders.total_amount', 'orders.status', 'orders.created_at', 'orders.customer_type')
            ->selectRaw('COALESCE(customers.full_name, orders.customer_name) as customer_name')
            ->orderByDesc('orders.created_at')->orderByDesc('orders.id')->limit(8)->get();
        foreach ($recentOrders as $order) {
            $order->created_at = CarbonImmutable::parse($order->created_at, 'UTC')->toIso8601String();
        }
        $reservations = $range->apply(DB::table('reservations'), 'reservation_at', true);
        $reservationStatuses = $this->counts($reservations, 'status', ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW']);
        $messages = $range->apply(DB::table('ai_messages'), 'created_at');
        $messageStatuses = $this->counts($messages, 'status', ['SUCCESS', 'FALLBACK', 'ERROR']);
        $aiSettings = DB::table('ai_settings')->orderBy('id')->first(['enabled', 'assistant_name']);
        $promotions = DB::table('promotions')->selectRaw("CASE WHEN status != 'ACTIVE' THEN 'INACTIVE' WHEN starts_at > ? THEN 'UPCOMING' WHEN ends_at < ? THEN 'ENDED' ELSE 'RUNNING' END as state, COUNT(*) as total", [$now->toDateTimeString(), $now->toDateTimeString()])
            ->groupBy('state')->pluck('total', 'state')->map(fn ($n) => (int) $n)->all();
        $vouchers = DB::table('customer_vouchers')->selectRaw("CASE WHEN status IN ('UNUSED', 'RESERVED') AND expires_at < ? THEN 'EXPIRED' ELSE status END as state, COUNT(*) as total", [$now->toDateTimeString()])
            ->groupBy('state')->pluck('total', 'state')->map(fn ($n) => (int) $n)->all();
        $productCounts = DB::table('products')->selectRaw("COALESCE(SUM(CASE WHEN status = 'ACTIVE' AND recipe_configured = 1 AND inventory_available = 1 THEN 1 ELSE 0 END), 0) as selling, COALESCE(SUM(CASE WHEN status = 'ACTIVE' AND recipe_configured = 1 AND inventory_available = 0 THEN 1 ELSE 0 END), 0) as unavailable, COALESCE(SUM(CASE WHEN recipe_configured = 0 THEN 1 ELSE 0 END), 0) as no_recipe")->first();
        $inventory = $this->inventory->getSummary();
        $inventory['low_stock'] = $this->inventory->getLowStock(5, false);
        $inventory['products'] = array_map('intval', (array) $productCounts);
        $period = DB::table('payroll_periods')->where('start_date', '<=', $now->toDateString())
            ->where('end_date', '>=', $now->toDateString())->orderByDesc('start_date')->orderByDesc('id')->first(['id', 'name', 'status', 'start_date', 'end_date']);
        $payroll = null;
        if ($period) {
            $totals = DB::table('payrolls')->where('payroll_period_id', $period->id)
                ->selectRaw('COALESCE(SUM(net_salary), 0) as net_salary, COUNT(DISTINCT staff_id) as staff_count')->first();
            $payroll = [...(array) $period, 'net_salary' => (float) $totals->net_salary, 'staff_count' => (int) $totals->staff_count];
        }

        return [
            'range' => $range->metadata(), 'generated_at' => $now->toIso8601String(),
            'summary' => $summary,
            'revenue' => ['total' => $summary['revenue'], 'previous_total' => $previous['revenue'], 'comparison_percent' => $comparison,
                'previous_range' => $range->previous()->metadata(), 'basis' => 'payments.status = SUCCESS; payments.paid_at'],
            'orders' => ['total' => $summary['orders'], 'statuses' => $statuses, 'types' => $types, 'recent' => $recentOrders, 'top_products' => $topProducts],
            'tables' => $this->counts(DB::table('cafe_tables'), 'status', ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'INACTIVE']),
            'inventory' => $inventory,
            'staff' => $this->counts(DB::table('staffs'), 'status', ['ACTIVE', 'INACTIVE', 'LOCKED']),
            'attendance' => $this->attendance($now), 'payroll' => $payroll,
            'customers' => ['total' => DB::table('customers')->count(), 'new' => $summary['new_customers'], 'active' => DB::table('customers')->where('status', 'ACTIVE')->count()],
            'reservations' => ['statuses' => $reservationStatuses, 'total' => array_sum($reservationStatuses),
                'recent' => (clone $reservations)->select('id', 'reservation_code', 'customer_name', 'reservation_at', 'party_size', 'status')
                    ->orderByRaw("CASE WHEN status = 'PENDING' THEN 0 ELSE 1 END")->orderByDesc('reservation_at')->limit(5)->get()],
            'promotions' => ['statuses' => array_replace(array_fill_keys(['RUNNING', 'UPCOMING', 'ENDED', 'INACTIVE'], 0), $promotions),
                'discount_total' => (float) DB::table('order_promotions')->whereIn('order_id', (clone $sales)->select('orders.id'))->sum('discount_amount')],
            'customer_vouchers' => array_replace(array_fill_keys(['UNUSED', 'RESERVED', 'USED', 'EXPIRED', 'REVOKED'], 0), $vouchers),
            'ai' => ['enabled' => $aiSettings ? (bool) $aiSettings->enabled : null, 'assistant_name' => $aiSettings?->assistant_name,
                'conversations' => $range->apply(DB::table('ai_conversations'), 'created_at')->count(),
                'messages' => array_sum($messageStatuses), 'fallback_count' => $messageStatuses['FALLBACK'], 'error_count' => $messageStatuses['ERROR'],
                'top_intent' => (clone $messages)->where('role', 'USER')->whereNotNull('intent')->select('intent')->selectRaw('COUNT(*) as total')->groupBy('intent')->orderByDesc('total')->orderBy('intent')->first()],
            // There is no audit log. These are actual order-created events, with no invented actor.
            'recent_activity' => $recentOrders->map(fn ($o) => ['type' => 'ORDER_CREATED', 'reference' => $o->order_code, 'at' => $o->created_at]),
            'charts' => ['revenue' => $this->chart($range), 'order_statuses' => $statuses],
        ];
    }

    private function attendance(CarbonImmutable $now): array
    {
        $date = $now->toDateString();
        $statuses = $this->counts(DB::table('attendances')->where('work_date', $date), 'status', ['PRESENT', 'LATE', 'ABSENT', 'LEAVE']);
        $assignments = DB::table('staff_shift_assignments as a')->join('work_shifts as s', 's.id', '=', 'a.work_shift_id')
            ->join('staffs as staff', 'staff.id', '=', 'a.staff_id')->where('staff.status', 'ACTIVE')->where('s.status', 'ACTIVE');
        $unrecorded = (clone $assignments)->where('a.work_date', $date)->whereNotExists(function ($q) {
            $q->selectRaw('1')->from('attendances as t')->whereColumn('t.staff_id', 'a.staff_id')
                ->whereColumn('t.work_shift_id', 'a.work_shift_id')->whereColumn('t.work_date', 'a.work_date');
        })->count();
        $time = $now->format('H:i:s');
        $current = (clone $assignments)->where(function ($q) use ($date, $time, $now) {
            $q->where(function ($q) use ($date, $time) {
                $q->where('a.work_date', $date)->whereColumn('s.start_time', '<', 's.end_time')->where('s.start_time', '<=', $time)->where('s.end_time', '>', $time);
            })->orWhere(function ($q) use ($date, $time) {
                $q->where('a.work_date', $date)->whereColumn('s.start_time', '>=', 's.end_time')->where('s.start_time', '<=', $time);
            })->orWhere(function ($q) use ($now, $time) {
                $q->where('a.work_date', $now->subDay()->toDateString())->whereColumn('s.start_time', '>=', 's.end_time')->where('s.end_time', '>', $time);
            });
        });
        $scheduled = (clone $current)->distinct()->count('a.staff_id');
        $working = $current->whereExists(function ($q) use ($now) {
            $q->selectRaw('1')->from('attendances as t')->whereColumn('t.staff_id', 'a.staff_id')->whereColumn('t.work_shift_id', 'a.work_shift_id')
                ->whereColumn('t.work_date', 'a.work_date')->whereIn('t.status', ['PRESENT', 'LATE'])->whereNotNull('t.check_in_at')
                ->where('t.check_in_at', '<=', $now->utc()->toDateTimeString())->whereNull('t.check_out_at');
        })->distinct()->count('a.staff_id');

        return ['date' => $date, 'statuses' => $statuses, 'unrecorded_assignments' => $unrecorded, 'scheduled_now' => $scheduled, 'working_now' => $working];
    }

    private function chart(DashboardRange $range): array
    {
        $hourly = $range->from->diffInDays($range->to) === 1.0;
        $monthly = $range->from->diffInDays($range->to) > 62;
        $format = $hourly ? '%Y-%m-%d %H:00' : ($monthly ? '%Y-%m' : '%Y-%m-%d');
        $bucket = function (string $column) use ($format) {
            return DB::getDriverName() === 'sqlite'
                ? "strftime('$format', $column, '+7 hours')"
                : "DATE_FORMAT(DATE_ADD($column, INTERVAL 7 HOUR), '$format')";
        };
        $revenues = $this->revenue->query($range)->selectRaw($bucket('paid_at').' as bucket, SUM(amount) as total')->groupBy('bucket')->pluck('total', 'bucket');
        $orders = $range->apply(DB::table('orders'), 'created_at')->selectRaw($bucket('created_at').' as bucket, COUNT(*) as total')->groupBy('bucket')->pluck('total', 'bucket');
        $series = [];
        for ($date = $range->from; $date->lt($range->to); $date = $hourly ? $date->addHour() : ($monthly ? $date->startOfMonth()->addMonth() : $date->addDay())) {
            $key = $date->format($hourly ? 'Y-m-d H:00' : ($monthly ? 'Y-m' : 'Y-m-d'));
            $series[] = ['date' => $key, 'label' => $date->format($hourly ? 'H:00' : ($monthly ? 'm/Y' : 'd/m')),
                'revenue' => (float) ($revenues[$key] ?? 0), 'orders' => (int) ($orders[$key] ?? 0)];
        }

        return $series;
    }
}
