from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Order

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Fetch profile of currently authenticated user."""
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role.value
    }

@router.put("/me")
async def update_user_profile(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user full name or phone."""
    if "full_name" in payload:
        current_user.full_name = payload["full_name"]
    if "phone" in payload:
        current_user.phone = payload["phone"]
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return {
        "status": "success",
        "message": "Profile updated successfully!",
        "user_name": current_user.full_name,
        "phone": current_user.phone
    }

@router.get("/admin/all")
async def get_all_admin_users(db: AsyncSession = Depends(get_db)):
    """Fetch all registered customer and admin users from PostgreSQL database."""
    res = await db.execute(select(User).order_by(User.id.desc()))
    users = res.scalars().all()
    
    output = []
    for u in users:
        # Calculate order count & total spent for each user
        orders_res = await db.execute(select(func.count(Order.id), func.coalesce(func.sum(Order.total_amount), 0)).where(Order.user_id == u.id))
        orders_count, total_spent = orders_res.first() or (0, 0)
        
        output.append({
            "id": u.id,
            "full_name": u.full_name or "Store User",
            "email": u.email,
            "phone": u.phone or "+91 98765 43210",
            "role": u.role.value if hasattr(u.role, 'value') else str(u.role),
            "orders_count": orders_count,
            "total_spent": float(total_spent or 0),
            "created_at": u.created_at.isoformat() if u.created_at else None
        })
    
    return output

@router.delete("/admin/{user_id}")
async def delete_admin_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a user account from database."""
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.delete(user)
    await db.commit()
    return {"status": "success", "message": f"User #{user_id} deleted successfully"}
