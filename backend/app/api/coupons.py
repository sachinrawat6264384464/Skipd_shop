from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Coupon

router = APIRouter(prefix="/coupons", tags=["Coupons"])

@router.post("/validate")
async def validate_coupon(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """Validate discount coupon code."""
    code = payload.get("code", "").strip().upper()
    order_amount = payload.get("order_amount", 0)

    res = await db.execute(select(Coupon).where(Coupon.code == code, Coupon.is_active == True))
    coupon = res.scalars().first()

    if not coupon:
        raise HTTPException(status_code=400, detail="Invalid or expired coupon code")

    if order_amount < coupon.min_order_amount:
        raise HTTPException(status_code=400, detail=f"Minimum order amount for this coupon is ₹{coupon.min_order_amount}")

    discount = (order_amount * coupon.discount_percent) / 100.0
    if coupon.max_discount and discount > coupon.max_discount:
        discount = coupon.max_discount

    return {
        "status": "valid",
        "code": coupon.code,
        "discount_percent": coupon.discount_percent,
        "discount_amount": round(discount, 2),
        "final_amount": round(order_amount - discount, 2)
    }


# ─────────────────────────────────────────────
# 🏷️ GREEDY ALGORITHM BEST COUPON OPTIMIZER
# ─────────────────────────────────────────────
from app.services.coupon_service import coupon_optimizer

@router.post("/best-coupon")
async def calculate_best_coupon_greedy(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    🏷️ Greedy Choice Algorithm with Max-Heap:
    Evaluates active coupons and selects the coupon providing maximum monetary savings for the cart total.
    """
    cart_total = float(payload.get("cart_total", 0.0))
    if cart_total <= 0:
        return {"best_coupon": None, "discount_amount": 0.0, "final_total": cart_total}

    res = await db.execute(select(Coupon).where(Coupon.is_active == True))
    coupons = res.scalars().all()

    active_list = []
    if coupons:
        for c in coupons:
            active_list.append({
                "code": c.code,
                "discount_type": "PERCENTAGE",
                "discount_value": c.discount_percent,
                "min_spend": c.min_order_amount,
                "max_discount": c.max_discount,
                "description": f"{c.discount_percent}% OFF up to ₹{c.max_discount or 500}"
            })
    else:
        active_list = [
            {"code": "WELCOME10", "discount_type": "PERCENTAGE", "discount_value": 10.0, "min_spend": 500.0, "max_discount": 300.0, "description": "10% OFF Welcome Discount"},
            {"code": "FREEDOM25", "discount_type": "PERCENTAGE", "discount_value": 25.0, "min_spend": 2000.0, "max_discount": 1000.0, "description": "25% OFF Mega Sale"},
            {"code": "SKIPD500", "discount_type": "FLAT", "discount_value": 500.0, "min_spend": 3000.0, "description": "₹500 Flat Super Discount"}
        ]

    best_deal = coupon_optimizer.find_best_coupons_greedy(active_list, cart_total)
    return best_deal
