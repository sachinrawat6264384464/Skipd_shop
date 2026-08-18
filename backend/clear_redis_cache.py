import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.redis_cache import redis_client

async def purge_redis_cache():
    print("==================================================================")
    print("[REDIS] PURGING UPSTASH REDIS CLOUD CACHE...")
    print("==================================================================")
    try:
        await redis_client.flushdb()
        print("[SUCCESS] Upstash Redis Cloud Cache FLUSHED (100% Cleared)!")
    except Exception as e:
        print(f"Error flushing Redis cache: {e}")

if __name__ == "__main__":
    asyncio.run(purge_redis_cache())
