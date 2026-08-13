from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Address

router = APIRouter(prefix="/addresses", tags=["Addresses"])

@router.get("")
async def get_user_addresses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch all saved addresses for logged-in user."""
    res = await db.execute(select(Address).where(Address.user_id == current_user.id).order_by(Address.is_default.desc()))
    addresses = res.scalars().all()
    return {"addresses": addresses}

@router.post("")
async def add_user_address(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a new delivery address."""
    address = Address(
        user_id=current_user.id,
        full_name=payload.get("full_name", current_user.full_name),
        street=payload.get("street", ""),
        city=payload.get("city", "Gwalior"),
        state=payload.get("state", "Madhya Pradesh"),
        pincode=payload.get("pincode", "474001"),
        phone=payload.get("phone", current_user.phone or "9876543210"),
        is_default=payload.get("is_default", False)
    )
    db.add(address)
    await db.commit()
    await db.refresh(address)

    return {"status": "success", "message": "Address saved successfully", "address_id": address.id}
