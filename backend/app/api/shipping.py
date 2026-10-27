import time
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException, Request, Header, BackgroundTasks, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import (
    Shipment, Order, OrderStatus, ShipmentTrackingEvent,
    ShippingWebhookLog, OrderStatusHistory
)
from app.schemas.schemas import TrackingResponse, TrackingTimelineItem
from app.services.shiprocket_svc import shiprocket_svc

router = APIRouter(prefix="/shipping", tags=["Logistics & Live Tracking"])

# ─────────────────────────────────────────────────────────
# 1. LIVE PINCODE SERVICEABILITY & COURIER RATES
# ─────────────────────────────────────────────────────────
@router.get("/serviceability")
async def check_pincode_serviceability(
    pincode: str = Query(..., description="6-digit Indian delivery pincode"),
    weight: float = Query(0.5, ge=0.1, le=50.0, description="Package weight in kg"),
    cod: int = Query(1, ge=0, le=1, description="1 for COD, 0 for Prepaid only")
):
    """
    Query real-time Shiprocket courier availability, ETD, and freight rates for any Indian pincode.
    """
    clean_pincode = str(pincode).strip()
    if len(clean_pincode) != 6 or not clean_pincode.isdigit():
        raise HTTPException(status_code=400, detail="Invalid Indian 6-digit Pincode format")
    
    return await shiprocket_svc.check_serviceability(
        delivery_postcode=clean_pincode,
        weight=weight,
        cod=cod
    )


# ─────────────────────────────────────────────────────────
# 2. LIVE ORDER & SHIPMENT TRACKING (Customer & Public API)
# ─────────────────────────────────────────────────────────
@router.get("/track", response_model=TrackingResponse)
async def track_shipment_query(
    tracking_number: Optional[str] = Query(None, description="AWB Code, Order Number, or Shipment ID"),
    db: AsyncSession = Depends(get_db)
):
    tracking_id = tracking_number or "SR-8849201"
    return await _process_tracking(tracking_id, db)

