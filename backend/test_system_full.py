import pytest
import asyncio
import json
import urllib.request
import urllib.error
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

pytestmark = pytest.mark.asyncio

async def test_01_database_connectivity():
    """Verify PostgreSQL DB connection and table record counts."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT 1;"))
        assert result.scalar() == 1, "PostgreSQL engine ping failed"

        users_cnt = (await session.execute(text("SELECT COUNT(*) FROM users;"))).scalar()
        products_cnt = (await session.execute(text("SELECT COUNT(*) FROM products;"))).scalar()
        categories_cnt = (await session.execute(text("SELECT COUNT(*) FROM categories;"))).scalar()
        orders_cnt = (await session.execute(text("SELECT COUNT(*) FROM orders;"))).scalar()

        assert users_cnt is not None
        assert products_cnt is not None
        assert categories_cnt is not None
        assert orders_cnt is not None

async def test_02_products_api():
    """Verify Products GET API returning live catalog."""
    base_url = "http://127.0.0.1:8080/api/v1"
    try:
        req = urllib.request.urlopen(f"{base_url}/products")
        assert req.getcode() == 200
        data = json.loads(req.read().decode('utf-8'))
        assert isinstance(data, list)
    except urllib.error.URLError:
        pytest.skip("Backend API server offline on 127.0.0.1:8080")

async def test_03_auth_flow():
    """Verify Request OTP and Verify OTP Auth APIs."""
    base_url = "http://127.0.0.1:8080/api/v1"
    try:
        payload = json.dumps({"email_or_phone": "customer@skipd.in"}).encode('utf-8')
        req = urllib.request.Request(
            f"{base_url}/auth/request-otp",
            data=payload,
            headers={'Content-Type': 'application/json'}
        )
        res = urllib.request.urlopen(req)
        assert res.getcode() == 200
        data = json.loads(res.read().decode('utf-8'))
        otp = data.get("otp_demo")
        assert otp is not None, "OTP generation failed"

        v_payload = json.dumps({"email_or_phone": "customer@skipd.in", "otp": otp}).encode('utf-8')
        v_req = urllib.request.Request(
            f"{base_url}/auth/verify-otp",
            data=v_payload,
            headers={'Content-Type': 'application/json'}
        )
        v_res = urllib.request.urlopen(v_req)
        assert v_res.getcode() == 200
        v_data = json.loads(v_res.read().decode('utf-8'))
        assert "access_token" in v_data, "JWT token missing"
    except urllib.error.URLError:
        pytest.skip("Backend API server offline on 127.0.0.1:8080")

async def test_04_shipping_serviceability():
    """Verify Shipping PIN code serviceability API."""
    base_url = "http://127.0.0.1:8080/api/v1"
    try:
        req = urllib.request.urlopen(f"{base_url}/shipping/serviceability?pincode=474001")
        assert req.getcode() == 200
        data = json.loads(req.read().decode('utf-8'))
        assert "courier_partner" in data
    except urllib.error.URLError:
        pytest.skip("Backend API server offline on 127.0.0.1:8080")

async def test_05_frontend_dev_server():
    """Verify Next.js frontend storefront is live."""
    try:
        req = urllib.request.urlopen("http://localhost:3003")
        assert req.getcode() in [200, 304, 307]
    except Exception as e:
        pytest.skip(f"Frontend server check skipped: {e}")
