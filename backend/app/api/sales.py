from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime

from app.core.database import get_db
from app.models.models import SaleEvent, SaleProduct, Product, SaleStatus

router = APIRouter(prefix="/sales", tags=["Sale Events"])


# ─────────────────────────────────────────────
# PUBLIC ENDPOINTS
# ─────────────────────────────────────────────

@router.get("")
async def list_active_sales(db: AsyncSession = Depends(get_db)):
    """Get all ACTIVE sale events for the frontend /deals page."""
    result = await db.execute(
        select(SaleEvent)
        .options(selectinload(SaleEvent.products).selectinload(SaleProduct.product))
        .where(SaleEvent.status == SaleStatus.ACTIVE)
        .order_by(SaleEvent.created_at.desc())
    )
    sales = result.scalars().all()

    sales_data = []
    for sale in sales:
        sales_data.append({
            "id": sale.id,
            "title": sale.title,
            "slug": sale.slug,
            "subtitle": sale.subtitle,
            "badge_text": sale.badge_text,
            "hero_bg_color": sale.hero_bg_color,
            "hero_image_url": sale.hero_image_url,
            "status": sale.status,
            "start_date": sale.start_date.isoformat() if sale.start_date else None,
            "end_date": sale.end_date.isoformat() if sale.end_date else None,
            "products": [
                {
                    "id": sp.id,
                    "product_id": sp.product_id,
                    "title": sp.product.title if sp.product else "Unknown",
                    "handle": sp.product.handle if sp.product else "",
                    "image": (sp.product.images[0] if sp.product and sp.product.images else "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400"),
                    "sale_price": sp.sale_price,
                    "original_price": sp.original_price,
                    "shipping_type": sp.shipping_type,
                    "weight_range": sp.weight_range,
                    "savings": round(sp.original_price - sp.sale_price, 2)
                }
                for sp in sale.products
            ]
        })
    return sales_data


@router.get("/{slug}")
async def get_sale_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """Get a single sale event by slug."""
    result = await db.execute(
        select(SaleEvent)
        .options(selectinload(SaleEvent.products).selectinload(SaleProduct.product))
        .where(SaleEvent.slug == slug)
    )
    sale = result.scalars().first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    return {
        "id": sale.id,
        "title": sale.title,
        "slug": sale.slug,
        "subtitle": sale.subtitle,
        "badge_text": sale.badge_text,
        "hero_bg_color": sale.hero_bg_color,
        "status": sale.status,
        "products": [
            {
                "id": sp.id,
                "product_id": sp.product_id,
                "title": sp.product.title if sp.product else "Unknown",
                "handle": sp.product.handle if sp.product else "",
                "image": (sp.product.images[0] if sp.product and sp.product.images else "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400"),
                "sale_price": sp.sale_price,
                "original_price": sp.original_price,
                "shipping_type": sp.shipping_type,
                "weight_range": sp.weight_range,
                "savings": round(sp.original_price - sp.sale_price, 2)
            }
            for sp in sale.products
        ]
    }


# ─────────────────────────────────────────────
# ADMIN ENDPOINTS
# ─────────────────────────────────────────────

@router.get("/admin/all")
async def admin_list_all_sales(db: AsyncSession = Depends(get_db)):
    """Admin: List all sales regardless of status."""
    result = await db.execute(
        select(SaleEvent)
        .options(selectinload(SaleEvent.products))
        .order_by(SaleEvent.created_at.desc())
    )
    sales = result.scalars().all()
    return [
        {
            "id": s.id,
            "title": s.title,
            "slug": s.slug,
            "subtitle": s.subtitle,
            "badge_text": s.badge_text,
            "hero_bg_color": s.hero_bg_color,
            "status": s.status,
            "start_date": s.start_date.isoformat() if s.start_date else None,
            "end_date": s.end_date.isoformat() if s.end_date else None,
            "products_count": len(s.products),
            "created_at": s.created_at.isoformat()
        }
        for s in sales
    ]


