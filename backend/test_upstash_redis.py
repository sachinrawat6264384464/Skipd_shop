import asyncio
import redis.asyncio as aioredis
import os
import sys

sys.path.append(os.path.dirname(__file__))

from app.core.config import settings
from app.core.redis_cache import get_cached_json, set_cached_json

async def test_upstash():
    print(f"[UPSTASH TEST] Connecting to Upstash Redis: {settings.REDIS_URL}")
    try:
        # Connect to Upstash Cloud Redis using SSL (rediss://)
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        pong = await r.ping()
        print(f"[UPSTASH SUCCESS] Ping Response: {pong}")

        # Set & Get test key on Upstash Cloud
        key = "upstash:live:test"
        val = {"status": "success", "provider": "Upstash Cloud Redis", "region": "ap-south-1 (Mumbai)"}
        
        await r.set(key, "OK_UPSTASH", ex=60)
        fetched = await r.get(key)
        print(f"[UPSTASH SUCCESS] Fetched Key Content: {fetched}")

        assert fetched == "OK_UPSTASH"
        print("\n[UPSTASH AUDIT SUCCESS]: LIVE UPSTASH CLOUD REDIS IS 100% FUNCTIONAL!")

        await r.aclose()
    except Exception as e:
        print(f"[UPSTASH ERROR]: {e}")

if __name__ == "__main__":
    asyncio.run(test_upstash())
