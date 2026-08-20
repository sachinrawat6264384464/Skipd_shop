from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import NewArrival, Product
from app.schemas.schemas import ProductSchema
from app.core.redis_cache import get_cached_json, set_cached_json, invalidate_cache_pattern

router = APIRouter(prefix="/new-arrivals", tags=["New Arrivals Catalog"])

async def auto_seed_new_arrivals_if_empty(db: AsyncSession):
    """Auto-seed top products into new_arrivals table if table is empty."""
    res = await db.execute(select(func.count(NewArrival.id)))
    count = res.scalar() or 0

    if count == 0:
        prods_res = await db.execute(select(Product).order_by(Product.created_at.desc()).limit(8))
        prods = prods_res.scalars().all()

        if prods:
            entries = [NewArrival(product_id=p.id, position=idx+1) for idx, p in enumerate(prods)]
            db.add_all(entries)
            await db.commit()

@router.get("", response_model=List[ProductSchema])
async def get_all_new_arrivals(db: AsyncSession = Depends(get_db)):
    """Fetch all products marked as New Arrivals from dedicated PostgreSQL new_arrivals table."""
    try:
        cache_key = "products:new_arrivals:list"
        cached_data = await get_cached_json(cache_key)
        if cached_data is not None:
            return cached_data

        await auto_seed_new_arrivals_if_empty(db)

        query = (
            select(NewArrival)
            .options(
                selectinload(NewArrival.product).selectinload(Product.category),
                selectinload(NewArrival.product).selectinload(Product.variants)
            )
            .order_by(NewArrival.position.asc(), NewArrival.created_at.desc())
        )
        result = await db.execute(query)
        entries = result.scalars().all()

        products = [e.product for e in entries if e.product is not None]

        try:
            serialized = [ProductSchema.model_validate(p).model_dump(mode="json") for p in products]
            await set_cached_json(cache_key, serialized, expire_seconds=300)
        except BaseException as cache_err:
            print(f"[CACHE SERDE ERROR] {cache_err}")

        return products
    except Exception as err:
        print(f"[GET NEW ARRIVALS ERROR] {err}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch new arrivals: {str(err)}")


@router.get("/ids", response_model=List[int])
async def get_new_arrival_product_ids(db: AsyncSession = Depends(get_db)):
    """Fetch list of product IDs currently in new_arrivals database table."""
    try:
        result = await db.execute(select(NewArrival.product_id))
        ids = result.scalars().all()
        return list(ids)
    except Exception as err:
        return []


@router.post("/toggle/{product_id}")
async def toggle_new_arrival(product_id: int, db: AsyncSession = Depends(get_db)):
    """1-Click Toggle ON/OFF product in dedicated PostgreSQL new_arrivals table."""
    prod_check = await db.execute(select(Product).where(Product.id == product_id))
    product = prod_check.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product #{product_id} not found in database catalog")

    existing_res = await db.execute(select(NewArrival).where(NewArrival.product_id == product_id))
    existing = existing_res.scalars().first()

    is_active_now = False

    if existing:
        await db.delete(existing)
        is_active_now = False

        if isinstance(product.tags, list):
            product.tags = [t for t in product.tags if t not in ["new-arrival", "new_arrival"]]
    else:
        new_entry = NewArrival(product_id=product_id, position=1)
        db.add(new_entry)
        is_active_now = True

        current_tags = list(product.tags) if isinstance(product.tags, list) else []
        if "new-arrival" not in current_tags:
            current_tags.append("new-arrival")
        product.tags = current_tags

    await db.commit()

    try:
        await invalidate_cache_pattern("products:*")
    except BaseException:
        pass

    return {
        "message": f"Product #{product_id} New Arrival status set to {is_active_now}",
        "product_id": product_id,
        "is_new_arrival": is_active_now
    }


@router.post("/add/{product_id}")
async def add_product_to_new_arrivals(product_id: int, db: AsyncSession = Depends(get_db)):
    """Add product entry to new_arrivals database table."""
    prod_check = await db.execute(select(Product).where(Product.id == product_id))
    product = prod_check.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing_res = await db.execute(select(NewArrival).where(NewArrival.product_id == product_id))
    existing = existing_res.scalars().first()

    if not existing:
        new_entry = NewArrival(product_id=product_id, position=1)
        db.add(new_entry)
        
        current_tags = list(product.tags) if isinstance(product.tags, list) else []
        if "new-arrival" not in current_tags:
            current_tags.append("new-arrival")
        product.tags = current_tags

        await db.commit()

        try:
            await invalidate_cache_pattern("products:*")
        except BaseException:
            pass

    return {"message": f"Product #{product_id} added to new_arrivals table", "product_id": product_id}


@router.delete("/remove/{product_id}")
async def remove_product_from_new_arrivals(product_id: int, db: AsyncSession = Depends(get_db)):
    """Remove product entry from new_arrivals database table."""
    await db.execute(delete(NewArrival).where(NewArrival.product_id == product_id))

    prod_check = await db.execute(select(Product).where(Product.id == product_id))
    product = prod_check.scalars().first()
    if product and isinstance(product.tags, list):
        product.tags = [t for t in product.tags if t not in ["new-arrival", "new_arrival"]]

    await db.commit()

    try:
        await invalidate_cache_pattern("products:*")
    except BaseException:
        pass

    return {"message": f"Product #{product_id} removed from new_arrivals table", "product_id": product_id}
