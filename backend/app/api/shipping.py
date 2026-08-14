from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Shipment, Order
from app.schemas.schemas import TrackingResponse
from app.services.shiprocket_svc import shiprocket_svc

router = APIRouter(prefix="/shipping", tags=["Logistics & Live Tracking"])

@router.get("/track", response_model=TrackingResponse)
async def track_shipment_query(
    tracking_number: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    tracking_id = tracking_number or "SKIPD-984201"
    return await _process_tracking(tracking_id, db)

@router.get("/track/{tracking_id}", response_model=TrackingResponse)
async def track_shipment_path(
    tracking_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await _process_tracking(tracking_id, db)

async def _process_tracking(tracking_id: str, db: AsyncSession):
    # Search shipment by AWB or Order Number
    query = select(Shipment).where(Shipment.awb_code == tracking_id)
    result = await db.execute(query)
    shipment = result.scalars().first()

    if not shipment:
        # Search by order_number
        ord_res = await db.execute(select(Order).where(Order.order_number == tracking_id))
        order = ord_res.scalars().first()
        if order:
            shipment_res = await db.execute(select(Shipment).where(Shipment.order_id == order.id))
            shipment = shipment_res.scalars().first()

    awb_to_use = shipment.awb_code if shipment else tracking_id
    live_tracking_data = await shiprocket_svc.get_live_tracking(awb_code=awb_to_use)
    
    return live_tracking_data

@router.get("/serviceability")
async def check_pincode_serviceability(pincode: str):
    if len(pincode) != 6 or not pincode.isdigit():
        raise HTTPException(status_code=400, detail="Invalid Indian 6-digit Pincode")
    
    # Calculate delivery estimate based on pincode zone
    is_metro = pincode.startswith(("11", "40", "56", "70", "60", "50"))
    estimated_days = "1-2 Business Days" if is_metro else "3-4 Business Days"
    
    return {
        "pincode": pincode,
        "serviceable": True,
        "courier_partner": "BlueDart Express / Delhivery",
        "estimated_delivery": estimated_days,
        "cod_available": True,
        "prepaid_available": True,
        "express_shipping": is_metro
    }


# ─────────────────────────────────────────────
# 🚚 DIJKSTRA'S SHORTEST PATH LOGISTICS ROUTING
# ─────────────────────────────────────────────
from app.services.logistics_routing import logistics_router

@router.post("/estimate-delivery")
async def estimate_delivery_dijkstra(payload: dict):
    """
    🚚 Dijkstra's Shortest Path Delivery Estimate:
    Calculates optimal fulfillment warehouse, shortest hub route, and ETA using Dijkstra's Priority Queue Algorithm.
    """
    pincode = str(payload.get("pincode", "201301")).strip()
    if len(pincode) != 6 or not pincode.isdigit():
        raise HTTPException(status_code=400, detail="Invalid 6-digit Indian Pincode")

    route_details = logistics_router.find_shortest_delivery_route(pincode)
    return route_details
