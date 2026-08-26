from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class CreateNotificationSchema(BaseModel):
    title: str
    message: str
    type: Optional[str] = "info"  # order, price_drop, wallet, info
    link: Optional[str] = None

@router.get("")
async def get_user_notifications(
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch logged-in user notifications and unread count."""
    if not current_user:
        return {"notifications": [], "unread_count": 0}

    res = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(20)
    )
    notifications = res.scalars().all()

    unread_count = sum(1 for n in notifications if not n.is_read)

    output = []
    for n in notifications:
        output.append({
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type or "info",
            "link": n.link or "",
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else ""
        })

    return {
        "notifications": output,
        "unread_count": unread_count
    }


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a single notification as read."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    res = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notif = res.scalars().first()
    if notif:
        notif.is_read = True
        await db.commit()
        return {"success": True, "message": "Notification marked as read"}

    raise HTTPException(status_code=404, detail="Notification not found")


@router.post("/read-all")
async def mark_all_notifications_read(
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark all notifications as read for current user."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id)
        .values(is_read=True)
    )
    await db.commit()
    return {"success": True, "message": "All notifications marked as read"}
