import random
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import ProductQuery, QueryStatus, Product, Order, User
from app.api.deps import get_current_user

router = APIRouter(prefix="/queries", tags=["Product Queries & Customer Inquiries"])

@router.get("")
@router.get("/")
async def list_product_queries(
    status_filter: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Fetch all product queries and return requests from PostgreSQL DB."""
    # First check if product_queries table exists, if not auto-create
    try:
        await db.execute(text("SELECT 1 FROM product_queries LIMIT 1;"))
    except Exception:
        await db.rollback()
        # Auto-create product_queries table
        await db.execute(text("""
            CREATE TABLE IF NOT EXISTS product_queries (
                id SERIAL PRIMARY KEY,
                query_number VARCHAR(50) UNIQUE NOT NULL,
                user_id INTEGER REFERENCES users(id),
                customer_name VARCHAR(150) NOT NULL,
                customer_email VARCHAR(150) NOT NULL,
                product_id INTEGER REFERENCES products(id),
                product_name VARCHAR(255),
                order_id INTEGER REFERENCES orders(id),
                query_type VARCHAR(50) DEFAULT 'General Inquiry',
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                priority VARCHAR(20) DEFAULT 'High',
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        await db.commit()

    stmt = select(ProductQuery).order_by(ProductQuery.created_at.desc())
    if status_filter and status_filter.upper() != "ALL":
        stmt = stmt.where(ProductQuery.status == status_filter.upper())

    res = await db.execute(stmt)
    queries = res.scalars().all()

    output = []
    for q in queries:
        output.append({
            "id": q.id,
            "query_number": q.query_number,
            "user_id": q.user_id,
            "customer_name": q.customer_name,
            "customer_email": q.customer_email,
            "product_id": q.product_id,
            "product_name": q.product_name or "Store Item",
            "order_id": q.order_id,
            "query_type": q.query_type or "General Inquiry",
            "subject": q.subject,
            "message": q.message,
            "priority": q.priority or "High",
            "status": q.status.value if hasattr(q.status, "value") else str(q.status),
            "created_at": q.created_at.isoformat() if q.created_at else datetime.utcnow().isoformat()
        })

    return {
        "count": len(output),
        "total_queries": len(output),
        "pending_count": sum(1 for q in output if q["status"] == "PENDING"),
        "resolved_count": sum(1 for q in output if q["status"] == "RESOLVED"),
        "rejected_count": sum(1 for q in output if q["status"] == "REJECTED"),
        "queries": output
    }

@router.post("")
@router.post("/")
async def create_product_query(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Create a new product query / return request / customer inquiry in PostgreSQL DB."""
    # Ensure table exists
    try:
        await db.execute(text("SELECT 1 FROM product_queries LIMIT 1;"))
    except Exception:
        await db.rollback()
        await db.execute(text("""
            CREATE TABLE IF NOT EXISTS product_queries (
                id SERIAL PRIMARY KEY,
                query_number VARCHAR(50) UNIQUE NOT NULL,
                user_id INTEGER REFERENCES users(id),
                customer_name VARCHAR(150) NOT NULL,
                customer_email VARCHAR(150) NOT NULL,
                product_id INTEGER REFERENCES products(id),
                product_name VARCHAR(255),
                order_id INTEGER REFERENCES orders(id),
                query_type VARCHAR(50) DEFAULT 'General Inquiry',
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                priority VARCHAR(20) DEFAULT 'High',
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        await db.commit()

    query_num = f"#INQ-{random.randint(1000, 9999)}"
    existing = await db.execute(select(ProductQuery).where(ProductQuery.query_number == query_num))
    if existing.scalars().first():
        query_num = f"#INQ-{random.randint(1000, 9999)}"

    cust_name = payload.get("customer_name") or (current_user.full_name if current_user else "Customer")
    cust_email = payload.get("customer_email") or (current_user.email if current_user else "customer@skipd.in")
    
    prod_id = payload.get("product_id")
    prod_name = payload.get("product_name")

    if prod_id and not prod_name:
        p_res = await db.execute(select(Product).where(Product.id == int(prod_id)))
        p = p_res.scalars().first()
        if p:
            prod_name = p.title

    new_q = ProductQuery(
        query_number=query_num,
        user_id=current_user.id if current_user else payload.get("user_id"),
        customer_name=cust_name,
        customer_email=cust_email,
        product_id=int(prod_id) if prod_id and str(prod_id).isdigit() else None,
        product_name=prod_name or "General Store Item",
        order_id=payload.get("order_id"),
        query_type=payload.get("query_type") or "General Inquiry",
        subject=payload.get("subject") or "Customer Product Inquiry",
        message=payload.get("message") or "Customer submitted inquiry from storefront",
        priority=payload.get("priority") or "High",
        status=QueryStatus.PENDING
    )

    db.add(new_q)
    await db.commit()
    await db.refresh(new_q)

    return {
        "status": "success",
        "id": new_q.id,
        "query_number": new_q.query_number,
        "message": "Product query created & saved to PostgreSQL DB successfully!"
    }

@router.put("/{query_id}/status")
async def update_query_status(
    query_id: int,
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """Update status of a product query in PostgreSQL DB (RESOLVED, REJECTED, PENDING)."""
    res = await db.execute(select(ProductQuery).where(ProductQuery.id == query_id))
    q = res.scalars().first()
    if not q:
        # Check by query_number
        res2 = await db.execute(select(ProductQuery).where(ProductQuery.query_number == str(query_id)))
        q = res2.scalars().first()

    if not q:
        raise HTTPException(status_code=404, detail="Query not found")

    new_status = str(payload.get("status") or "RESOLVED").upper()
    if new_status == "RESOLVED":
        q.status = QueryStatus.RESOLVED
    elif new_status == "REJECTED":
        q.status = QueryStatus.REJECTED
    else:
        q.status = QueryStatus.PENDING

    await db.commit()
    await db.refresh(q)

    return {
        "status": "success",
        "id": q.id,
        "new_status": q.status.value if hasattr(q.status, "value") else str(q.status),
        "message": f"Query status updated to '{new_status}' in PostgreSQL DB"
    }

@router.delete("/{query_id}")
async def delete_query(
    query_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a product query from PostgreSQL DB."""
    res = await db.execute(select(ProductQuery).where(ProductQuery.id == query_id))
    q = res.scalars().first()
    if q:
        await db.delete(q)
        await db.commit()
    return {"status": "success", "message": "Query deleted successfully"}
