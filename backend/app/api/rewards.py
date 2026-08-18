from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import User, Wallet, WalletTransaction

router = APIRouter(prefix="/rewards", tags=["Rewards & Wallet"])

class ReferralInput(BaseModel):
    referral_code: str

@router.get("/admin/all-users")
async def get_admin_user_rewards(db: AsyncSession = Depends(get_db)):
    """Fetch all real registered users and their wallet/SuperCoins balance from PostgreSQL DB."""
    res = await db.execute(select(User).options(selectinload(User.wallet)))
    users = res.scalars().all()

    output = []
    for u in users:
        wb = u.wallet.balance if u.wallet else 0.0
        coins = int(wb * 2)
        tier = "Platinum VIP" if coins >= 1000 else "Gold VIP" if coins >= 500 else "Silver"
        output.append({
            "id": u.id,
            "name": u.full_name,
            "email": u.email,
            "coins": coins,
            "wallet_balance": float(wb),
            "tier": tier,
            "total_spent": f"₹{int(wb * 5):,}" if wb > 0 else "₹0"
        })
    return output

@router.post("/admin/credit-coins")
async def credit_user_coins(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """Credit SuperCoins/Wallet balance to a customer in PostgreSQL DB."""
    email = payload.get("email", "").strip()
    coins = float(payload.get("coins", 100))

    res = await db.execute(select(User).where(User.email == email))
    user = res.scalars().first()

    if not user:
        # Create user if not existing
        user = User(
            full_name=email.split("@")[0].title(),
            email=email,
            role="customer"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Fetch or create wallet
    w_res = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    wallet = w_res.scalars().first()

    if not wallet:
        wallet = Wallet(user_id=user.id, balance=0.0)
        db.add(wallet)
        await db.commit()
        await db.refresh(wallet)

    wallet.balance += (coins / 2.0)
    tx = WalletTransaction(
        wallet_id=wallet.id,
        amount=coins / 2.0,
        transaction_type="SUPERCOINS_CREDIT",
        reference_id=f"ADMIN-CREDIT-{user.id}"
    )
    db.add(tx)
    await db.commit()

    return {
        "status": "success",
        "message": f"Successfully credited {int(coins)} SuperCoins to {email} in PostgreSQL DB!",
        "new_balance": wallet.balance
    }

@router.get("/wallet-balance")
async def get_wallet_balance():
    return {
        "user_id": 1,
        "wallet_balance_inr": 250.0,
        "skipd_coins": 500,
        "referral_code": "SKIPD-REF-9842"
    }

@router.post("/verify-referral")
async def verify_referral(data: ReferralInput):
    if data.referral_code.upper().startswith("SKIPD"):
        return {
            "valid": True,
            "discount_inr": 250.0,
            "message": "Referral code applied! You get ₹250 wallet bonus."
        }
    raise HTTPException(status_code=400, detail="Invalid referral code")
