import asyncio
import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(__file__))

# Force load .env over OS environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import Settings
from app.models.models import Base, Product, Category

async def test_neon():
    settings = Settings()
    print(f"[NEON TEST] Connecting to Neon Cloud PostgreSQL:")
    print(f"Target Host: {settings.DATABASE_URL.split('@')[-1]}")
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    
    try:
        # 1. Initialize all tables on Neon Cloud Postgres
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[NEON SUCCESS] Database tables created/verified successfully on Neon Cloud!")

        # 2. Query categories / products
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with async_session() as session:
            result = await session.execute(select(Category))
            categories = result.scalars().all()
            print(f"[NEON SUCCESS] Active Categories Count: {len(categories)}")

            p_result = await session.execute(select(Product))
            products = p_result.scalars().all()
            print(f"[NEON SUCCESS] Active Products Count: {len(products)}")

        print("\n[NEON AUDIT SUCCESS]: LIVE NEON CLOUD POSTGRESQL IS 100% FUNCTIONAL!")
        await engine.dispose()

    except Exception as e:
        print(f"[NEON ERROR]: {e}")

if __name__ == "__main__":
    asyncio.run(test_neon())
