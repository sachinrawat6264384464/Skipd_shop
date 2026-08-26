import asyncio
import asyncpg
import sys

async def setup():
    passwords_to_try = ['postgres', 'root', 'admin', 'password', '123456', '12345', 'postgres123', 'admin123', 'root123', '']
    connected_pwd = None
    last_error = None
    
    print("Attempting connection to PostgreSQL on localhost:5433...")
    for pwd in passwords_to_try:
        try:
            conn = await asyncpg.connect(user='postgres', password=pwd, host='127.0.0.1', port=5433, database='postgres')
            print(f"[SUCCESS] Connected to PostgreSQL port 5433 with password='{pwd}'")
            connected_pwd = pwd
            
            # Check if ecom_commerce_db database exists
            db_exists = await conn.fetchval("SELECT 1 FROM pg_database WHERE datname = 'ecom_commerce_db'")
            if not db_exists:
                await conn.execute("CREATE DATABASE ecom_commerce_db")
                print("[SUCCESS] Database 'ecom_commerce_db' created on port 5433!")
            else:
                print("[INFO] Database 'ecom_commerce_db' already exists on port 5433.")
            
            await conn.close()
            break
        except Exception as e:
            last_error = str(e)
            continue

    if connected_pwd is None:
        print("[ERROR] Could not connect to PostgreSQL on port 5433.")
        print(f"[ERROR] Last error: {last_error}")
        return None

    return connected_pwd

if __name__ == "__main__":
    pwd = asyncio.run(setup())
    if pwd is not None:
        print(f"PostgreSQL connection verified with password: {pwd}")
    else:
        sys.exit(1)
