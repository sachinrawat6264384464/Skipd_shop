from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.models import User, UserAddress
from app.api.deps import get_current_user

router = APIRouter()

class AddressCreateSchema(BaseModel):
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    address_type: Optional[str] = "Home"
    is_default: Optional[bool] = False

class AddressResponseSchema(BaseModel):
    id: int
    user_id: int
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str]
    city: str
    state: str
    pincode: str
    address_type: str
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[AddressResponseSchema])
async def get_user_addresses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(UserAddress)
        .where(UserAddress.user_id == current_user.id)
        .order_by(UserAddress.is_default.desc(), UserAddress.created_at.desc())
    )
    return result.scalars().all()

@router.post("", response_model=AddressResponseSchema)
async def create_user_address(
    data: AddressCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.is_default:
        # Reset other default addresses for user
        existing_defaults = await db.execute(
            select(UserAddress).where(UserAddress.user_id == current_user.id, UserAddress.is_default == True)
        )
        for addr in existing_defaults.scalars().all():
            addr.is_default = False

    new_addr = UserAddress(
        user_id=current_user.id,
        full_name=data.full_name,
        phone=data.phone,
        address_line1=data.address_line1,
        address_line2=data.address_line2,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        address_type=data.address_type or "Home",
        is_default=data.is_default or False
    )
    db.add(new_addr)
    await db.commit()
    await db.refresh(new_addr)
    return new_addr

@router.delete("/{address_id}")
async def delete_user_address(
    address_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(UserAddress).where(UserAddress.id == address_id, UserAddress.user_id == current_user.id)
    )
    addr = res.scalars().first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    
    await db.delete(addr)
    await db.commit()
    return {"message": "Address deleted successfully"}
