import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.models import Product

async def test():
    engine = create_async_engine("postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/skipd_commerce_db")
    SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession)
    
    async with SessionLocal() as db:
        try:
            query = select(Product).options(selectinload(Product.category), selectinload(Product.variants))
            res = await db.execute(query)
            products = res.scalars().all()
            print(f"[EXPLICIT DB SUCCESS] Found {len(products)} products in PostgreSQL 5433!")
            for p in products:
                print(f" - {p.title} (Price: ₹{p.price})")
        except Exception as e:
            print("[EXPLICIT DB ERROR]:", e)

if __name__ == "__main__":
    asyncio.run(test())
