from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.models.models import Coupon

router = APIRouter()

class CouponValidateSchema(BaseModel):
    code: str
    subtotal: float

class CouponResponseSchema(BaseModel):
    valid: bool
    code: str
    discount_amount: float
    description: str
    final_subtotal: float

@router.post("/validate", response_model=CouponResponseSchema)
async def validate_coupon(
    data: CouponValidateSchema,
    db: AsyncSession = Depends(get_db)
):
    code_upper = data.code.strip().upper()
    res = await db.execute(select(Coupon).where(Coupon.code == code_upper, Coupon.is_active == True))
    coupon = res.scalars().first()

    if not coupon:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired coupon code. Try WELCOME500 or FLAT20."
        )

    if data.subtotal < coupon.min_order_value:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum order subtotal of ₹{coupon.min_order_value:,.0f} required for coupon {coupon.code}."
        )

    discount = 0.0
    if coupon.discount_percent > 0:
        discount = (data.subtotal * coupon.discount_percent) / 100.0
        if coupon.max_discount_amount and discount > coupon.max_discount_amount:
            discount = coupon.max_discount_amount
    elif coupon.fixed_discount > 0:
        discount = coupon.fixed_discount

    discount = min(discount, data.subtotal)
    final_subtotal = max(0.0, data.subtotal - discount)

    return {
        "valid": True,
        "code": coupon.code,
        "discount_amount": round(discount, 2),
        "description": coupon.description or "Coupon applied successfully!",
        "final_subtotal": round(final_subtotal, 2)
    }

@router.get("/active")
async def list_active_coupons(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Coupon).where(Coupon.is_active == True))
    return res.scalars().all()
