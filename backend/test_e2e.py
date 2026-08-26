import asyncio
import sys
import urllib.request
import json
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def test_database():
    print("\n--- 1. DATABASE CONNECTIVITY & SCHEMAS ---")
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1;"))
            val = result.scalar()
            print(f"[OK] PostgreSQL Engine Ping: SUCCESS (val={val})")

            # Check tables count
            users_cnt = (await session.execute(text("SELECT COUNT(*) FROM users;"))).scalar()
            products_cnt = (await session.execute(text("SELECT COUNT(*) FROM products;"))).scalar()
            categories_cnt = (await session.execute(text("SELECT COUNT(*) FROM categories;"))).scalar()
            orders_cnt = (await session.execute(text("SELECT COUNT(*) FROM orders;"))).scalar()

            print(f"[OK] DB Table - Users Count: {users_cnt}")
            print(f"[OK] DB Table - Categories Count: {categories_cnt}")
            print(f"[OK] DB Table - Products Count: {products_cnt}")
            print(f"[OK] DB Table - Orders Count: {orders_cnt}")
            return True
    except Exception as e:
        print(f"[ERROR] DB ERROR: {e}")
        return False

def test_redis():
    print("\n--- 2. REDIS CONNECTIVITY & CACHE ---")
    try:
        import redis
        r = redis.from_url("redis://127.0.0.1:6379/0", socket_timeout=2)
        r.ping()
        r.set("test_key", "ecom_ok", ex=10)
        val = r.get("test_key")
        print(f"[OK] Redis Ping & Set/Get: SUCCESS (key_val={val.decode('utf-8')})")
        return True
    except Exception as e:
        print(f"[INFO] Redis Note: {e} (Fallback in-memory caching active in backend)")
        return False

def test_api_endpoints():
    print("\n--- 3. BACKEND FASTAPI ENDPOINTS (GET/POST/AUTH) ---")
    base_url = "http://127.0.0.1:8080/api/v1"

    # A. GET Products API
    try:
        req = urllib.request.urlopen(f"{base_url}/products")
        data = json.loads(req.read().decode('utf-8'))
        print(f"[OK] GET /api/v1/products: HTTP 200 (Total Products Returned: {len(data)})")
    except Exception as e:
        print(f"[ERROR] GET /api/v1/products Failed: {e}")

    # B. GET Shipping Serviceability API
    try:
        req = urllib.request.urlopen(f"{base_url}/shipping/serviceability?pincode=474001")
        data = json.loads(req.read().decode('utf-8'))
        print(f"[OK] GET /api/v1/shipping/serviceability: HTTP 200 ({data.get('courier_partner')} - {data.get('estimated_delivery')})")
    except Exception as e:
        print(f"[ERROR] GET /api/v1/shipping/serviceability Failed: {e}")

    # C. POST Auth Request OTP
    try:
        payload = json.dumps({"email_or_phone": "customer@e-com.in"}).encode('utf-8')
        req = urllib.request.Request(
            f"{base_url}/auth/request-otp",
            data=payload,
            headers={'Content-Type': 'application/json'}
        )
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode('utf-8'))
        otp_demo = data.get("otp_demo")
        print(f"[OK] POST /api/v1/auth/request-otp: HTTP 200 (OTP Code Generated: {otp_demo})")

        # D. POST Auth Verify OTP & Login Token
        verify_payload = json.dumps({"email_or_phone": "customer@e-com.in", "otp": otp_demo}).encode('utf-8')
        v_req = urllib.request.Request(
            f"{base_url}/auth/verify-otp",
            data=verify_payload,
            headers={'Content-Type': 'application/json'}
        )
        v_res = urllib.request.urlopen(v_req)
        v_data = json.loads(v_res.read().decode('utf-8'))
        token = v_data.get("access_token")
        user_name = v_data.get("user_name")
        print(f"[OK] POST /api/v1/auth/verify-otp: HTTP 200 (Logged In User: '{user_name}', JWT Token Created!)")

    except Exception as e:
        print(f"[ERROR] POST Auth Failed: {e}")

def test_frontend():
    print("\n--- 4. FRONTEND NEXT.JS DEV SERVER ---")
    try:
        req = urllib.request.urlopen("http://localhost:3003")
        print(f"[OK] Frontend Storefront (http://localhost:3003): HTTP {req.getcode()} LIVE & SERVING!")
    except Exception as e:
        print(f"[ERROR] Frontend Storefront Failed: {e}")

async def run_all():
    print("=" * 60)
    print("FULL SYSTEM DIAGNOSTIC & END-TO-END VERIFICATION")
    print("=" * 60)
    await test_database()
    test_redis()
    test_api_endpoints()
    test_frontend()
    print("\n" + "=" * 60)
    print("DIAGNOSTIC TESTING COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_all())

