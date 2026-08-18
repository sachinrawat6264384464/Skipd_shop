from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import GiftCard

router = APIRouter(prefix="/gift-cards", tags=["Gift Cards"])

@router.get("/admin/all")
async def get_all_gift_cards(db: AsyncSession = Depends(get_db)):
    """Fetch all real gift cards from PostgreSQL database."""
    res = await db.execute(select(GiftCard).order_by(GiftCard.id.desc()))
    cards = res.scalars().all()
    return [
        {
            "id": g.id,
            "code": g.code,
            "initial_balance": float(g.initial_balance or 0),
            "current_balance": float(g.current_balance or 0),
            "is_active": g.is_active,
            "recipient": "store-customer@skipd.in",
            "created_at": g.created_at.isoformat() if g.created_at else None
        }
        for g in cards
    ]

@router.post("/admin/create")
async def create_admin_gift_card(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """Issue a new gift card directly into PostgreSQL database."""
    code = payload.get("code", "").strip().upper()
    amount = float(payload.get("amount", 500))

    if not code:
        import random
        code = f"SKIPD-GC-{random.randint(100000, 999999)}"

    # Check duplicate
    existing = await db.execute(select(GiftCard).where(GiftCard.code == code))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail=f"Gift card code '{code}' already exists")

    new_gc = GiftCard(
        code=code,
        initial_balance=amount,
        current_balance=amount,
        is_active=True
    )
    db.add(new_gc)
    await db.commit()
    await db.refresh(new_gc)

    return {
        "status": "success",
        "message": f"Gift Card '{code}' of ₹{amount} issued successfully in PostgreSQL DB",
        "gift_card": {
            "id": new_gc.id,
            "code": new_gc.code,
            "initial_balance": new_gc.initial_balance,
            "current_balance": new_gc.current_balance,
            "is_active": new_gc.is_active,
            "recipient": payload.get("recipient", "store-customer@skipd.in")
        }
    }

@router.post("/check-balance")
async def check_gift_card_balance(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """Check balance of a Gift Card by code."""
    code = payload.get("code", "").strip().upper()
    res = await db.execute(select(GiftCard).where(GiftCard.code == code, GiftCard.is_active == True))
    gc = res.scalars().first()

    if not gc:
        raise HTTPException(status_code=400, detail="Invalid or inactive Gift Card code")

    return {
        "status": "valid",
        "code": gc.code,
        "current_balance": gc.current_balance,
        "initial_balance": gc.initial_balance
    }
