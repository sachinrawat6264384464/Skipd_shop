from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import GiftCard

router = APIRouter(prefix="/gift-cards", tags=["Gift Cards"])

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
