import random
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, Body

IST = timezone(timedelta(hours=5, minutes=30))

def to_ist_datetime(dt: Optional[datetime]) -> datetime:
    if dt is None:
        dt = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(IST)

def format_ist(dt: Optional[datetime]) -> str:
    ist_dt = to_ist_datetime(dt)
    return ist_dt.strftime("%d %b %Y at %I:%M %p").lower()
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import Order, OrderItem, OrderStatusHistory, Product, ProductVariant, OrderStatus, User, Wallet, WalletTransaction, ReturnRequest, ReturnStatus
from app.schemas.schemas import CheckoutInput, OrderResponse, ReturnRequestInput
from app.services.razorpay_svc import razorpay_svc
from app.api.deps import get_current_user
from app.services.email_service import send_order_confirmation_email

router = APIRouter(prefix="/orders", tags=["Orders & Checkout"])

@router.put("/{order_id}/status")
@router.put("/admin/{order_id}/status")
@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Update order fulfillment status in Neon PostgreSQL database.
    Supports Order ID (integer/string), Order Number (#SKIPD-123456), or AWB Code.
    """
    clean_id = order_id.replace("#", "").strip()

    # Search for order
    query = select(Order)
    if clean_id.isdigit():
        query = query.where((Order.id == int(clean_id)) | (Order.order_number == clean_id) | (Order.order_number == f"SKIPD-{clean_id}"))
    else:
        query = query.where((Order.order_number == clean_id) | (Order.order_number.ilike(f"%{clean_id}%")))

    res = await db.execute(query)
    order = res.scalars().first()

    if not order:
        # Fallback query by all orders if clean_id is inside order_number
        all_res = await db.execute(select(Order))
        for o in all_res.scalars().all():
            if clean_id.lower() in o.order_number.lower() or str(o.id) == clean_id:
                order = o
                break

    if not order:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found in database")

    new_status_raw = str(payload.get("status") or "").upper().strip()
    stage_title = "Processing"
    stage_msg = "Order status updated by admin"

    # Map to OrderStatus enum
    if new_status_raw in ["DELIVERED", "MARK DELIVERED"]:
        order.status = OrderStatus.DELIVERED
        stage_title = "Delivered"
        stage_msg = "Package successfully delivered to customer"
    elif new_status_raw in ["OUT_FOR_DELIVERY", "OUT FOR DELIVERY"]:
        order.status = OrderStatus.SHIPPED
        stage_title = "Out for Delivery"
        stage_msg = "Package out for delivery with local courier executive"
    elif new_status_raw in ["SHIPPED", "DISPATCHED"]:
        order.status = OrderStatus.SHIPPED
        stage_title = "Dispatched"
        stage_msg = "Handed over to courier partner for express delivery"
    elif new_status_raw in ["PACKED"]:
        order.status = OrderStatus.PROCESSING
        stage_title = "Packed"
        stage_msg = "Item packed & quality checked at fulfillment warehouse"
    elif new_status_raw in ["CONFIRMED"]:
        order.status = OrderStatus.PROCESSING
        stage_title = "Order Confirmed"
        stage_msg = "Order accepted & confirmed by merchant"
    elif new_status_raw in ["PROCESSING", "PAID"]:
        order.status = OrderStatus.PROCESSING
        stage_title = "Processing"
        stage_msg = "Order being processed at central warehouse"
    elif new_status_raw in ["CANCELLED", "CANCELED"]:
        order.status = OrderStatus.CANCELLED
        stage_title = "Cancelled"
        stage_msg = "Order cancelled"
    elif new_status_raw in ["RETURNS", "RETURNED", "RETURN_REQUESTED"]:
        order.status = OrderStatus.RETURNED
        stage_title = "Returned"
        stage_msg = "Return requested by customer"
    elif new_status_raw in ["PENDING", "PENDING_PAYMENT"]:
        order.status = OrderStatus.PENDING_PAYMENT
        stage_title = "Order Placed"
        stage_msg = "Order placed, awaiting payment confirmation"
    else:
        order.status = OrderStatus.DELIVERED if "DELIVER" in new_status_raw else OrderStatus.PROCESSING
        stage_title = "Processing"
        stage_msg = f"Status updated to {new_status_raw}"

    # Insert status history record into PostgreSQL database
    hist = OrderStatusHistory(
        order_id=order.id,
        status=stage_title,
        message=stage_msg,
        updated_by="Admin",
        created_at=datetime.utcnow()
    )
    db.add(hist)

    await db.commit()
    await db.refresh(order)

    return {
        "status": "success",
        "order_id": order.id,
        "order_number": order.order_number,
        "new_status": order.status.value if hasattr(order.status, 'value') else str(order.status),
        "history_status": stage_title,
        "message": f"Order #{order.order_number} status updated to '{stage_title}' in PostgreSQL DB"
    }


@router.post("", status_code=201)
@router.post("/", status_code=201)
async def create_order_direct(
    payload: dict = Body(...),
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Directly insert a completed order into PostgreSQL DB from Checkout / Razorpay / COD.
    Ensures 100% real-time synchronization with Admin Orders Panel & Customer History.
    """
    order_number = payload.get("order_number") or f"SKIPD-{random.randint(100000, 999999)}"
    
    # Ensure unique order_number
    existing = await db.execute(select(Order).where(Order.order_number == order_number))
    if existing.scalars().first():
        order_number = f"SKIPD-{random.randint(100000, 999999)}"

    shipping_addr = payload.get("shipping_address") or {}
    cust_name = shipping_addr.get("name") or payload.get("customer_name") or (current_user.full_name if current_user else "Customer")
    cust_email = (current_user.email if current_user else None) or payload.get("customer_email") or shipping_addr.get("email") or "customer@skipd.in"
    cust_phone = shipping_addr.get("phone") or payload.get("customer_phone") or (current_user.phone if current_user else "9876543210")

    status_str = str(payload.get("status") or "PAID").upper()
    order_status = OrderStatus.PAID
    if status_str in ["PENDING_PAYMENT", "PENDING"]:
        order_status = OrderStatus.PENDING_PAYMENT
    elif status_str in ["SHIPPED", "PACKED", "PROCESSING"]:
        order_status = OrderStatus.PROCESSING
    elif status_str == "DELIVERED":
        order_status = OrderStatus.DELIVERED
    elif status_str == "CANCELLED":
        order_status = OrderStatus.CANCELLED

    total_amount = float(payload.get("total_amount") or 0.0)

    # Build order items
    items_raw = payload.get("items") or []
    order_items = []
    items_summary = []

    for item in items_raw:
        prod_id = item.get("product_id") or item.get("id")
        qty = int(item.get("quantity") or item.get("qty") or 1)
        price = float(item.get("price") or item.get("unit_price") or 0)
        title = item.get("title") or item.get("name") or item.get("product_name")

        if prod_id and (price == 0 or not title):
            try:
                prod_res = await db.execute(select(Product).where(Product.id == int(prod_id)))
                p = prod_res.scalars().first()
                if p:
                    if not title:
                        title = p.title
                    if price == 0:
                        price = float(p.price or 0)
                    p.stock_quantity = max(0, (p.stock_quantity or 10) - qty)
            except Exception:
                pass

        if not title:
            title = "Minimalist Graphic Tee"
        if price == 0:
            price = 1299.0

        item_total = price * qty
        if total_amount == 0:
            total_amount += item_total

        order_items.append(OrderItem(
            product_id=int(prod_id) if (prod_id and str(prod_id).isdigit()) else 1,
            variant_id=item.get("variant_id"),
            product_name=title,
            quantity=qty,
            unit_price=price
        ))

        items_summary.append({
            "title": title,
            "quantity": qty,
            "unit_price": price,
            "total_price": item_total
        })

    new_order = Order(
        order_number=order_number,
        user_id=current_user.id if current_user else None,
        customer_email=cust_email,
        customer_name=cust_name,
        customer_phone=cust_phone,
        shipping_address=shipping_addr,
        total_amount=total_amount,
        currency="INR",
        status=order_status,
        razorpay_order_id=payload.get("razorpay_order_id") or payload.get("razorpay_payment_id"),
        items=order_items
    )

    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)

    # Insert initial order status history timestamps
    h1 = OrderStatusHistory(
        order_id=new_order.id,
        status="Order Placed",
        message="Order placed successfully by customer",
        updated_by="System",
        created_at=new_order.created_at
    )
    db.add(h1)

    if order_status in [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED]:
        h2 = OrderStatusHistory(
            order_id=new_order.id,
            status="Order Confirmed",
            message="Order accepted & payment verified",
            updated_by="System",
            created_at=new_order.created_at
        )
        db.add(h2)

    await db.commit()

    # Trigger Order Confirmation Email
    pm = payload.get("payment_method") or "Razorpay / Online"
    if background_tasks:
        background_tasks.add_task(
            send_order_confirmation_email,
            to_email=new_order.customer_email,
            order_number=new_order.order_number,
            total_amount=new_order.total_amount,
            customer_name=new_order.customer_name,
            order_items=items_summary,
            shipping_address=new_order.shipping_address,
            payment_method=pm
        )
    else:
        try:
            send_order_confirmation_email(
                to_email=new_order.customer_email,
                order_number=new_order.order_number,
                total_amount=new_order.total_amount,
                customer_name=new_order.customer_name,
                order_items=items_summary,
                shipping_address=new_order.shipping_address,
                payment_method=pm
            )
        except Exception as e:
            print(f"[ORDER EMAIL WARN] {e}")

    return {
        "status": "success",
        "id": new_order.id,
        "order_number": new_order.order_number,
        "total_amount": new_order.total_amount,
        "customer_name": new_order.customer_name,
        "customer_email": new_order.customer_email,
        "message": "Order created & synced into PostgreSQL database successfully!"
    }


