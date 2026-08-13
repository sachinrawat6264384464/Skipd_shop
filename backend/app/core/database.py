from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL
if "localhost" in db_url:
    db_url = db_url.replace("localhost", "127.0.0.1")
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Ensure local fallback to port 5433 postgresql if unconfigured
if not db_url or "skipd_commerce" not in db_url:
    db_url = "postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/skipd_commerce_db"

engine = create_async_engine(
    db_url,
    echo=settings.ENVIRONMENT == "development",
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
