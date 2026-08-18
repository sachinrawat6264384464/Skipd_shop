import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal
from app.models.models import Product, Category
from sqlalchemy import select
from sqlalchemy.orm import selectinload

async def check():
    async with AsyncSessionLocal() as session:
        c_res = await session.execute(select(Category))
        cats = c_res.scalars().all()
        print(f"=== CATEGORIES IN DB ({len(cats)}) ===")
        for c in cats:
            print(f"Cat ID: {c.id} | Name: {c.name} | Slug: '{c.slug}'")

        p_res = await session.execute(select(Product).options(selectinload(Product.category)))
        prods = p_res.scalars().all()
        print(f"\n=== PRODUCTS IN DB ({len(prods)}) ===")
        for p in prods:
            print(f"Prod ID: {p.id} | Title: '{p.title}' | Category ID: {p.category_id} | Category Obj: {p.category.name if p.category else 'None'} | Cat Slug: {p.category.slug if p.category else 'None'}")

if __name__ == "__main__":
    asyncio.run(check())
