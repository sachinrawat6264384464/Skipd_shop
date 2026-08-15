import asyncio
import redis.asyncio as aioredis
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.core.config import settings
from app.core.redis_cache import get_cached_json, set_cached_json, invalidate_cache_pattern

async def test_redis():
    print(f"[REDIS TEST] Testing Redis connection to: {settings.REDIS_URL}")
    try:
        # Test direct ping with RESP2 protocol compatibility
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True, protocol=2)
        pong = await r.ping()
        print(f"[REDIS SUCCESS] Redis Ping Response: {pong}")

        # Test JSON set & get
        test_key = "products:test:cache_check"
        test_val = {"id": 999, "title": "Redis Cache Test Product", "price": 1499.0}
        
        saved = await set_cached_json(test_key, test_val, expire_seconds=60)
        print(f"[REDIS SUCCESS] Set Cache Status: {saved}")

        fetched = await get_cached_json(test_key)
        print(f"[REDIS SUCCESS] Fetched Cache Content: {fetched}")

        assert fetched["title"] == "Redis Cache Test Product"
        print("[REDIS SUCCESS] REDIS CACHE IS WORKING 100% PERFECTLY!")

        await r.close()
    except Exception as e:
        print(f"[REDIS ERROR] Redis Connection Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_redis())
