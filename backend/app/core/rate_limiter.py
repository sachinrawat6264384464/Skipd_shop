import time
from fastapi import Request, HTTPException
import redis.asyncio as aioredis
from app.core.config import settings

redis_client = aioredis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True,
    protocol=2
)

async def check_rate_limit(
    request: Request,
    max_requests: int = 5,
    window_seconds: int = 60
):
    """
    ⚡ Sliding Window Rate Limiter using Redis ZSET (Sorted Sets):
    Enforces a strict rolling window threshold (e.g., max 5 requests per 60s per IP/endpoint).
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    route = request.url.path
    key = f"rate_limit:{client_ip}:{route}"

    now = time.time()
    clear_before = now - window_seconds

    try:
        pipe = redis_client.pipeline()
        pipe.zremrangebyscore(key, 0, clear_before)
        pipe.zcard(key)
        pipe.zadd(key, {str(now): now})
        pipe.expire(key, window_seconds)
        
        results = await pipe.execute()
        current_request_count = results[1]

        if current_request_count >= max_requests:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded! Max {max_requests} requests per {window_seconds} seconds. Please try again later."
            )
    except HTTPException:
        raise
    except Exception as err:
        print(f"[RATE LIMITER WARNING] Redis check fallback: {err}")
