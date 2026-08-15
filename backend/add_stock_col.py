import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

PG_URL = "postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/skipd_commerce_db"

async def add_stock_column():
    engine = create_async_engine(PG_URL, echo=False)
    async with engine.begin() as conn:
        await conn.execute(text(
            "ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 100"
        ))
        print("[SUCCESS] stock_quantity column added to products table!")
    await engine.dispose()

asyncio.run(add_stock_column())