@router.post("/checkout", response_model=OrderResponse)
async def create_checkout(
    data: CheckoutInput,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not data.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_number = f"SKIPD-{random.randint(100000, 999999)}"
    total_amount = 0.0
    order_items = []
    items_summary = []

    for item in data.items:
        prod_res = await db.execute(select(Product).where(Product.id == item.product_id))
        product = prod_res.scalars().first()
        if not product:
            continue
        
        # 🔒 ATOMIC INVENTORY CONCURRENCY RESERVATION
        if item.variant_id:
            stock_stmt = (
                update(ProductVariant)
                .where(
                    ProductVariant.id == item.variant_id,
                    ProductVariant.stock_quantity >= item.quantity
                )
                .values(stock_quantity=ProductVariant.stock_quantity - item.quantity)
            )
            stock_res = await db.execute(stock_stmt)
            if stock_res.rowcount == 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Item '{product.title}' is out of stock or insufficient quantity available!"
                )
        else:
            stock_stmt = (
                update(Product)
                .where(
                    Product.id == item.product_id,
                    Product.stock_quantity >= item.quantity
                )
                .values(stock_quantity=Product.stock_quantity - item.quantity)
            )
            stock_res = await db.execute(stock_stmt)
            if stock_res.rowcount == 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Item '{product.title}' is out of stock or insufficient quantity available!"
                )

        unit_price = product.price
        item_total = unit_price * item.quantity
        total_amount += item_total

        order_items.append(OrderItem(
            product_id=product.id,
            variant_id=item.variant_id,
            product_name=product.title,
            quantity=item.quantity,
            unit_price=unit_price
        ))

        items_summary.append({
            "title": product.title,
            "quantity": item.quantity,
            "unit_price": unit_price,
            "total_price": item_total
        })

    wallet_used = 0.0
    if data.use_wallet and current_user:
        wallet_res = await db.execute(select(Wallet).where(Wallet.user_id == current_user.id))
        wallet = wallet_res.scalars().first()
        if wallet and wallet.balance > 0:
            wallet_used = min(wallet.balance, total_amount)
            wallet.balance -= wallet_used
            total_amount -= wallet_used
            
            w_txn = WalletTransaction(
                wallet_id=wallet.id,
                amount=-wallet_used,
                transaction_type="ORDER_PAYMENT",
                reference_id=order_number
            )
            db.add(w_txn)

    if total_amount > 0:
        rzp_order = razorpay_svc.create_order(
            amount_in_rupees=total_amount,
            order_receipt_id=order_number
        )
        rzp_order_id = rzp_order["id"]
        status = OrderStatus.PENDING_PAYMENT
    else:
        rzp_order_id = None
        status = OrderStatus.PAID

    c_email = data.customer_email or (current_user.email if current_user else "customer@skipd.in")
    c_name = data.customer_name or (current_user.full_name if current_user else "Customer")
    c_phone = data.customer_phone or (current_user.phone if current_user else "9876543210")

    new_order = Order(
        order_number=order_number,
        user_id=current_user.id if current_user else None,
        customer_email=c_email,
        customer_name=c_name,
        customer_phone=c_phone,
        shipping_address=data.shipping_address.dict(),
        total_amount=total_amount,
        currency="INR",
        status=status,
        razorpay_order_id=rzp_order_id,
        items=order_items
    )

    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)

    # Insert initial order status history timestamps
    h1 = OrderStatusHistory(
        order_id=new_order.id,
        status="Order Placed",
        message="Order placed successfully by customer",
        updated_by="System",
        created_at=new_order.created_at
    )
    db.add(h1)

    if status == OrderStatus.PAID:
        h2 = OrderStatusHistory(
            order_id=new_order.id,
            status="Order Confirmed",
            message="Order accepted & payment verified",
            updated_by="System",
            created_at=new_order.created_at
        )
        db.add(h2)

    await db.commit()

    background_tasks.add_task(
        send_order_confirmation_email,
        to_email=new_order.customer_email,
        order_number=new_order.order_number,
        total_amount=new_order.total_amount,
        customer_name=new_order.customer_name,
        order_items=items_summary,
        shipping_address=new_order.shipping_address,
        payment_method="UPI / Razorpay / COD"
    )

    return new_order

