<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Customer;
use App\Models\Staff;
use App\Services\Admin\AdminDashboardService;
use App\Services\Admin\DashboardRange;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // A new disposable connection only. Never RefreshDatabase/migrate:fresh on the application DB.
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:', 'database.connections.sqlite.url' => null]);
        DB::purge('sqlite');
        $this->artisan('migrate', ['--force' => true])->assertExitCode(0);
        Carbon::setTestNow(Carbon::parse('2026-09-27 03:00:00', 'UTC'));
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-09-27 03:00:00', 'UTC'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        CarbonImmutable::setTestNow();
        DB::disconnect('sqlite');
        parent::tearDown();
    }

    private function admin(): void
    {
        Sanctum::actingAs(new Admin(['id' => 1]));
    }

    private function insert(string $table, array $data): int
    {
        return DB::table($table)->insertGetId([...$data, 'created_at' => $data['created_at'] ?? '2026-09-27 02:00:00', 'updated_at' => '2026-09-27 02:00:00']);
    }

    private function order(string $code, string $status = 'COMPLETED', string $created = '2026-09-27 02:00:00'): int
    {
        return $this->insert('orders', ['order_code' => $code, 'status' => $status, 'total_amount' => 100000, 'created_at' => $created]);
    }

    private function payment(int $order, float $amount, string $status = 'SUCCESS', string $paid = '2026-09-27 02:00:00'): void
    {
        $this->insert('payments', ['order_id' => $order, 'payment_code' => 'P'.$order, 'payment_method' => 'CASH', 'amount' => $amount, 'status' => $status, 'paid_at' => $paid]);
    }

    public function test_access_validation_and_empty_database(): void
    {
        $this->getJson('/api/admin/dashboard')->assertUnauthorized();
        Sanctum::actingAs(new Staff);
        $this->getJson('/api/admin/dashboard')->assertForbidden();
        Sanctum::actingAs(new Customer);
        $this->getJson('/api/admin/dashboard')->assertForbidden();
        $this->admin();
        foreach (['range=INVALID', 'range=CUSTOM', 'range=CUSTOM&from=2026-02-30&to=2026-03-01', 'range=CUSTOM&from=2026-09-28&to=2026-09-27', 'range=CUSTOM&from=2020-01-01&to=2026-09-27'] as $query) {
            $this->getJson('/api/admin/dashboard?'.$query)->assertUnprocessable();
        }
        $this->getJson('/api/admin/dashboard')->assertOk()->assertJsonPath('data.summary.revenue', 0)
            ->assertJsonPath('data.summary.average_order_value', 0)->assertJsonPath('data.summary.orders', 0)
            ->assertJsonPath('data.payroll', null)->assertJsonPath('data.ai.enabled', null)
            ->assertJsonPath('data.reservations.total', 0)->assertJsonCount(24, 'data.charts.revenue')
            ->assertJsonCount(0, 'data.orders.recent')->assertJsonPath('data.revenue.comparison_percent', null);
    }

    public function test_revenue_uses_successful_payment_time_and_reports_agree(): void
    {
        $this->admin();
        $a = $this->order('A', 'COMPLETED', '2026-09-20 00:00:00');
        $this->payment($a, 80000, 'SUCCESS', '2026-09-26 17:00:00'); // midnight Vietnam
        $b = $this->order('B', 'PENDING');
        $this->payment($b, 200000, 'FAILED');
        $this->order('C', 'CANCELLED');
        $this->payment($this->order('previous', 'COMPLETED', '2026-09-25 20:00:00'), 40000, 'SUCCESS', '2026-09-26 16:59:59');
        $this->payment($this->order('next', 'COMPLETED', '2026-09-27 17:00:00'), 900000, 'SUCCESS', '2026-09-27 17:00:00');
        $this->insert('order_promotions', ['order_id' => $a, 'promotion_name' => 'Sale', 'application_mode' => 'AUTO', 'discount_type' => 'FIXED_AMOUNT', 'scope' => 'ORDER', 'discount_value' => 20000, 'discount_amount' => 20000, 'applied_at' => '2026-09-26 17:00:00']);
        $response = $this->getJson('/api/admin/dashboard')->assertOk()->assertJsonPath('data.summary.revenue', 80000)
            ->assertJsonPath('data.summary.paid_orders', 1)->assertJsonPath('data.summary.average_order_value', 80000)
            ->assertJsonPath('data.summary.orders', 2)->assertJsonPath('data.promotions.discount_total', 20000)
            ->assertJsonPath('data.revenue.comparison_percent', 100)->assertJsonPath('data.charts.revenue.0.revenue', 80000);
        $this->assertEquals(80000, array_sum(array_column($response->json('data.charts.revenue'), 'revenue')));
        $this->getJson('/api/admin/orders/summary?date_from=2026-09-27&date_to=2026-09-27')->assertOk()->assertJsonPath('data.total_revenue', 80000)->assertJsonPath('data.avg_order_value', 80000);
        $this->getJson('/api/admin/invoices/summary')->assertOk()->assertJsonPath('data.total_revenue', 80000);
        $this->getJson('/api/admin/dashboard?range=7_DAYS')->assertOk()->assertJsonPath('data.summary.revenue', 120000)->assertJsonCount(7, 'data.charts.revenue');
        $this->getJson('/api/admin/dashboard?range=30_DAYS')->assertOk()->assertJsonCount(30, 'data.charts.revenue');
        $this->getJson('/api/admin/dashboard?range=THIS_MONTH')->assertOk()->assertJsonPath('data.summary.revenue', 1020000)->assertJsonCount(30, 'data.charts.revenue');
        $this->getJson('/api/admin/dashboard?range=CUSTOM&from=2026-01-01&to=2026-09-27')->assertOk()->assertJsonCount(9, 'data.charts.revenue');
    }

    public function test_top_products_exclude_cancelled_and_unpaid_orders(): void
    {
        $this->admin();
        foreach ([['A', 'COMPLETED', 5, true], ['B', 'SERVED', 3, true], ['A', 'CANCELLED', 100, true], ['B', 'PENDING', 200, false]] as $i => [$name, $status, $qty, $paid]) {
            $id = $this->order('O'.$i, $status);
            if ($paid) {
                $this->payment($id, 80000);
            }
            $this->insert('order_items', ['order_id' => $id, 'product_name' => $name, 'unit_price' => 20000, 'quantity' => $qty, 'line_total' => 20000 * $qty]);
        }
        $this->getJson('/api/admin/dashboard')->assertOk()->assertJsonCount(2, 'data.orders.top_products')
            ->assertJsonPath('data.orders.top_products.0.product_name', 'A')->assertJsonPath('data.orders.top_products.0.quantity', 5)
            ->assertJsonPath('data.orders.top_products.1.quantity', 3)->assertJsonPath('data.summary.paid_orders', 3);
    }

    public function test_inventory_attendance_payroll_promotions_customers_and_ai(): void
    {
        $this->admin();
        foreach ([0, 50, 150] as $i => $stock) {
            $this->insert('ingredients', ['ingredient_code' => 'I'.$i, 'name' => 'Ingredient '.$i, 'unit' => 'GRAM', 'current_stock' => $stock, 'minimum_stock' => 100]);
        }
        $staff = $this->insert('staffs', ['staff_code' => 'S1', 'full_name' => 'Staff', 'email' => 'staff@test.local', 'password' => 'test', 'position' => 'BARISTA', 'hire_date' => '2026-01-01']);
        foreach (['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'LATE', 'LEAVE', 'ABSENT'] as $status) {
            $this->insert('attendances', ['staff_id' => $staff, 'work_date' => '2026-09-27', 'status' => $status]);
        }
        $this->insert('attendances', ['staff_id' => $staff, 'work_date' => '2026-09-26', 'status' => 'ABSENT']);
        $customer = $this->insert('customers', ['full_name' => 'Customer', 'email' => 'customer@test.local', 'password' => 'test']);
        $this->insert('reservations', ['reservation_code' => 'R1', 'customer_id' => $customer, 'reservation_at' => '2026-09-27 00:30:00', 'party_size' => 2]);
        foreach ([['ACTIVE', '2026-09-28', '2026-10-01'], ['ACTIVE', '2026-09-26', '2026-09-28'], ['ACTIVE', '2026-09-01', '2026-09-26'], ['INACTIVE', '2026-09-26', '2026-09-28']] as $i => [$status, $start, $end]) {
            $this->insert('promotions', ['promotion_code' => 'PR'.$i, 'name' => 'Promo', 'application_mode' => 'AUTO', 'discount_type' => 'FIXED_AMOUNT', 'scope' => 'ORDER', 'discount_value' => 1000, 'starts_at' => $start, 'ends_at' => $end, 'status' => $status]);
        }
        $this->insert('ai_settings', ['enabled' => false]);
        $conversation = $this->insert('ai_conversations', ['conversation_code' => 'AI1']);
        foreach ([['USER', 'SUCCESS'], ['ASSISTANT', 'FALLBACK'], ['ASSISTANT', 'ERROR']] as [$role, $status]) {
            $this->insert('ai_messages', ['conversation_id' => $conversation, 'role' => $role, 'content' => 'Test', 'intent' => 'MENU', 'status' => $status]);
        }
        $period = $this->insert('payroll_periods', ['period_code' => 'SEP', 'name' => 'September', 'start_date' => '2026-09-01', 'end_date' => '2026-09-30', 'standard_work_days' => 26]);
        $this->insert('payrolls', ['payroll_period_id' => $period, 'staff_id' => $staff, 'base_salary' => 1000, 'standard_work_days' => 26, 'actual_work_days' => 20, 'net_salary' => 800]);
        $this->getJson('/api/admin/dashboard')->assertOk()
            ->assertJsonPath('data.inventory.out_of_stock_count', 1)->assertJsonPath('data.inventory.low_stock_count', 1)->assertJsonPath('data.inventory.normal_stock_count', 1)
            ->assertJsonPath('data.attendance.statuses', ['PRESENT' => 3, 'LATE' => 2, 'ABSENT' => 1, 'LEAVE' => 1])
            ->assertJsonPath('data.payroll.net_salary', 800)->assertJsonPath('data.payroll.staff_count', 1)
            ->assertJsonPath('data.reservations.statuses.PENDING', 1)->assertJsonPath('data.customers.new', 1)
            ->assertJsonPath('data.promotions.statuses', ['RUNNING' => 1, 'UPCOMING' => 1, 'ENDED' => 1, 'INACTIVE' => 1])
            ->assertJsonPath('data.ai.enabled', false)->assertJsonPath('data.ai.messages', 3)->assertJsonPath('data.ai.fallback_count', 1)
            ->assertJsonPath('data.ai.error_count', 1)->assertJsonPath('data.ai.top_intent.total', 1);
        $this->getJson('/api/admin/dashboard?range=CUSTOM&from=2026-08-01&to=2026-08-02')->assertOk()->assertJsonPath('data.inventory.low_stock_count', 1)->assertJsonPath('data.customers.new', 0)->assertJsonPath('data.ai.messages', 0);
    }

    public function test_product_availability_tables_vouchers_and_navigation_endpoints(): void
    {
        $this->admin();
        $category = $this->insert('categories', ['category_code' => 'CAT', 'name' => 'Coffee', 'slug' => 'coffee']);
        foreach ([['ACTIVE', true, true], ['ACTIVE', true, false], ['INACTIVE', true, true], ['ACTIVE', false, false]] as $i => [$status, $recipe, $available]) {
            $this->insert('products', ['category_id' => $category, 'product_code' => 'P'.$i, 'name' => 'Product '.$i, 'slug' => 'product-'.$i,
                'price' => 10000, 'status' => $status, 'recipe_configured' => $recipe, 'inventory_available' => $available]);
        }
        $area = $this->insert('areas', ['area_code' => 'AREA', 'name' => 'Ground floor']);
        foreach (['AVAILABLE', 'OCCUPIED', 'RESERVED', 'INACTIVE'] as $status) {
            $this->insert('cafe_tables', ['area_id' => $area, 'table_code' => $status, 'name' => $status, 'status' => $status]);
        }
        $customer = $this->insert('customers', ['full_name' => 'Member', 'email' => 'member@test.local', 'password' => 'secret']);
        $promotion = $this->insert('promotions', ['promotion_code' => 'VOUCHER', 'name' => 'Voucher', 'application_mode' => 'CODE', 'discount_type' => 'FIXED_AMOUNT', 'scope' => 'ORDER', 'discount_value' => 1000, 'starts_at' => '2026-09-01', 'ends_at' => '2026-09-30']);
        foreach (['UNUSED', 'RESERVED', 'USED', 'EXPIRED', 'REVOKED'] as $status) {
            $this->insert('customer_vouchers', ['customer_id' => $customer, 'promotion_id' => $promotion, 'status' => $status]);
        }
        $this->insert('customer_vouchers', ['customer_id' => $customer, 'promotion_id' => $promotion, 'status' => 'UNUSED', 'expires_at' => '2026-09-26 23:59:59']);
        $before = DB::table('customer_vouchers')->pluck('status')->all();
        $this->getJson('/api/admin/dashboard')->assertOk()
            ->assertJsonPath('data.inventory.products', ['selling' => 1, 'unavailable' => 1, 'no_recipe' => 1])
            ->assertJsonPath('data.tables', ['AVAILABLE' => 1, 'OCCUPIED' => 1, 'RESERVED' => 1, 'INACTIVE' => 1])
            ->assertJsonPath('data.customer_vouchers', ['UNUSED' => 1, 'RESERVED' => 1, 'USED' => 1, 'EXPIRED' => 2, 'REVOKED' => 1]);
        $this->assertSame($before, DB::table('customer_vouchers')->pluck('status')->all());
        $this->assertSame('INACTIVE', DB::table('products')->where('product_code', 'P2')->value('status'));
        $this->getJson('/api/admin/customers?search=Member')->assertOk()->assertJsonCount(1, 'data.data')->assertJsonMissingPath('data.data.0.password');
        $this->getJson('/api/admin/reservations?status=PENDING')->assertOk()->assertJsonCount(0, 'data.data');
        $this->getJson('/api/admin/reservations?status=INVALID')->assertUnprocessable();
        Sanctum::actingAs(new Customer);
        $this->getJson('/api/admin/reservations')->assertForbidden();
        $this->getJson('/api/admin/customers')->assertForbidden();
    }

    public function test_current_shift_handles_midnight_and_query_count_is_bounded(): void
    {
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-09-26 18:00:00', 'UTC')); // 01:00 in Vietnam
        $staff = $this->insert('staffs', ['staff_code' => 'S1', 'full_name' => 'Staff', 'email' => 'staff@test.local', 'password' => 'test', 'position' => 'BARISTA', 'hire_date' => '2026-01-01']);
        $shift = $this->insert('work_shifts', ['shift_code' => 'NIGHT', 'name' => 'Night', 'start_time' => '22:00:00', 'end_time' => '06:00:00']);
        $this->insert('staff_shift_assignments', ['staff_id' => $staff, 'work_shift_id' => $shift, 'work_date' => '2026-09-26']);
        $this->insert('attendances', ['staff_id' => $staff, 'work_shift_id' => $shift, 'work_date' => '2026-09-26', 'status' => 'PRESENT', 'check_in_at' => '2026-09-26 15:00:00']);
        DB::enableQueryLog();
        $data = app(AdminDashboardService::class)->get(DashboardRange::make([]));
        $queries = count(DB::getQueryLog());
        $this->assertSame(1, $data['attendance']['scheduled_now']);
        $this->assertSame(1, $data['attendance']['working_now']);
        $this->assertLessThan(45, $queries);
        DB::disableQueryLog();
        for ($i = 0; $i < 20; $i++) {
            $this->order('Q'.$i);
        }
        DB::flushQueryLog();
        DB::enableQueryLog();
        $data = app(AdminDashboardService::class)->get(DashboardRange::make([]));
        $this->assertCount(8, $data['orders']['recent']);
        $this->assertSame($queries, count(DB::getQueryLog()));
        DB::disableQueryLog();
    }
}
