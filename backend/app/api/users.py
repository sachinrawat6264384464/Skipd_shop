from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Order, WishlistItem, CartItem, Address, Review, Wallet, ReturnRequest

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/admin/all")
async def get_all_admin_users(db: AsyncSession = Depends(get_db)):
    """Fetch all registered customer accounts directly from PostgreSQL database with dynamic orders count and total spent aggregation."""
    res = await db.execute(select(User).order_by(User.created_at.desc()))
    users = res.scalars().all()

    orders_res = await db.execute(select(Order))
    all_orders = orders_res.scalars().all()

    result = []
    for u in users:
        u_email = (u.email or "").strip().lower()
        u_name = (u.full_name or "").strip().lower()

        user_orders = [
            o for o in all_orders
            if (o.user_id == u.id) or
               (o.customer_email and o.customer_email.strip().lower() == u_email) or
               (o.customer_name and o.customer_name.strip().lower() == u_name)
        ]

        orders_count = len(user_orders)
        total_spent = sum(o.total_amount or 0.0 for o in user_orders)

        result.append({
            "id": u.id,
            "firebase_uid": u.firebase_uid,
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone or "",
            "role": u.role.value if hasattr(u.role, 'value') else str(u.role),
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "orders_count": orders_count,
            "total_spent": round(total_spent, 2)
        })

    return result
async def delete_admin_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a user account and permanently purge all associated schema data from PostgreSQL database."""
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_email = user.email

    # 1. Delete associated orders
    orders_res = await db.execute(select(Order).where(Order.user_id == user_id))
    for o in orders_res.scalars().all():
        await db.delete(o)

    # 2. Delete associated wishlist items
    wishlist_res = await db.execute(select(WishlistItem).where(WishlistItem.user_id == user_id))
    for w in wishlist_res.scalars().all():
        await db.delete(w)

    # 3. Delete associated cart items
    cart_res = await db.execute(select(CartItem).where(CartItem.user_id == user_id))
    for c in cart_res.scalars().all():
        await db.delete(c)

    # 4. Delete associated addresses
    addr_res = await db.execute(select(Address).where(Address.user_id == user_id))
    for a in addr_res.scalars().all():
        await db.delete(a)

    # 5. Delete associated reviews
    rev_res = await db.execute(select(Review).where(Review.user_id == user_id))
    for r in rev_res.scalars().all():
        await db.delete(r)

    # 6. Delete associated wallet
    wallet_res = await db.execute(select(Wallet).where(Wallet.user_id == user_id))
    wallet = wallet_res.scalars().first()
    if wallet:
        await db.delete(wallet)

    # 7. Delete return requests
    ret_res = await db.execute(select(ReturnRequest).where(ReturnRequest.user_id == user_id))
    for ret in ret_res.scalars().all():
        await db.delete(ret)

    # 8. Delete user record
    await db.delete(user)
    await db.commit()

    return {
        "status": "success",
        "message": f"User #{user_id} ({user_email}) and all associated schema data permanently purged from database"
    }
