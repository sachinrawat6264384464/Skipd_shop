import json
from typing import Any, Optional
import redis.asyncio as aioredis
from app.core.config import settings

# Async Redis Connection Pool with socket timeouts
try:
    redis_client = aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
        protocol=2,
        socket_connect_timeout=2,
        socket_timeout=2
    )
except (OSError, Exception, BaseException) as init_err:
    print(f"[REDIS INIT WARNING] {init_err}")
    redis_client = None

async def get_cached_json(key: str) -> Optional[Any]:
    """Retrieve JSON object from Redis cache safely."""
    if not redis_client:
        return None
    try:
        data = await redis_client.get(key)
        if data:
            return json.loads(data)
    except (OSError, Exception, BaseException) as err:
        print(f"[REDIS CACHE GET WARNING] {err}")
    return None

async def set_cached_json(key: str, value: Any, expire_seconds: int = 300) -> bool:
    """Set JSON object into Redis cache with expiration TTL safely."""
    if not redis_client:
        return False
    try:
        await redis_client.set(key, json.dumps(value), ex=expire_seconds)
        return True
    except (OSError, Exception, BaseException) as err:
        print(f"[REDIS CACHE SET WARNING] {err}")
        return False

async def invalidate_cache_pattern(pattern: str = "products:*") -> int:
    """Invalidate Redis cache keys matching pattern safely."""
    if not redis_client:
        return 0
    try:
        keys = await redis_client.keys(pattern)
        if keys:
            deleted_count = await redis_client.delete(*keys)
            print(f"🧹 [REDIS CACHE PURGED] Invalidated {deleted_count} keys matching '{pattern}'")
            return deleted_count
    except (OSError, Exception, BaseException) as err:
        print(f"[REDIS CACHE INVALIDATION WARNING] {err}")
    return 0