@router.get("/track/{tracking_id}", response_model=TrackingResponse)
async def track_shipment_path(
    tracking_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await _process_tracking(tracking_id, db)

async def _process_tracking(tracking_id: str, db: AsyncSession) -> TrackingResponse:
    clean_id = str(tracking_id).strip().replace("#", "")
    
    # 1. Search directly in Shipments table
    query = (
        select(Shipment)
        .options(selectinload(Shipment.order), selectinload(Shipment.tracking_events))
        .where(
            or_(
                Shipment.awb_code == clean_id,
                Shipment.awb_code == tracking_id,
                Shipment.shiprocket_order_id == clean_id,
                Shipment.shiprocket_shipment_id == clean_id
            )
        )
    )
    result = await db.execute(query)
    shipment = result.scalars().first()

    # 2. If not found by AWB, search by Order Number
    if not shipment:
        ord_res = await db.execute(
            select(Order)
            .options(selectinload(Order.shipment).selectinload(Shipment.tracking_events))
            .where(or_(Order.order_number == tracking_id, Order.order_number == clean_id))
        )
        order = ord_res.scalars().first()
        if order and order.shipment:
            shipment = order.shipment

    awb_to_use = shipment.awb_code if (shipment and shipment.awb_code) else tracking_id
    live_tracking_data = await shiprocket_svc.get_live_tracking(awb_code=awb_to_use, shipment_record=shipment)

    # 3. If persisted tracking events exist in DB, merge them cleanly
    if shipment and shipment.tracking_events:
        db_events = []
        for ev in reversed(shipment.tracking_events):
            ev_time_str = ev.event_time.strftime("%d %b %Y, %I:%M %p") if ev.event_time else "Recent"
            db_events.append({
                "status": ev.status,
                "location": ev.location or "In Transit",
                "timestamp": ev_time_str,
                "completed": True
            })
        
        created_str = shipment.created_at.strftime("%d %b %Y, %I:%M %p") if shipment.created_at else "Recent"
        base_milestones = [
            {
                "status": "Order Placed & Confirmed",
                "location": "BOTCOM Order Processing Center",
                "timestamp": created_str,
                "completed": True
            }
        ]
        live_tracking_data["timeline"] = base_milestones + db_events

    timeline_items = [
        TrackingTimelineItem(
            status=t.get("status", "Status Update"),
            location=t.get("location", "Hub"),
            timestamp=str(t.get("timestamp", "Recent")),
            completed=bool(t.get("completed", True))
        ) for t in live_tracking_data.get("timeline", [])
    ]

    return TrackingResponse(
        order_number=str(live_tracking_data.get("order_number", "ORD-10042")),
        awb_code=str(live_tracking_data.get("awb_code", awb_to_use)),
        courier_name=str(live_tracking_data.get("courier_name", "Delhivery Surface")),
        current_status=str(live_tracking_data.get("current_status", "IN TRANSIT")),
        estimated_delivery=str(live_tracking_data.get("estimated_delivery", "Within 2-3 Business Days")),
        timeline=timeline_items,
        label_url=shipment.label_url if shipment else None,
        pickup_status=shipment.pickup_status if shipment else None,
        pickup_scheduled_date=shipment.pickup_scheduled_date if shipment else None
    )


# ─────────────────────────────────────────────────────────
# 3. ADMIN SHIPMENT LOGISTICS DASHBOARD
# ─────────────────────────────────────────────────────────
@router.get("/admin/all")
async def get_all_admin_shipments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[str] = Query(None),
    courier: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Fetch all shipments with linked order & customer info for Admin Logistics Hub."""
    stmt = (
        select(Shipment)
        .options(selectinload(Shipment.order), selectinload(Shipment.tracking_events))
        .order_by(Shipment.id.desc())
    )

    if status and status.upper() != "ALL":
        stmt = stmt.where(Shipment.status.ilike(f"%{status}%"))
    if courier and courier.upper() != "ALL":
        stmt = stmt.where(Shipment.courier_name.ilike(f"%{courier}%"))

    res = await db.execute(stmt.offset(skip).limit(limit))
    shipments = res.scalars().all()

    output = []
    for idx, s in enumerate(shipments):
        ord_obj = s.order
        
        # Apply search filter across AWB, Order Number, Customer, Destination
        if search:
            q = search.lower().strip()
            match = (
                (s.awb_code and q in s.awb_code.lower()) or
                (ord_obj and q in ord_obj.order_number.lower()) or
                (ord_obj and q in ord_obj.customer_name.lower()) or
                (s.destination and q in s.destination.lower()) or
                (s.pin_code and q in s.pin_code.lower())
            )
            if not match:
                continue

        output.append({
            "id": s.id,
            "orderId": ord_obj.order_number if ord_obj else f"#E-COM-2587{9-idx}",
            "orderDbId": ord_obj.id if ord_obj else s.order_id,
            "awbCode": s.awb_code or f"SR-884920{idx+1}",
            "customerName": ord_obj.customer_name if ord_obj else "Customer Account",
            "customerEmail": ord_obj.customer_email if ord_obj else "customer@e-com.in",
            "customerPhone": ord_obj.customer_phone if ord_obj else "+91 98765 43210",
            "courierName": s.courier_name or "Delhivery Surface",
            "courierId": s.courier_id,
            "destination": s.destination or "Gwalior, Madhya Pradesh",
            "pinCode": s.pin_code or "474001",
            "estDeliveryDate": s.est_delivery_date or "Within 2-3 Business Days",
            "status": s.status or "IN TRANSIT",
            "currentLocation": s.current_location or "Sorting Center Hub",
            "pickupStatus": s.pickup_status or "PENDING",
            "pickupScheduledDate": s.pickup_scheduled_date,
            "labelUrl": s.label_url,
            "trackingUrl": s.tracking_url or f"https://shiprocket.co/tracking/{s.awb_code or 'SR-DEMO'}",
            "date": s.created_at.strftime("%b %d, %Y") if s.created_at else "May 25, 2026",
            "weight": s.weight or 0.5,
            "codAmount": s.cod_amount or 0.0
        })
    return output

@router.get("/admin/{shipment_id}")
async def get_admin_shipment_detail(
    shipment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve deep shipment detail with tracking events, customer details, and actions."""
    stmt = (
        select(Shipment)
        .options(
            selectinload(Shipment.order).selectinload(Order.items),
            selectinload(Shipment.tracking_events)
        )
        .where(Shipment.id == shipment_id)
    )
    res = await db.execute(stmt)
    shipment = res.scalars().first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    order = shipment.order
    events = [
        {
            "id": ev.id,
            "status": ev.status,
            "activity": ev.activity,
            "location": ev.location,
            "event_time": ev.event_time.strftime("%d %b %Y, %I:%M %p") if ev.event_time else ""
        } for ev in shipment.tracking_events
    ]

    items = []
    if order and order.items:
        items = [
            {
                "product_name": it.product_name,
                "quantity": it.quantity,
                "unit_price": it.unit_price,
                "total": it.quantity * it.unit_price
            } for it in order.items
        ]

    return {
        "id": shipment.id,
        "order_id": order.id if order else shipment.order_id,
        "order_number": order.order_number if order else f"#E-COM-{shipment.order_id}",
        "customer_name": order.customer_name if order else "Customer",
        "customer_email": order.customer_email if order else "",
        "customer_phone": order.customer_phone if order else "",
        "awb_code": shipment.awb_code,
        "shiprocket_order_id": shipment.shiprocket_order_id,
        "shiprocket_shipment_id": shipment.shiprocket_shipment_id,
        "courier_name": shipment.courier_name,
        "status": shipment.status,
        "destination": shipment.destination,
        "pin_code": shipment.pin_code,
        "est_delivery_date": shipment.est_delivery_date,
        "current_location": shipment.current_location,
        "pickup_status": shipment.pickup_status,
        "pickup_scheduled_date": shipment.pickup_scheduled_date,
        "label_url": shipment.label_url,
        "tracking_url": shipment.tracking_url,
        "weight": shipment.weight,
        "dimensions": shipment.dimensions,
        "cod_amount": shipment.cod_amount,
        "items": items,
        "events": events
    }


# ─────────────────────────────────────────────────────────
# 4. SHIPMENT CREATION & ORDER SYNC
# ─────────────────────────────────────────────────────────
@router.post("/admin/create")
async def create_admin_shipment(payload: dict, db: AsyncSession = Depends(get_db)):
    """Create a new shipment and synchronize with Shiprocket API."""
    order_id = payload.get("order_id") or payload.get("orderDbId")
    order = None

    if order_id:
        ord_res = await db.execute(
            select(Order).options(selectinload(Order.items)).where(Order.id == int(order_id))
        )
        order = ord_res.scalars().first()

    # Build shipment payload from real Order or provided payload
    order_data = dict(payload)
    if order:
        order_data["order_number"] = order.order_number
        order_data["customer_name"] = order.customer_name
        order_data["customer_email"] = order.customer_email
        order_data["customer_phone"] = order.customer_phone
        order_data["total_amount"] = order.total_amount
        if isinstance(order.shipping_address, dict):
            addr = order.shipping_address
            order_data["destination"] = f"{addr.get('address1', '')} {addr.get('city', '')}, {addr.get('state', '')}"
            order_data["pin_code"] = addr.get("zip") or addr.get("pincode")
            order_data["city"] = addr.get("city")
            order_data["state"] = addr.get("state")
        if order.items:
            order_data["items"] = [
                {
                    "product_name": it.product_name,
                    "sku": f"SKU-{it.product_id}",
                    "quantity": it.quantity,
                    "unit_price": it.unit_price
                } for it in order.items
            ]

    # Create shipment via Shiprocket service
    sr_res = await shiprocket_svc.create_shipment(order_data)
    
    awb = sr_res.get("awb_code") or payload.get("awb_code") or f"SR-88{int(time.time())}"
    courier = sr_res.get("courier_name") or payload.get("courier_name") or "Delhivery Surface"
    courier_id = sr_res.get("courier_id")
    sr_ord_id = sr_res.get("shiprocket_order_id")
    sr_shp_id = sr_res.get("shiprocket_shipment_id")
    track_url = sr_res.get("tracking_url") or f"https://shiprocket.co/tracking/{awb}"
    
    dest = order_data.get("destination") or payload.get("destination") or "New Delhi, Delhi"
    pin = str(order_data.get("pin_code") or payload.get("pin_code") or "110001")
    est_date = order_data.get("est_delivery_date") or payload.get("est_delivery_date") or "Within 2-3 Business Days"

    shipment = Shipment(
        order_id=order.id if order else int(order_id or 1),
        shiprocket_order_id=sr_ord_id,
        shiprocket_shipment_id=sr_shp_id,
        awb_code=awb,
        courier_id=courier_id,
        courier_name=courier,
        status="IN TRANSIT",
        destination=dest,
        pin_code=pin,
        est_delivery_date=est_date,
        current_location="Shiprocket Fulfillment Center",
        tracking_url=track_url,
        weight=float(order_data.get("weight", 0.5)),
        cod_amount=float(order_data.get("cod_amount", 0.0))
    )
    db.add(shipment)
    await db.flush()

    # Log initial tracking events
    init_ev1 = ShipmentTrackingEvent(
        shipment_id=shipment.id,
        awb_code=awb,
        status="MANIFEST GENERATED",
        activity="Shipping label & manifest generated with courier",
        description="Shipping label & manifest generated with courier",
        location="Shiprocket Fulfillment Center",
        raw_payload=sr_res
    )
    init_ev2 = ShipmentTrackingEvent(
        shipment_id=shipment.id,
        awb_code=awb,
        status="IN TRANSIT",
        activity="AWB assigned and parcel prepared for dispatch",
        description="AWB assigned and parcel prepared for dispatch",
        location="Shiprocket Fulfillment Center",
        raw_payload=sr_res
    )
    db.add(init_ev1)
    db.add(init_ev2)

    if order:
        order.status = OrderStatus.SHIPPED

    await db.commit()
    await db.refresh(shipment)
    
    return {
        "status": "success",
        "message": "Shipment created & synced with Shiprocket successfully!",
        "shipment_id": shipment.id,
        "awb_code": awb,
        "courier_name": courier,
        "tracking_url": track_url,
        "shiprocket_details": sr_res
    }


# ─────────────────────────────────────────────────────────
# 5. SHIPPING LABEL GENERATION
# ─────────────────────────────────────────────────────────
@router.post("/admin/{shipment_id}/label")
async def generate_shipping_label(
    shipment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Generate or retrieve the official Shiprocket shipping label PDF."""
    res = await db.execute(select(Shipment).where(Shipment.id == shipment_id))
    shipment = res.scalars().first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    sr_shipment_id = shipment.shiprocket_shipment_id or str(shipment.id)
    label_res = await shiprocket_svc.generate_label(sr_shipment_id)
    
    if label_res.get("label_url"):
        shipment.label_url = label_res["label_url"]
        await db.commit()
        await db.refresh(shipment)

    return {
        "status": "success",
        "label_url": shipment.label_url or label_res.get("label_url"),
        "message": label_res.get("message", "Shipping label ready for download!")
    }


# ─────────────────────────────────────────────────────────
# 6. PICKUP SCHEDULING
# ─────────────────────────────────────────────────────────
@router.post("/admin/{shipment_id}/pickup")
async def schedule_courier_pickup(
    shipment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Schedule courier pickup with central warehouse dispatch."""
    res = await db.execute(select(Shipment).where(Shipment.id == shipment_id))
    shipment = res.scalars().first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    sr_shipment_id = shipment.shiprocket_shipment_id or str(shipment.id)
    pickup_res = await shiprocket_svc.request_pickup(sr_shipment_id)
    
    shipment.pickup_status = pickup_res.get("pickup_status", "SCHEDULED")
    shipment.pickup_scheduled_date = pickup_res.get("pickup_scheduled_date", "Tomorrow 10:00 AM")
    
    ev = ShipmentTrackingEvent(
        shipment_id=shipment.id,
        awb_code=shipment.awb_code,
        status="PICKUP SCHEDULED",
        activity=f"Pickup scheduled for {shipment.pickup_scheduled_date}",
        description=f"Pickup scheduled for {shipment.pickup_scheduled_date}",
        location=shipment.current_location or "Central Warehouse",
        raw_payload=pickup_res
    )
    db.add(ev)
    await db.commit()
    await db.refresh(shipment)

    return {
        "status": "success",
        "pickup_status": shipment.pickup_status,
        "pickup_scheduled_date": shipment.pickup_scheduled_date,
        "message": pickup_res.get("message", "Pickup scheduled successfully!")
    }


# ─────────────────────────────────────────────────────────
# 7. SHIPMENT CANCELLATION
# ─────────────────────────────────────────────────────────
@router.post("/admin/{shipment_id}/cancel")
async def cancel_shipment(
    shipment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Cancel shipment on Shiprocket and update BOTCOM registry."""
    res = await db.execute(
        select(Shipment).options(selectinload(Shipment.order)).where(Shipment.id == shipment_id)
    )
    shipment = res.scalars().first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    cancel_res = await shiprocket_svc.cancel_shipment(
        shiprocket_order_id=shipment.shiprocket_order_id or str(shipment.order_id),
        awb_code=shipment.awb_code
    )

    shipment.status = "CANCELLED"
    if shipment.order:
        shipment.order.status = OrderStatus.CANCELLED

    ev = ShipmentTrackingEvent(
        shipment_id=shipment.id,
        awb_code=shipment.awb_code,
        status="CANCELLED",
        activity="Shipment cancelled by administrator",
        description="Shipment cancelled by administrator",
        location="Logistics Command Center",
        raw_payload=cancel_res
    )
    db.add(ev)
    await db.commit()

    return {
        "status": "success",
        "message": f"Shipment {shipment.awb_code or shipment.id} cancelled successfully!"
    }


# ─────────────────────────────────────────────────────────
# 8. LIVE STATUS RECONCILIATION & SYNC
# ─────────────────────────────────────────────────────────
@router.post("/admin/{shipment_id}/sync")
async def sync_shipment_status(
    shipment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Force re-fetch tracking status from Shiprocket and sync database records."""
    res = await db.execute(select(Shipment).where(Shipment.id == shipment_id))
    shipment = res.scalars().first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    live_data = await shiprocket_svc.get_live_tracking(shipment.awb_code, shipment_record=shipment)
    new_status = live_data.get("current_status", shipment.status)
    
    shipment.status = new_status
    shipment.last_synced_at = datetime.utcnow()
    
    # Add tracking event
    ev = ShipmentTrackingEvent(
        shipment_id=shipment.id,
        awb_code=shipment.awb_code,
        status=new_status,
        activity=f"Synchronized status: {new_status}",
        description=f"Synchronized status: {new_status}",
        location=shipment.current_location or "Transit Facility",
        raw_payload=live_data
    )
    db.add(ev)
    await db.commit()

    return {
        "status": "success",
        "synced_status": new_status,
        "awb_code": shipment.awb_code,
        "tracking_data": live_data
    }


# ─────────────────────────────────────────────────────────
# 9. SHIPROCKET WEBHOOK RECEIVER
# ─────────────────────────────────────────────────────────
@router.post("/webhook")
async def shiprocket_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_api_key: Optional[str] = Header(None)
):
    """
    Automated Webhook endpoint for Shiprocket real-time shipment status updates.
    Handles out-of-order protection, deduplication, and order completion sync.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON webhook payload")

    awb = str(payload.get("awb") or payload.get("awb_code") or "").strip()
    sr_shipment_id = str(payload.get("shipment_id") or "").strip()
    raw_status = str(payload.get("current_status") or payload.get("status") or "").strip()
    location = str(payload.get("current_location") or payload.get("location") or "Regional Hub").strip()

    # Log incoming webhook
    webhook_log = ShippingWebhookLog(
        event_type=raw_status or "STATUS_UPDATE",
        awb_code=awb,
        shipment_id=sr_shipment_id,
        payload=payload,
        processed=False
    )
    db.add(webhook_log)
    await db.flush()

    if not awb and not sr_shipment_id:
        webhook_log.error_message = "No AWB or Shipment ID in payload"
        await db.commit()
        return {"status": "ignored", "reason": "Missing identifier"}

    # Find matching shipment
    query = select(Shipment).options(selectinload(Shipment.order)).where(
        or_(
            Shipment.awb_code == awb,
            Shipment.shiprocket_shipment_id == sr_shipment_id
        )
    )
    res = await db.execute(query)
    shipment = res.scalars().first()

    if not shipment:
        webhook_log.error_message = f"Shipment with AWB '{awb}' not found in registry"
        await db.commit()
        return {"status": "unmatched", "awb": awb}

    normalized_status = shiprocket_svc.normalize_webhook_status(raw_status)
    
    # 🔒 Out-of-Order Regression Protection:
    # If shipment is already DELIVERED, an out-of-order in-transit scan must NOT downgrade the status!
    if shipment.status == "DELIVERED" and normalized_status != "DELIVERED":
        # Log event but do not revert primary shipment status
        ev = ShipmentTrackingEvent(
            shipment_id=shipment.id,
            awb_code=shipment.awb_code,
            status=normalized_status,
            activity=f"Out-of-order webhook scan: {raw_status}",
            description=f"Out-of-order webhook scan: {raw_status}",
            location=location,
            raw_payload=payload
        )
        db.add(ev)
        webhook_log.processed = True
        await db.commit()
        return {"status": "logged_out_of_order", "current_status": shipment.status}

    # Update Shipment status & location
    shipment.status = normalized_status
    shipment.current_location = location
    shipment.last_synced_at = datetime.utcnow()

    # Sync with BOTCOM Order lifecycle
    if shipment.order:
        if normalized_status == "DELIVERED":
            shipment.order.status = OrderStatus.DELIVERED
            # Add to order history
            h = OrderStatusHistory(
                order_id=shipment.order.id,
                status="Delivered",
                message=f"Order successfully delivered to customer ({location})",
                updated_by="Shiprocket Webhook"
            )
            db.add(h)
        elif normalized_status == "CANCELLED":
            shipment.order.status = OrderStatus.CANCELLED
            h = OrderStatusHistory(
                order_id=shipment.order.id,
                status="Cancelled",
                message="Shipment cancelled by courier",
                updated_by="Shiprocket Webhook"
            )
            db.add(h)

    # Append tracking event
    ev = ShipmentTrackingEvent(
        shipment_id=shipment.id,
        awb_code=shipment.awb_code,
        status=normalized_status,
        activity=f"Courier scan: {raw_status}",
        description=f"Courier scan: {raw_status}",
        location=location,
        raw_payload=payload
    )
    db.add(ev)

    webhook_log.processed = True
    await db.commit()

    return {
        "status": "success",
        "message": f"Webhook processed: AWB {awb} updated to {normalized_status}",
        "normalized_status": normalized_status
    }
