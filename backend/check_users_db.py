import asyncio
import asyncpg
import ssl

# This queries the Neon Cloud DB that the LOCAL backend uses
# DB URL from .env: postgresql+asyncpg://neondb_owner:...@ep-still-king.../neondb

async def main():
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

    conn = await asyncpg.connect(
        "postgresql://neondb_owner:npg_co6MJSXeWK8z@ep-still-king-axcdr7h1-pooler.c-4.us-east-2.aws.neon.tech/neondb",
        ssl=ssl_ctx
    )

    # Check ALL schemas and tables
    tables = await conn.fetch("""
        SELECT table_schema, table_name, 
               (SELECT COUNT(*) FROM information_schema.columns 
                WHERE table_schema = t.table_schema AND table_name = t.table_name) as col_count
        FROM information_schema.tables t
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name
    """)
    
    print(f"=== ALL TABLES ({len(tables)}) ===")
    for t in tables:
        schema = t["table_schema"]
        name = t["table_name"]
        # Count rows
        try:
            count_row = await conn.fetchrow(f'SELECT COUNT(*) as cnt FROM "{schema}"."{name}"')
            cnt = count_row["cnt"]
        except:
            cnt = "?"
        print(f"  [{schema}].{name} — {cnt} rows")

    print()
    
    # Check if users table exists in any schema
    user_tables = [t for t in tables if "user" in t["table_name"].lower()]
    for t in user_tables:
        schema = t["table_schema"]
        name = t["table_name"]
        print(f"\n=== {schema}.{name} DATA ===")
        try:
            rows = await conn.fetch(f'SELECT * FROM "{schema}"."{name}" LIMIT 50')
            if rows:
                print(f"Columns: {list(rows[0].keys())}")
                for i, r in enumerate(rows, 1):
                    d = dict(r)
                    print(f"\n  {i}.", d)
            else:
                print("  (empty)")
        except Exception as e:
            print(f"  Error: {e}")

    await conn.close()

asyncio.run(main())
