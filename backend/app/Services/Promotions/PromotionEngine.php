<?php

namespace App\Services\Promotions;

use App\Models\Promotion;
use App\Models\Product;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class PromotionEngine
{
    /**
     * @param array $items Array of ['product_id' => int, 'quantity' => int]
     * @param string|null $promotionCode
     * @return array
     * @throws \Exception
     */
    public function calculate(array $items, ?string $promotionCode = null): array
    {
        // 1. Load Products
        $productIds = collect($items)->pluck('product_id')->unique()->toArray();
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $enrichedItems = [];
        $subtotal = 0;

        foreach ($items as $item) {
            $product = $products->get($item['product_id']);
            if (!$product) continue;

            $quantity = max(1, (int)$item['quantity']);
            $basePrice = (float)$product->price;
            $lineTotal = $basePrice * $quantity;

            $enrichedItems[] = [
                'product_id' => $product->id,
                'category_id' => $product->category_id,
                'name' => $product->name,
                'quantity' => $quantity,
                'base_price' => $basePrice,
                'line_total' => $lineTotal,
                'discount_amount' => 0,
                'final_line_total' => $lineTotal,
                'is_eligible' => false,
            ];

            $subtotal += $lineTotal;
        }

        $result = [
            'subtotal' => $subtotal,
            'discount_amount' => 0,
            'total_amount' => $subtotal,
            'promotion' => null,
            'items' => $enrichedItems,
            'message' => null
        ];

        if ($subtotal == 0) {
            return $result;
        }

        // 2. Select Promotion
        $selectedPromotion = null;
        if ($promotionCode) {
            $promotionCode = strtoupper(trim($promotionCode));
            $promo = Promotion::with(['products', 'categories'])
                ->where('promotion_code', $promotionCode)
                ->where('application_mode', 'CODE')
                ->first();

            if (!$promo) {
                throw new \Exception("Mã khuyến mãi không tồn tại.");
            }
            if (!$this->isPromotionActive($promo)) {
                throw new \Exception("Mã khuyến mãi không có hiệu lực.");
            }
            if ($promo->min_order_amount > 0 && $subtotal < $promo->min_order_amount) {
                throw new \Exception("Đơn hàng chưa đạt giá trị tối thiểu " . number_format($promo->min_order_amount) . "đ.");
            }

            $selectedPromotion = $promo;
        } else {
            // Find best AUTO promotion
            $autoPromos = Promotion::with(['products', 'categories'])
                ->where('application_mode', 'AUTO')
                ->get()
                ->filter(function($p) use ($subtotal) {
                    return $this->isPromotionActive($p) && ($p->min_order_amount == 0 || $subtotal >= $p->min_order_amount);
                });

            $bestDiscount = -1;
            $bestPromo = null;

            foreach ($autoPromos as $promo) {
                $discount = $this->calculateDiscountForPromo($promo, $enrichedItems, $subtotal);
                if ($discount > $bestDiscount) {
                    $bestDiscount = $discount;
                    $bestPromo = $promo;
                } elseif ($discount == $bestDiscount && $bestPromo) {
                    if ($promo->priority < $bestPromo->priority) {
                        $bestPromo = $promo;
                    } elseif ($promo->priority == $bestPromo->priority && $promo->id < $bestPromo->id) {
                        $bestPromo = $promo;
                    }
                }
            }
            $selectedPromotion = $bestPromo;
        }

        // 3. Apply Promotion if selected
        if ($selectedPromotion) {
            $discountInfo = $this->applyDiscount($selectedPromotion, $result['items'], $subtotal);
            
            if ($promotionCode && $discountInfo['discount_amount'] == 0) {
                 throw new \Exception("Mã khuyến mãi không áp dụng cho các sản phẩm trong đơn.");
            }

            $result['discount_amount'] = $discountInfo['discount_amount'];
            $result['total_amount'] = max(0, $subtotal - $result['discount_amount']);
            $result['items'] = $discountInfo['items'];
            $result['promotion'] = [
                'id' => $selectedPromotion->id,
                'promotion_code' => $selectedPromotion->promotion_code,
                'name' => $selectedPromotion->name,
                'application_mode' => $selectedPromotion->application_mode,
                'discount_type' => $selectedPromotion->discount_type,
                'scope' => $selectedPromotion->scope,
                'discount_value' => (float)$selectedPromotion->discount_value,
            ];
            if ($promotionCode) {
                 $result['message'] = "Đã áp dụng mã {$promotionCode}";
            }
        }

        return $result;
    }

    private function isPromotionActive(Promotion $promo): bool
    {
        $now = Carbon::now();
        if ($promo->status !== 'ACTIVE') return false;
        if ($promo->starts_at > $now || $promo->ends_at < $now) return false;
        if ($promo->usage_limit !== null && $promo->used_count >= $promo->usage_limit) return false;
        return true;
    }

    private function calculateDiscountForPromo(Promotion $promo, array $items, float $subtotal): float
    {
        $eligibleBase = 0;

        if ($promo->scope === 'ORDER') {
            $eligibleBase = $subtotal;
        } elseif ($promo->scope === 'CATEGORY') {
            $categoryIds = $promo->categories->pluck('id')->toArray();
            foreach ($items as $item) {
                if (in_array($item['category_id'], $categoryIds)) {
                    $eligibleBase += $item['line_total'];
                }
            }
        } elseif ($promo->scope === 'PRODUCT') {
            $productIds = $promo->products->pluck('id')->toArray();
            foreach ($items as $item) {
                if (in_array($item['product_id'], $productIds)) {
                    $eligibleBase += $item['line_total'];
                }
            }
        }

        if ($eligibleBase <= 0) return 0;

        $discount = 0;
        if ($promo->discount_type === 'PERCENTAGE') {
            $discount = $eligibleBase * ($promo->discount_value / 100);
        } else {
            $discount = (float)$promo->discount_value;
            // Fixed amount can't exceed eligible base
            if ($discount > $eligibleBase) {
                $discount = $eligibleBase;
            }
        }

        if ($promo->max_discount_amount > 0 && $discount > $promo->max_discount_amount) {
            $discount = (float)$promo->max_discount_amount;
        }

        return min($discount, $eligibleBase); // Extra safety
    }

    private function applyDiscount(Promotion $promo, array $items, float $subtotal): array
    {
        $eligibleBase = 0;
        $eligibleItemKeys = [];
        
        $categoryIds = $promo->scope === 'CATEGORY' ? $promo->categories->pluck('id')->toArray() : [];
        $productIds = $promo->scope === 'PRODUCT' ? $promo->products->pluck('id')->toArray() : [];

        foreach ($items as $k => &$item) {
            $item['is_eligible'] = false;
            if ($promo->scope === 'ORDER') {
                $item['is_eligible'] = true;
            } elseif ($promo->scope === 'CATEGORY' && in_array($item['category_id'], $categoryIds)) {
                $item['is_eligible'] = true;
            } elseif ($promo->scope === 'PRODUCT' && in_array($item['product_id'], $productIds)) {
                $item['is_eligible'] = true;
            }

            if ($item['is_eligible']) {
                $eligibleBase += $item['line_total'];
                $eligibleItemKeys[] = $k;
            }
        }

        $totalDiscount = $this->calculateDiscountForPromo($promo, $items, $subtotal);
        $allocatedDiscount = 0;

        if ($totalDiscount > 0 && $eligibleBase > 0) {
            foreach ($eligibleItemKeys as $idx => $k) {
                if ($idx === count($eligibleItemKeys) - 1) {
                    // Last item takes remainder to avoid rounding issues
                    $itemDiscount = $totalDiscount - $allocatedDiscount;
                } else {
                    $ratio = $items[$k]['line_total'] / $eligibleBase;
                    $itemDiscount = round($totalDiscount * $ratio, 2); // Or floor to int if VND, here using 2 decimals
                    $allocatedDiscount += $itemDiscount;
                }
                
                // Cap item discount to its line total
                if ($itemDiscount > $items[$k]['line_total']) {
                    $itemDiscount = $items[$k]['line_total'];
                }

                $items[$k]['discount_amount'] = $itemDiscount;
                $items[$k]['final_line_total'] = max(0, $items[$k]['line_total'] - $itemDiscount);
            }
        }

        return [
            'discount_amount' => $totalDiscount,
            'items' => $items
        ];
    }

    /**
     * @param Collection|Product[] $products
     * @return Collection
     */
    public function attachPricingToProducts($products)
    {
        $promos = Promotion::with(['products', 'categories'])
            ->activeNow()
            ->where('application_mode', 'AUTO')
            ->whereIn('scope', ['CATEGORY', 'PRODUCT'])
            ->get();

        return $products->map(function ($product) use ($promos) {
            $basePrice = (float)$product->price;
            $bestDiscount = 0;
            $bestPromo = null;

            foreach ($promos as $promo) {
                $isEligible = false;
                if ($promo->scope === 'CATEGORY' && $promo->categories->contains('id', $product->category_id)) {
                    $isEligible = true;
                } elseif ($promo->scope === 'PRODUCT' && $promo->products->contains('id', $product->id)) {
                    $isEligible = true;
                }

                if ($isEligible) {
                    // Calc discount for 1 qty
                    $discount = 0;
                    if ($promo->discount_type === 'PERCENTAGE') {
                        $discount = $basePrice * ($promo->discount_value / 100);
                    } else {
                        $discount = (float)$promo->discount_value;
                    }

                    if ($promo->max_discount_amount > 0 && $discount > $promo->max_discount_amount) {
                        $discount = (float)$promo->max_discount_amount;
                    }
                    
                    if ($discount > $basePrice) {
                        $discount = $basePrice;
                    }

                    if ($discount > $bestDiscount) {
                        $bestDiscount = $discount;
                        $bestPromo = $promo;
                    } elseif ($discount == $bestDiscount && $bestPromo) {
                        if ($promo->priority < $bestPromo->priority) {
                            $bestPromo = $promo;
                        }
                    }
                }
            }

            $productArray = $product->toArray();
            $productArray['pricing'] = [
                'base_price' => $basePrice,
                'effective_price' => $basePrice - $bestDiscount,
                'discount_amount' => $bestDiscount,
                'is_discounted' => $bestDiscount > 0,
                'promotion' => $bestPromo ? [
                    'id' => $bestPromo->id,
                    'name' => $bestPromo->name,
                    'promotion_code' => $bestPromo->promotion_code,
                    'discount_type' => $bestPromo->discount_type,
                    'discount_value' => (float)$bestPromo->discount_value,
                    'scope' => $bestPromo->scope,
                ] : null
            ];

            return (object)$productArray;
        });
    }
}
