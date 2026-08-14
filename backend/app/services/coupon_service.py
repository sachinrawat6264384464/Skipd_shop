import heapq
from typing import List, Dict, Any

class CouponOptimizer:
    def __init__(self):
        pass

    def calculate_discount(self, coupon: Dict[str, Any], cart_total: float) -> float:
        """Calculate discount amount for a given coupon."""
        min_spend = coupon.get("min_spend", 0.0)
        if cart_total < min_spend:
            return 0.0

        discount_type = coupon.get("discount_type", "PERCENTAGE")
        discount_val = coupon.get("discount_value", 0.0)

        if discount_type == "PERCENTAGE":
            calc = (cart_total * discount_val) / 100.0
            max_discount = coupon.get("max_discount", calc)
            return min(calc, max_discount)
        else:
            return min(discount_val, cart_total)

    def find_best_coupons_greedy(
        self,
        active_coupons: List[Dict[str, Any]],
        cart_total: float
    ) -> Dict[str, Any]:
        """
        🏷️ Greedy Algorithm using Max-Heap (Priority Queue):
        Evaluates active coupons and selects the coupon offering maximum monetary savings.
        """
        if not active_coupons or cart_total <= 0:
            return {"best_coupon": None, "discount_amount": 0.0, "final_total": cart_total}

        max_heap = []

        for coupon in active_coupons:
            discount = self.calculate_discount(coupon, cart_total)
            if discount > 0:
                heapq.heappush(max_heap, (-discount, coupon["code"], coupon))

        if not max_heap:
            return {"best_coupon": None, "discount_amount": 0.0, "final_total": cart_total}

        neg_discount, code, best_coupon = heapq.heappop(max_heap)
        best_discount = -neg_discount

        return {
            "best_coupon": {
                "code": best_coupon["code"],
                "description": best_coupon.get("description", "Best Savings Applied"),
                "discount_type": best_coupon.get("discount_type"),
                "discount_value": best_coupon.get("discount_value")
            },
            "discount_amount": round(best_discount, 2),
            "final_total": round(cart_total - best_discount, 2)
        }

coupon_optimizer = CouponOptimizer()
