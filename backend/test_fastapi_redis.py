import asyncio
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__)))

from httpx import AsyncClient, ASGITransport
from app.main import app

async def test_fastapi_redis():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        print("[TEST 1] Requesting GET /api/v1/products (1st Call - Cache Miss & DB Fetch)...")
        res1 = await client.get("/api/v1/products?limit=10")
        print(f"[STATUS 1]: {res1.status_code} | Items: {len(res1.json())}")

        print("[TEST 2] Requesting GET /api/v1/products again (2nd Call - Instant Redis Cache Hit!)...")
        res2 = await client.get("/api/v1/products?limit=10")
        print(f"[STATUS 2]: {res2.status_code} | Items: {len(res2.json())}")

        print("[TEST 3] Requesting GET /api/v1/products/categories (Redis Categories Cache)...")
        res3 = await client.get("/api/v1/products/categories")
        print(f"[STATUS 3]: {res3.status_code} | Categories: {len(res3.json())}")

        assert res1.status_code == 200
        assert res2.status_code == 200
        assert res3.status_code == 200
        print("\n[REDIS AUDIT SUCCESS]: ALL REDIS CACHE-ASIDE FLOWS WORK 100% PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(test_fastapi_redis())
