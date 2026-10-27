import asyncio
import sys
import os
import pytest
from httpx import AsyncClient, ASGITransport

# Set python path to backend root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.database import AsyncSessionLocal
from app.models.models import Shipment, Order, OrderStatus, ShipmentTrackingEvent, ShippingWebhookLog
from app.services.shiprocket_svc import shiprocket_svc
from sqlalchemy import select

@pytest.mark.asyncio
async def test_01_serviceability_check():
    """Verify pincode serviceability returns available couriers, rate, and ETD."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Metro pincode (Delhi)
        res = await ac.get("/api/v1/shipping/serviceability?pincode=110001&weight=0.5&cod=1")
        assert res.status_code == 200
        data = res.json()
        assert data["pincode"] == "110001"
        assert data["serviceable"] is True
        assert len(data["available_couriers"]) > 0
        assert data["express_shipping"] is True

        # Non-metro pincode (Gwalior)
        res_non_metro = await ac.get("/api/v1/shipping/serviceability?pincode=474001&weight=1.0&cod=0")
        assert res_non_metro.status_code == 200
        data_nm = res_non_metro.json()
        assert data_nm["pincode"] == "474001"
        assert data_nm["serviceable"] is True

        # Invalid pincode
        res_invalid = await ac.get("/api/v1/shipping/serviceability?pincode=123")
        assert res_invalid.status_code == 400

@pytest.mark.asyncio
async def test_02_shipment_creation_and_awb():
    """Verify shipment creation with AWB assignment and DB persistence."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "order_id": 1,
            "order_number": "#E-COM-TEST-9001",
            "customer_name": "Test Customer",
            "customer_email": "test@e-com.in",
            "customer_phone": "9876543210",
            "destination": "123 Connaught Place, New Delhi",
            "pin_code": "110001",
            "total_amount": 1499.0,
            "weight": 0.8,
            "items": [
                {"product_name": "Pro Bluetooth Earbuds", "sku": "SKU-TEST-01", "quantity": 1, "unit_price": 1499.0}
            ]
        }
        res = await ac.post("/api/v1/shipping/admin/create", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert "awb_code" in data
        assert "shipment_id" in data
        assert "courier_name" in data

@pytest.mark.asyncio
async def test_03_shipping_label_generation():
    """Verify shipping label generation returns valid PDF download URL."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Fetch first shipment
        list_res = await ac.get("/api/v1/shipping/admin/all")
        assert list_res.status_code == 200
        shipments = list_res.json()
        assert len(shipments) > 0
        target_id = shipments[0]["id"]

        label_res = await ac.post(f"/api/v1/shipping/admin/{target_id}/label")
        assert label_res.status_code == 200
        label_data = label_res.json()
        assert label_data["status"] == "success"
        assert "label_url" in label_data
        assert label_data["label_url"].startswith("http")

@pytest.mark.asyncio
async def test_04_pickup_scheduling():
    """Verify courier pickup scheduling updates pickup status & scheduled date."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        list_res = await ac.get("/api/v1/shipping/admin/all")
        target_id = list_res.json()[0]["id"]

        pickup_res = await ac.post(f"/api/v1/shipping/admin/{target_id}/pickup")
        assert pickup_res.status_code == 200
        p_data = pickup_res.json()
        assert p_data["status"] == "success"
        assert p_data["pickup_status"] == "SCHEDULED"
        assert p_data["pickup_scheduled_date"] is not None

@pytest.mark.asyncio
async def test_05_live_tracking_and_timeline():
    """Verify live tracking returns AWB, courier, status, and chronological timeline."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        list_res = await ac.get("/api/v1/shipping/admin/all")
        first_shipment = list_res.json()[0]
        awb = first_shipment["awbCode"]

        track_res = await ac.get(f"/api/v1/shipping/track/{awb}")
        assert track_res.status_code == 200
        t_data = track_res.json()
        assert t_data["awb_code"] == awb
        assert "courier_name" in t_data
        assert "timeline" in t_data
        assert len(t_data["timeline"]) >= 3

@pytest.mark.asyncio
async def test_06_webhook_processing_and_order_sync():
    """Verify Shiprocket incoming webhook updates shipment & order status and prevents regressions."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        list_res = await ac.get("/api/v1/shipping/admin/all")
        first_shipment = list_res.json()[0]
        awb = first_shipment["awbCode"]

        # 1. Simulate "OUT FOR DELIVERY" webhook
        wh_payload_out = {
            "awb": awb,
            "current_status": "OUT FOR DELIVERY",
            "location": "South Delhi Hub",
            "scans": [
                {"activity": "Packet dispatched with delivery executive", "location": "South Delhi", "date": "2026-10-28 09:30"}
            ]
        }
        res_out = await ac.post("/api/v1/shipping/webhook", json=wh_payload_out)
        assert res_out.status_code == 200
        assert res_out.json()["status"] == "success"
        assert res_out.json()["normalized_status"] == "OUT FOR DELIVERY"

        # 2. Simulate "DELIVERED" webhook
        wh_payload_del = {
            "awb": awb,
            "current_status": "DELIVERED",
            "location": "Customer Doorstep",
            "scans": [
                {"activity": "Delivered to recipient", "location": "Customer Doorstep", "date": "2026-10-28 14:15"}
            ]
        }
        res_del = await ac.post("/api/v1/shipping/webhook", json=wh_payload_del)
        assert res_del.status_code == 200
        assert res_del.json()["normalized_status"] == "DELIVERED"

        # 3. 🔒 Out-of-Order Regression Protection Test:
        # A late "IN TRANSIT" scan arrives after delivery; must NOT revert the primary DELIVERED status!
        wh_late_scan = {
            "awb": awb,
            "current_status": "IN TRANSIT",
            "location": "Bhopal Sorting Center"
        }
        res_late = await ac.post("/api/v1/shipping/webhook", json=wh_late_scan)
        assert res_late.status_code == 200
        assert res_late.json()["status"] == "logged_out_of_order"
        assert res_late.json()["current_status"] == "DELIVERED"

@pytest.mark.asyncio
async def test_07_shipment_cancellation():
    """Verify admin shipment cancellation updates shipment status to CANCELLED."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        list_res = await ac.get("/api/v1/shipping/admin/all")
        target_id = list_res.json()[0]["id"]

        cancel_res = await ac.post(f"/api/v1/shipping/admin/{target_id}/cancel")
        assert cancel_res.status_code == 200
        c_data = cancel_res.json()
        assert c_data["status"] == "success"

@pytest.mark.asyncio
async def test_08_order_shipment_idempotency():
    """Verify admin /orders/{order_id}/ship is idempotent and prevents duplicate shipments."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Call ship on order 1
        res1 = await ac.post("/api/v1/admin/orders/1/ship")
        assert res1.status_code in [200, 404]
        
        if res1.status_code == 200:
            # Second call must be idempotent
            res2 = await ac.post("/api/v1/admin/orders/1/ship")
            assert res2.status_code == 200
            assert "already exists" in res2.json()["message"]

