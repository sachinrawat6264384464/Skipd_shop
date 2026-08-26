from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, ReturnRequest, Order, Product

router = APIRouter(prefix="/returns", tags=["Returns & Replacements"])

class CreateReturnRequestSchema(BaseModel):
    order_id: int
    product_id: Optional[int] = None
    reason: str
    comments: Optional[str] = ""
    images: Optional[List[str]] = []

class AdminUpdateReturnStatusSchema(BaseModel):
    return_id: int
    status: str  # Pending, Approved, Rejected, Completed

@router.get("/my-requests")
async def get_my_return_requests(
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch customer's submitted 7-day return and replacement requests."""
    if not current_user:
        return {"returns": []}

    res = await db.execute(
        select(ReturnRequest)
        .where(ReturnRequest.user_id == current_user.id)
        .order_by(ReturnRequest.created_at.desc())
    )
    reqs = res.scalars().all()

    output = []
    for r in reqs:
        prod_res = await db.execute(select(Product).where(Product.id == r.product_id)) if r.product_id else None
        prod = prod_res.scalars().first() if prod_res else None

        output.append({
            "id": r.id,
            "order_id": r.order_id,
            "product_id": r.product_id,
            "product_title": prod.title if prod else f"Order #{r.order_id} Item",
            "product_image": prod.images[0] if (prod and prod.images) else "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
            "reason": r.reason,
            "comments": r.comments or "",
            "images": r.images or [],
            "status": r.status or "Pending",
            "created_at": r.created_at.isoformat() if r.created_at else ""
        })

    return {"returns": output}


@router.post("/request")
async def submit_return_request(
    payload: CreateReturnRequestSchema,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit a 7-day return/replacement request for an order."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Check order exists for user
    order_res = await db.execute(
        select(Order).where(
            Order.id == payload.order_id,
            Order.user_id == current_user.id
        )
    )
    order = order_res.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found or access denied")

    req = ReturnRequest(
        order_id=payload.order_id,
        user_id=current_user.id,
        product_id=payload.product_id,
        reason=payload.reason,
        comments=payload.comments or "",
        images=payload.images or [],
        status="Pending"
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)

    return {
        "status": "success",
        "message": "Return/Replacement request submitted successfully. Our team will inspect and approve within 24 hours.",
        "return_id": req.id
    }


@router.get("/admin/all")
async def get_admin_return_requests(db: AsyncSession = Depends(get_db)):
    """Admin view: Fetch all customer return requests."""
    res = await db.execute(select(ReturnRequest).order_by(ReturnRequest.id.desc()))
    reqs = res.scalars().all()

    output = []
    for r in reqs:
        user_res = await db.execute(select(User).where(User.id == r.user_id))
        u = user_res.scalars().first()

        output.append({
            "id": r.id,
            "order_id": r.order_id,
            "customer_name": u.full_name if u else "Customer",
            "customer_email": u.email if u else "customer@example.com",
            "reason": r.reason,
            "comments": r.comments or "",
            "images": r.images or [],
            "status": r.status or "Pending",
            "created_at": r.created_at.isoformat() if r.created_at else ""
        })
    return output


@router.post("/admin/update-status")
async def admin_update_return_status(
    payload: AdminUpdateReturnStatusSchema,
    db: AsyncSession = Depends(get_db)
):
    """Admin: Approve or Reject a customer return request."""
    res = await db.execute(select(ReturnRequest).where(ReturnRequest.id == payload.return_id))
    req = res.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Return request not found")

    req.status = payload.status
    await db.commit()
    return {"status": "success", "message": f"Return request #{req.id} updated to {payload.status}"}
