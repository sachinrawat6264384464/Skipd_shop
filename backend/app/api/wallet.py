from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import User, Wallet, WalletTransaction
from app.schemas.schemas import WalletResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/wallet", tags=["Wallet"])

@router.get("", response_model=WalletResponse)
async def get_wallet(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Wallet).options(selectinload(Wallet.transactions)).where(Wallet.user_id == current_user.id)
    result = await db.execute(query)
    wallet = result.scalars().first()
    
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=0.0)
        db.add(wallet)
        await db.commit()
        await db.refresh(wallet)
    
    wallet.transactions.sort(key=lambda x: x.created_at, reverse=True)
    return wallet

@router.post("/credit")
async def credit_wallet(
    amount: float,
    user_id: int,
    reason: str = "ADMIN_CREDIT",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
        
    query = select(Wallet).where(Wallet.user_id == user_id)
    result = await db.execute(query)
    wallet = result.scalars().first()
    
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=0.0)
        db.add(wallet)
        await db.flush()
    
    wallet.balance += amount
    
    transaction = WalletTransaction(
        wallet_id=wallet.id,
        amount=amount,
        transaction_type=reason,
        reference_id="Admin Credit"
    )
    db.add(transaction)
    await db.commit()
    
    return {"message": f"Successfully credited {amount} to user {user_id}"}
