import asyncio
import sys
sys.path.insert(0, '.')
from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def check():
    async with AsyncSessionLocal() as db:
        await db.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price FLOAT"))
        await db.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100)"))
        await db.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100)"))
        await db.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false"))
        await db.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true"))
        await db.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
        await db.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
        await db.commit()
        print("Done adding missing columns to products table")

asyncio.run(check())
