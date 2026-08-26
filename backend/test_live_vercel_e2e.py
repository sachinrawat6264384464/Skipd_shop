import pytest
import urllib.request
import json

pytestmark = pytest.mark.asyncio

LIVE_URL = "https://e-com-shop.vercel.app"

async def test_01_live_storefront_home():
    """Verify live Vercel storefront home page is online and returning HTTP 200."""
    req = urllib.request.urlopen(LIVE_URL)
    assert req.getcode() == 200
    html = req.read().decode('utf-8')
    assert "E-COM" in html or "html" in html.lower()

async def test_02_live_admin_dashboard():
    """Verify live Admin Dashboard route is online."""
    req = urllib.request.urlopen(f"{LIVE_URL}/admin")
    assert req.getcode() == 200

async def test_03_live_admin_orders():
    """Verify live Admin Orders page (/admin/orders) is online."""
    req = urllib.request.urlopen(f"{LIVE_URL}/admin/orders")
    assert req.getcode() == 200

async def test_04_live_admin_payments():
    """Verify live Admin Payments page (/admin/payments) is online."""
    req = urllib.request.urlopen(f"{LIVE_URL}/admin/payments")
    assert req.getcode() == 200

async def test_05_live_admin_products():
    """Verify live Admin Products page (/admin/products) is online."""
    req = urllib.request.urlopen(f"{LIVE_URL}/admin/products")
    assert req.getcode() == 200

async def test_06_live_admin_delivery():
    """Verify live Admin Delivery page (/admin/delivery) is online."""
    req = urllib.request.urlopen(f"{LIVE_URL}/admin/delivery")
    assert req.getcode() == 200

async def test_07_live_checkout():
    """Verify live Storefront Checkout route is online."""
    req = urllib.request.urlopen(f"{LIVE_URL}/checkout")
    assert req.getcode() == 200
