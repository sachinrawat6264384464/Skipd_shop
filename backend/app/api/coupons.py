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
