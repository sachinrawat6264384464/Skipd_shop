from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import InventoryLog, ProductVariant

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/{product_id}")
async def get_inventory_status(product_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch inventory variants & stock logs for a product."""
    res = await db.execute(select(ProductVariant).where(ProductVariant.product_id == product_id))
    variants = res.scalars().all()
    return {"product_id": product_id, "variants": variants}

@router.post("/update")
async def update_stock(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """Update stock quantity for a variant."""
    variant_id = payload.get("variant_id")
    quantity_change = payload.get("quantity_change", 0)

    res = await db.execute(select(ProductVariant).where(ProductVariant.id == variant_id))
    variant = res.scalars().first()

    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    variant.stock_quantity += quantity_change
    db.add(variant)

    log = InventoryLog(
        product_id=variant.product_id,
        quantity_change=quantity_change,
        reason=payload.get("reason", "MANUAL_STOCK_UPDATE")
    )
    db.add(log)
    await db.commit()

    return {"status": "success", "new_stock": variant.stock_quantity}
