import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal
from app.models.models import Product
from sqlalchemy import select

async def check_db_products():
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(Product))
        prods = res.scalars().all()
        print(f"==================================================")
        print(f"TOTAL PRODUCTS IN NEON DB: {len(prods)}")
        print(f"==================================================")
        for p in prods:
            print(f"ID: {p.id} | Title: {p.title} | Price: {p.price} | Category ID: {p.category_id} | Featured: {p.featured}")

if __name__ == "__main__":
    asyncio.run(check_db_products())
