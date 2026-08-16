from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import Shipment, Order
from app.schemas.schemas import TrackingResponse
from app.services.shiprocket_svc import shiprocket_svc

router = APIRouter(prefix="/shipping", tags=["Logistics & Live Tracking"])

@router.get("/admin/all")
async def get_all_admin_shipments(db: AsyncSession = Depends(get_db)):
    """Fetch all shipments with linked order & customer info for Delivery & Express Logistics dashboard."""
    res = await db.execute(
        select(Shipment).options(selectinload(Shipment.order)).order_by(Shipment.id.desc())
    )
    shipments = res.scalars().all()

    output = []
    for idx, s in enumerate(shipments):
        ord_obj = s.order
        output.append({
            "id": s.id,
            "awbCode": s.awb_code or f"SR-884920{idx+1}",
            "orderId": ord_obj.order_number if ord_obj else f"#SKIPD-2587{9-idx}",
            "customerName": ord_obj.customer_name if ord_obj else "Customer Account",
            "customerEmail": ord_obj.customer_email if ord_obj else "customer@gmail.com",
            "customerPhone": ord_obj.customer_phone if ord_obj else "+91 98765 43210",
            "courierName": s.courier_name or "Delhivery Surface",
            "destination": s.destination or "Gwalior, Madhya Pradesh",
            "pinCode": s.pin_code or "474001",
            "estDeliveryDate": s.est_delivery_date or "May 27, 2026",
            "status": s.status or "IN TRANSIT",
            "currentLocation": s.current_location or "Bhopal Sort Center (May 25, 2025 02:32 PM)",
            "date": s.created_at.strftime("%b %d, %Y") if s.created_at else "May 25, 2025"
        })
    return output

@router.post("/admin/create")
async def create_admin_shipment(payload: dict, db: AsyncSession = Depends(get_db)):
    """Create a new shipment manually or via Shiprocket integration."""
    awb = payload.get("awb_code") or f"SR-{int(import_time())}"
    shipment = Shipment(
        order_id=payload.get("order_id", 1),
        awb_code=awb,
        courier_name=payload.get("courier_name", "Delhivery Surface"),
        status=payload.get("status", "IN TRANSIT"),
        destination=payload.get("destination", "New Delhi, Delhi"),
        pin_code=payload.get("pin_code", "110001"),
        est_delivery_date=payload.get("est_delivery_date", "May 28, 2026"),
        current_location=payload.get("current_location", "Main Hub Processing")
    )
    db.add(shipment)
    await db.commit()
    await db.refresh(shipment)
    return {"status": "success", "message": "Shipment created successfully!", "shipment_id": shipment.id}

def import_time():
    import time
    return time.time()

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
    query = select(Shipment).where(Shipment.awb_code == tracking_id)
    result = await db.execute(query)
    shipment = result.scalars().first()

    if not shipment:
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
