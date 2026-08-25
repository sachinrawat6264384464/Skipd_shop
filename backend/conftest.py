import pytest
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal, engine

@pytest.fixture(scope="session")
def event_loop():
    """Session-scoped event loop for pytest-asyncio."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def db_session():
    """Provides a single session-scoped async SQLAlchemy DB session across the test suite."""
    async with AsyncSessionLocal() as session:
        yield session

@pytest.fixture(scope="session", autouse=True)
async def cleanup_engine():
    yield
    await engine.dispose()
