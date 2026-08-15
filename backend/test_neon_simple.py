import asyncio
import asyncpg

async def main():
    url = "postgresql://neondb_owner:npg_co6MJSXeWK8z@ep-still-king-axcdr7h1-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
    print(f"[NEON TEST] Connecting to: {url.split('@')[-1]}")
    try:
        conn = await asyncio.wait_for(asyncpg.connect(url), timeout=8.0)
        val = await conn.fetchval("SELECT version();")
        print(f"[NEON SUCCESS] Connected! PostgreSQL Version: {val[:60]}")
        await conn.close()
    except Exception as e:
        print(f"[NEON ERROR]: {e}")

if __name__ == "__main__":
    asyncio.run(main())
