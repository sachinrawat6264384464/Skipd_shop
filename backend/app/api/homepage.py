from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.models import HomepageSection

router = APIRouter(prefix="/homepage", tags=["Homepage Sections"])

@router.get("/sections")
async def list_active_sections(db: AsyncSession = Depends(get_db)):
    """Get active homepage sections sorted by position."""
    result = await db.execute(
        select(HomepageSection)
        .where(HomepageSection.is_active == True)
        .order_by(HomepageSection.position.asc(), HomepageSection.created_at.desc())
    )
    sections = result.scalars().all()
    return [
        {
            "id": s.id,
            "title": s.title,
            "section_type": s.section_type,
            "href": s.href,
            "items": s.items,
            "position": s.position,
            "is_active": s.is_active
        }
        for s in sections
    ]

@router.get("/admin/all")
async def admin_list_all_sections(db: AsyncSession = Depends(get_db)):
    """Admin: List all homepage sections."""
    result = await db.execute(
        select(HomepageSection).order_by(HomepageSection.position.asc())
    )
    sections = result.scalars().all()
    return [
        {
            "id": s.id,
            "title": s.title,
            "section_type": s.section_type,
            "href": s.href,
            "items": s.items,
            "position": s.position,
            "is_active": s.is_active
        }
        for s in sections
    ]

@router.post("/admin/create")
async def admin_create_section(payload: dict = Body(...), db: AsyncSession = Depends(get_db)):
    """Admin: Create new homepage section."""
    sec = HomepageSection(
        title=payload.get("title", "New Section"),
        section_type=payload.get("section_type", "DEAL_BLOCK"),
        href=payload.get("href", "/search"),
        items=payload.get("items", []),
        position=payload.get("position", 0),
        is_active=payload.get("is_active", True)
    )
    db.add(sec)
    await db.commit()
    await db.refresh(sec)
    return {"id": sec.id, "message": "Section created successfully"}

@router.put("/admin/{section_id}")
async def admin_update_section(section_id: int, payload: dict = Body(...), db: AsyncSession = Depends(get_db)):
    """Admin: Update section details or toggle is_active."""
    result = await db.execute(select(HomepageSection).where(HomepageSection.id == section_id))
    sec = result.scalars().first()
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")

    if "title" in payload:
        sec.title = payload["title"]
    if "section_type" in payload:
        sec.section_type = payload["section_type"]
    if "href" in payload:
        sec.href = payload["href"]
    if "items" in payload:
        sec.items = payload["items"]
    if "position" in payload:
        sec.position = payload["position"]
    if "is_active" in payload:
        sec.is_active = payload["is_active"]

    await db.commit()
    return {"message": "Section updated", "id": sec.id, "is_active": sec.is_active}

@router.delete("/admin/{section_id}")
async def admin_delete_section(section_id: int, db: AsyncSession = Depends(get_db)):
    """Admin: Delete section."""
    result = await db.execute(select(HomepageSection).where(HomepageSection.id == section_id))
    sec = result.scalars().first()
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
    await db.delete(sec)
    await db.commit()
    return {"message": "Section deleted"}