@router.get("", response_model=List[OrderResponse])
@router.get("/", response_model=List[OrderResponse])
async def list_user_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not current_user:
        return []
    query = select(Order).options(selectinload(Order.items)).where(Order.user_id == current_user.id).order_by(Order.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    orders = result.scalars().all()
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_by_id(
    order_id: str,
    db: AsyncSession = Depends(get_db)
):
    query = select(Order).options(selectinload(Order.items))
    if order_id.isdigit():
        query = query.where(Order.id == int(order_id))
    else:
        query = query.where(Order.order_number == order_id)
        
    result = await db.execute(query)
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/{order_id}/return")
async def request_return(
    order_id: int,
    data: ReturnRequestInput,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Order).where(Order.id == order_id, Order.user_id == current_user.id)
    result = await db.execute(query)
    order = result.scalars().first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status not in [OrderStatus.DELIVERED]:
        raise HTTPException(status_code=400, detail="Only delivered orders can be returned")
    
    return_req = ReturnRequest(
        order_id=order.id,
        user_id=current_user.id,
        reason=data.reason,
        status=ReturnStatus.PENDING,
        refund_amount=order.total_amount
    )
    order.status = OrderStatus.RETURN_REQUESTED
    
    db.add(return_req)
    await db.commit()
    
    return {"message": "Return requested successfully"}


@router.get("/track/{order_identifier}")
async def track_order_timeline(
    order_identifier: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get 100% real-time tracking timeline & status history from PostgreSQL DB.
    Supports Order Number (#SKIPD-123456, SKIPD-123456, WH1025), Order ID, or AWB Code.
    """
    raw_str = order_identifier.strip()
    clean_id = raw_str.replace("#", "").replace("SR-AWB-", "").replace("AWB-", "").strip()

    all_res = await db.execute(select(Order).options(selectinload(Order.status_history), selectinload(Order.items)))
    all_orders = all_res.scalars().all()

    order = None
    raw_lower = raw_str.lower()
    clean_lower = clean_id.lower()
    digits = "".join([c for c in raw_str if c.isdigit()])

    for o in all_orders:
        o_num_lower = o.order_number.lower()
        o_num_digits = "".join([c for c in o.order_number if c.isdigit()])

        if (
            raw_lower == o_num_lower or
            clean_lower == o_num_lower or
            str(o.id) == clean_id or
            (clean_lower and clean_lower in o_num_lower) or
            (o_num_lower and o_num_lower in raw_lower) or
            (digits and len(digits) >= 4 and digits == o_num_digits) or
            (digits and str(o.id) == digits)
        ):
            order = o
            break

    if not order:
        raise HTTPException(status_code=404, detail=f"No active order found matching '{order_identifier}'")

    history_records = list(order.status_history) if order.status_history else []
    if not history_records:
        base_h1 = OrderStatusHistory(
            order_id=order.id,
            status="Order Placed",
            message="Order placed successfully by customer",
            updated_by="System",
            created_at=order.created_at
        )
        db.add(base_h1)
        history_records.append(base_h1)
        
        current_st = str(order.status.value if hasattr(order.status, 'value') else order.status).upper()
        if current_st in ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"]:
            base_h2 = OrderStatusHistory(
                order_id=order.id,
                status="Order Confirmed",
                message="Order accepted & payment verified",
                updated_by="System",
                created_at=order.created_at
            )
            db.add(base_h2)
            history_records.append(base_h2)

        if current_st in ["PROCESSING", "SHIPPED", "DELIVERED"]:
            base_h3 = OrderStatusHistory(
                order_id=order.id,
                status="Processing",
                message="Order being processed at central warehouse",
                updated_by="Admin",
                created_at=order.created_at
            )
            db.add(base_h3)
            history_records.append(base_h3)

        if current_st in ["SHIPPED", "DELIVERED"]:
            base_h4 = OrderStatusHistory(
                order_id=order.id,
                status="Dispatched",
                message="Handed over to courier partner",
                updated_by="Admin",
                created_at=order.created_at
            )
            db.add(base_h4)
            history_records.append(base_h4)

        if current_st == "DELIVERED":
            base_h5 = OrderStatusHistory(
                order_id=order.id,
                status="Delivered",
                message="Package successfully delivered to customer",
                updated_by="Admin",
                created_at=order.created_at
            )
            db.add(base_h5)
            history_records.append(base_h5)

        await db.commit()

    all_stages = [
        {"title": "Order Placed", "status": "Order Placed", "default_msg": "Order placed successfully"},
        {"title": "Order Confirmed", "status": "Order Confirmed", "default_msg": "Order accepted & payment verified"},
        {"title": "Processing", "status": "Processing", "default_msg": "Under processing at warehouse"},
        {"title": "Packed", "status": "Packed", "default_msg": "Package packed & quality checked"},
        {"title": "Dispatched", "status": "Dispatched", "default_msg": "Dispatched via logistics partner"},
        {"title": "Out for Delivery", "status": "Out for Delivery", "default_msg": "Out for delivery with executive"},
        {"title": "Delivered", "status": "Delivered", "default_msg": "Package delivered to customer"}
    ]

    current_status_str = str(order.status.value if hasattr(order.status, 'value') else order.status).upper()
    
    history_map = {}
    for h in history_records:
        norm_key = h.status.lower().strip()
        history_map[norm_key] = h

    last_completed_idx = 0
    for idx, stage in enumerate(all_stages):
        stage_norm = stage["status"].lower()
        matched = False
        for k in history_map.keys():
            if stage_norm in k or k in stage_norm or (stage_norm == "dispatched" and "shipped" in k):
                matched = True
                break
        if matched:
            last_completed_idx = idx

    if current_status_str == "DELIVERED":
        last_completed_idx = 6

    offsets = [
        timedelta(minutes=0),     # Order Placed
        timedelta(minutes=5),     # Order Confirmed
        timedelta(hours=2),       # Processing
        timedelta(hours=6),       # Packed
        timedelta(hours=18),      # Dispatched
        timedelta(hours=26),      # Out for Delivery
        timedelta(hours=30)       # Delivered
    ]

    base_ist = to_ist_datetime(order.created_at)

    timeline = []
    for idx, stage in enumerate(all_stages):
        stage_norm = stage["status"].lower()
        matched_history = None
        for k, h_obj in history_map.items():
            if stage_norm in k or k in stage_norm or (stage_norm == "dispatched" and "shipped" in k):
                matched_history = h_obj
                break

        is_done = idx <= last_completed_idx
        is_current = (idx == last_completed_idx) and (current_status_str != "DELIVERED" or idx == 6)

        if matched_history:
            formatted_date = format_ist(matched_history.created_at)
            msg = matched_history.message or stage["default_msg"]
            updated_by = matched_history.updated_by
            ts_iso = to_ist_datetime(matched_history.created_at).isoformat()
        else:
            exp_dt = base_ist + offsets[idx]
            exp_str = exp_dt.strftime("%d %b %Y at %I:%M %p").lower()
            formatted_date = f"Expected {exp_str}"
            ts_iso = exp_dt.isoformat()

            if is_done:
                formatted_date = format_ist(order.created_at)
                msg = stage["default_msg"]
                updated_by = "System"
            elif idx == last_completed_idx + 1:
                msg = "Estimated next milestone"
                updated_by = "Logistics"
            else:
                msg = "Pending milestone"
                updated_by = "Logistics"

        timeline.append({
            "stage_index": idx,
            "title": stage["title"],
            "status": stage["status"],
            "message": msg,
            "date": formatted_date,
            "timestamp": ts_iso,
            "updated_by": updated_by if matched_history else "System",
            "is_done": is_done,
            "is_current": is_current
        })

    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "total_amount": order.total_amount,
        "status": current_status_str,
        "created_at": format_ist(order.created_at),
        "created_at_iso": base_ist.isoformat(),
        "shipping_address": order.shipping_address,
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": item.unit_price
            } for item in order.items
        ],
        "timeline": timeline
    }