@router.post("/admin/create")
async def admin_create_sale(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """Admin: Create a new sale event."""
    sale = SaleEvent(
        title=payload.get("title", "New Sale"),
        slug=payload.get("slug", f"sale-{int(datetime.utcnow().timestamp())}"),
        subtitle=payload.get("subtitle", ""),
        badge_text=payload.get("badge_text", "Live Now"),
        hero_bg_color=payload.get("hero_bg_color", "#f97316"),
        hero_image_url=payload.get("hero_image_url"),
        status=SaleStatus(payload.get("status", "DRAFT")),
        start_date=datetime.fromisoformat(payload["start_date"]) if payload.get("start_date") else None,
        end_date=datetime.fromisoformat(payload["end_date"]) if payload.get("end_date") else None,
    )
    db.add(sale)
    await db.commit()
    await db.refresh(sale)
    return {"id": sale.id, "slug": sale.slug, "status": sale.status, "message": "Sale created successfully!"}


@router.put("/admin/{sale_id}")
async def admin_update_sale(
    sale_id: int,
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """Admin: Update sale (status, title, etc.)"""
    result = await db.execute(select(SaleEvent).where(SaleEvent.id == sale_id))
    sale = result.scalars().first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    if "title" in payload:
        sale.title = payload["title"]
    if "subtitle" in payload:
        sale.subtitle = payload["subtitle"]
    if "badge_text" in payload:
        sale.badge_text = payload["badge_text"]
    if "hero_bg_color" in payload:
        sale.hero_bg_color = payload["hero_bg_color"]
    if "status" in payload:
        sale.status = SaleStatus(payload["status"])
    if "start_date" in payload and payload["start_date"]:
        sale.start_date = datetime.fromisoformat(payload["start_date"])
    if "end_date" in payload and payload["end_date"]:
        sale.end_date = datetime.fromisoformat(payload["end_date"])

    await db.commit()
    return {"message": "Sale updated!", "status": sale.status, "id": sale.id}


@router.delete("/admin/{sale_id}")
async def admin_delete_sale(sale_id: int, db: AsyncSession = Depends(get_db)):
    """Admin: Delete a sale."""
    result = await db.execute(select(SaleEvent).where(SaleEvent.id == sale_id))
    sale = result.scalars().first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    await db.delete(sale)
    await db.commit()
    return {"message": "Sale deleted successfully"}


@router.post("/admin/{sale_id}/products/bulk")
async def admin_bulk_add_products(
    sale_id: int,
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """Admin: Bulk add products to a sale. payload = {products: [{product_id, sale_price, original_price, shipping_type, weight_range}]}"""
    result = await db.execute(select(SaleEvent).where(SaleEvent.id == sale_id))
    sale = result.scalars().first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    products_data = payload.get("products", [])
    added = 0
    for pdata in products_data:
        # Check if already added
        existing = await db.execute(
            select(SaleProduct).where(
                SaleProduct.sale_id == sale_id,
                SaleProduct.product_id == pdata["product_id"]
            )
        )
        if not existing.scalars().first():
            sp = SaleProduct(
                sale_id=sale_id,
                product_id=pdata["product_id"],
                sale_price=pdata.get("sale_price", 0),
                original_price=pdata.get("original_price", 0),
                shipping_type=pdata.get("shipping_type", "Easy Ship"),
                weight_range=pdata.get("weight_range", "<500gm"),
            )
            db.add(sp)
            added += 1

    await db.commit()
    return {"message": f"{added} products added to sale", "sale_id": sale_id}


@router.delete("/admin/{sale_id}/products/{sale_product_id}")
async def admin_remove_sale_product(
    sale_id: int,
    sale_product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Admin: Remove a product from a sale."""
    result = await db.execute(
        select(SaleProduct).where(
            SaleProduct.id == sale_product_id,
            SaleProduct.sale_id == sale_id
        )
    )
    sp = result.scalars().first()
    if not sp:
        raise HTTPException(status_code=404, detail="Sale product not found")
    await db.delete(sp)
    await db.commit()
    return {"message": "Product removed from sale"}
