<?php

namespace App\Services\AI;

use App\Models\Product;
use App\Models\Promotion;
use App\Models\AIKnowledgeEntry;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\CustomerVoucher;
use Carbon\Carbon;

class AiContextService
{
    public function getContextByIntent(string $intent, ?int $customerId = null): string
    {
        $context = "";

        switch ($intent) {
            case 'MENU':
            case 'PRODUCT_SEARCH':
            case 'PRODUCT_PRICE':
            case 'PRODUCT_RECOMMENDATION':
                $context = $this->getProductContext();
                break;
            case 'PROMOTION':
                $context = $this->getPromotionContext();
                break;
            case 'OPENING_HOURS':
            case 'RESERVATION_GUIDE':
            case 'ORDER_GUIDE':
            case 'PAYMENT':
            case 'OTHER':
            case 'GREETING':
                $context = $this->getKnowledgeContext($intent);
                break;
            case 'RESERVATION_STATUS':
                if ($customerId) {
                    $context = $this->getReservationContext($customerId);
                } else {
                    $context = "SYSTEM NOTE: Khách chưa đăng nhập, không thể xem đơn hàng/đặt bàn.";
                }
                break;
            case 'ORDER_STATUS':
                if ($customerId) {
                    $context = $this->getOrderContext($customerId);
                } else {
                    $context = "SYSTEM NOTE: Khách chưa đăng nhập, không thể xem đơn hàng/đặt bàn.";
                }
                break;
            case 'VOUCHER':
                if ($customerId) {
                    $context = $this->getVoucherContext($customerId);
                } else {
                    $context = "SYSTEM NOTE: Khách chưa đăng nhập, không thể xem voucher.";
                }
                break;
        }

        return $context;
    }

    private function getProductContext(): string
    {
        $products = Product::where('status', 'ACTIVE')
            ->with('category')
            ->limit(20)
            ->get();
            
        if ($products->isEmpty()) {
            return "Không có sản phẩm nào.";
        }

        $lines = ["PRODUCT DATA (Thực đơn hiện tại):"];
        foreach ($products as $p) {
            $catName = $p->category ? $p->category->name : 'Khác';
            $lines[] = "- {$p->name} (Giá: " . number_format($p->price, 0, ',', '.') . "đ) - Danh mục: {$catName} - Trạng thái: " . ($p->inventory_available ? 'Còn hàng' : 'Hết hàng');
        }

        return implode("\n", $lines);
    }

    private function getPromotionContext(): string
    {
        $promos = Promotion::where('status', 'ACTIVE')
            ->where(function($query) {
                $now = Carbon::now();
                $query->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function($query) {
                $now = Carbon::now();
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->get();

        if ($promos->isEmpty()) {
            return "Hiện không có chương trình khuyến mãi nào.";
        }

        $lines = ["PROMOTIONS (Khuyến mãi đang áp dụng):"];
        foreach ($promos as $promo) {
            $val = $promo->discount_type === 'PERCENTAGE' ? "{$promo->discount_value}%" : number_format($promo->discount_value, 0, ',', '.') . "đ";
            $lines[] = "- {$promo->name}: Giảm {$val} (Mã: {$promo->code})";
            $lines[] = "  Mô tả: {$promo->description}";
        }

        return implode("\n", $lines);
    }

    private function getKnowledgeContext(string $intent): string
    {
        // Try to find matching knowledge entries
        $query = AIKnowledgeEntry::where('status', 'ACTIVE');
        
        // Very basic mapping intent -> category
        if ($intent === 'OPENING_HOURS') $query->where('category', 'OPENING_HOURS');
        if ($intent === 'RESERVATION_GUIDE') $query->where('category', 'RESERVATION');
        if ($intent === 'ORDER_GUIDE') $query->where('category', 'ORDER_GUIDE');
        if ($intent === 'PAYMENT') $query->where('category', 'PAYMENT');
        
        $entries = $query->get();
        if ($entries->isEmpty()) {
            // Fallback to all active knowledge
            $entries = AIKnowledgeEntry::where('status', 'ACTIVE')->get();
        }

        $lines = ["CAFE KNOWLEDGE:"];
        foreach ($entries as $e) {
            $lines[] = "Title: {$e->title}\nContent: {$e->content}\n---";
        }

        return implode("\n", $lines);
    }

    private function getReservationContext(int $customerId): string
    {
        $reservations = Reservation::where('customer_id', $customerId)
            ->orderBy('reservation_time', 'desc')
            ->limit(5)
            ->get();

        if ($reservations->isEmpty()) {
            return "Khách hàng chưa có lịch đặt bàn nào.";
        }

        $lines = ["RESERVATION STATUS (Lịch đặt bàn của khách):"];
        foreach ($reservations as $r) {
            $lines[] = "- Bàn {$r->party_size} người, lúc {$r->reservation_time}, trạng thái: {$r->status}, ID: {$r->id}";
        }

        return implode("\n", $lines);
    }

    private function getOrderContext(int $customerId): string
    {
        $orders = Order::where('customer_id', $customerId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        if ($orders->isEmpty()) {
            return "Khách hàng chưa có đơn hàng nào.";
        }

        $lines = ["ORDER STATUS (Đơn hàng của khách):"];
        foreach ($orders as $o) {
            $lines[] = "- Đơn #{$o->id} - Tổng tiền: " . number_format($o->total_amount, 0, ',', '.') . "đ - Trạng thái: {$o->status} - Ngày: {$o->created_at}";
        }

        return implode("\n", $lines);
    }

    private function getVoucherContext(int $customerId): string
    {
        if (class_exists(CustomerVoucher::class)) {
            $vouchers = CustomerVoucher::with('promotion')
                ->where('customer_id', $customerId)
                ->where('is_used', false)
                ->get();

            if ($vouchers->isEmpty()) {
                return "Khách hàng không có voucher nào khả dụng.";
            }

            $lines = ["CUSTOMER VOUCHERS:"];
            foreach ($vouchers as $v) {
                if ($v->promotion) {
                    $lines[] = "- Voucher từ CTKM: {$v->promotion->name} - Mã: {$v->promotion->code}";
                }
            }
            return implode("\n", $lines);
        }
        return "";
    }
}
