from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL
if "localhost" in db_url:
    db_url = db_url.replace("localhost", "127.0.0.1")
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)

# Clean ssl query parameters from URL string for asyncpg compatibility
connect_args = {}
if "ssl=require" in db_url or "sslmode=require" in db_url or "neon.tech" in db_url:
    db_url = db_url.replace("?ssl=require", "").replace("&ssl=require", "").replace("?sslmode=require", "").replace("&sslmode=require", "")
    connect_args = {"ssl": True}

engine = create_async_engine(
    db_url,
    connect_args=connect_args,
    echo=settings.ENVIRONMENT == "development",
    future=True,
    pool_size=20,
    max_overflow=30,
    pool_recycle=1800,
    pool_pre_ping=True
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
