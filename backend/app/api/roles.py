from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json

from app.core.database import get_db
from app.models.models import Role, StaffUser

router = APIRouter(prefix="", tags=["Roles & Staff Management"])

ALL_SIDEBAR_MODULES = [
    "dashboard", "analytics", "orders", "products", "inventory", 
    "customers", "payments", "delivery", "sales", "engagement", 
    "homepage", "tickets", "queries", "users", "settings", "logs"
]

DEFAULT_ROLES = [
    {
        "name": "Super Admin",
        "slug": "super_admin",
        "description": "Full unrestricted access control across all admin modules & system settings",
        "permissions": ALL_SIDEBAR_MODULES,
        "is_system": True
    },
    {
        "name": "Store Manager",
        "slug": "store_manager",
        "description": "Manage catalog products, stock levels, orders, shipments and customer accounts",
        "permissions": ["analytics", "orders", "products", "inventory", "customers", "payments", "delivery"],
        "is_system": True
    },
    {
        "name": "Logistics Manager",
        "slug": "logistics_manager",
        "description": "Focus on shipments, inventory dispatch, courier tracking and return queries",
        "permissions": ["orders", "inventory", "delivery", "queries"],
        "is_system": True
    },
    {
        "name": "Support Executive",
        "slug": "support_executive",
        "description": "Handle customer queries, support tickets, reviews and account requests",
        "permissions": ["customers", "tickets", "queries"],
        "is_system": True
    },
    {
        "name": "Marketing Specialist",
        "slug": "marketing_specialist",
        "description": "Oversee sales events, marketing campaigns, customer engagement and CMS banners",
        "permissions": ["analytics", "sales", "engagement", "homepage"],
        "is_system": True
    },
    {
        "name": "Custom Access Role",
        "slug": "custom_role",
        "description": "Tailored permission preset for specialized staff responsibilities",
        "permissions": ["orders", "products"],
        "is_system": False
    }
]

# Pydantic Schemas
class RoleCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    permissions: List[str] = []

class StaffUserCreate(BaseModel):
    name: str
    email: str
    password: Optional[str] = "• • • • • • • •"
    role: str = "Store Manager"
    role_id: Optional[int] = None
    status: str = "Active"
    avatar: Optional[str] = None
    permissions: List[str] = []

class StaffUserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    role_id: Optional[int] = None
    status: Optional[str] = None
    avatar: Optional[str] = None
    permissions: Optional[List[str]] = None

def seed_default_roles_if_empty(db: Session):
    role_count = db.query(Role).count()
    if role_count == 0:
        for r_data in DEFAULT_ROLES:
            role = Role(
                name=r_data["name"],
                slug=r_data["slug"],
                description=r_data["description"],
                permissions=r_data["permissions"],
                is_system=r_data["is_system"]
            )
            db.add(role)
        db.commit()

def seed_default_staff_if_empty(db: Session):
    staff_count = db.query(StaffUser).count()
    if staff_count == 0:
        super_admin_role = db.query(Role).filter(Role.slug == "super_admin").first()
        staff = StaffUser(
            name="Sachin Rawat",
            email="admin@skipd.com",
            password_hash="admin123",
            role="Super Admin",
            role_id=super_admin_role.id if super_admin_role else None,
            status="Active",
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
            last_active="Just now (Online)",
            permissions=ALL_SIDEBAR_MODULES
        )
        db.add(staff)
        db.commit()

@router.get("/roles")
def get_all_roles(db: Session = Depends(get_db)):
    seed_default_roles_if_empty(db)
    roles = db.query(Role).order_by(Role.id.asc()).all()
    return roles

@router.post("/roles", status_code=status.HTTP_201_CREATED)
def create_role(role_in: RoleCreate, db: Session = Depends(get_db)):
    slug = role_in.slug or role_in.name.lower().replace(" ", "_").replace("-", "_")
    existing = db.query(Role).filter(Role.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Role with this name/slug already exists")
    
    role = Role(
        name=role_in.name,
        slug=slug,
        description=role_in.description or f"Custom role for {role_in.name}",
        permissions=role_in.permissions,
        is_system=False
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

@router.put("/roles/{role_id}")
def update_role(role_id: int, role_in: RoleCreate, db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    role.name = role_in.name
    if role_in.description:
        role.description = role_in.description
    role.permissions = role_in.permissions
    db.commit()
    db.refresh(role)
    return role

@router.delete("/roles/{role_id}")
def delete_role(role_id: int, db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    if role.is_system:
        raise HTTPException(status_code=400, detail="Cannot delete default system roles")
    
    db.delete(role)
    db.commit()
    return {"message": f"Role '{role.name}' deleted successfully"}

@router.get("/staff")
def get_all_staff(db: Session = Depends(get_db)):
    seed_default_roles_if_empty(db)
    seed_default_staff_if_empty(db)
    staff_list = db.query(StaffUser).order_by(StaffUser.id.desc()).all()
    return staff_list

@router.post("/staff", status_code=status.HTTP_201_CREATED)
def create_staff_user(staff_in: StaffUserCreate, db: Session = Depends(get_db)):
    existing = db.query(StaffUser).filter(StaffUser.email == staff_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Staff user with email '{staff_in.email}' already exists")
    
    role_obj = db.query(Role).filter(Role.name == staff_in.role).first()
    avatar_url = staff_in.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={staff_in.name}"
    
    staff = StaffUser(
        name=staff_in.name,
        email=staff_in.email,
        password_hash=staff_in.password or "staff123",
        role=staff_in.role,
        role_id=role_obj.id if role_obj else None,
        status=staff_in.status,
        avatar=avatar_url,
        last_active="Just added",
        permissions=staff_in.permissions
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff

@router.put("/staff/{staff_id}")
def update_staff_user(staff_id: int, staff_in: StaffUserUpdate, db: Session = Depends(get_db)):
    staff = db.query(StaffUser).filter(StaffUser.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff user not found")
    
    if staff_in.name is not None:
        staff.name = staff_in.name
    if staff_in.email is not None:
        staff.email = staff_in.email
    if staff_in.role is not None:
        staff.role = staff_in.role
        role_obj = db.query(Role).filter(Role.name == staff_in.role).first()
        if role_obj:
            staff.role_id = role_obj.id
    if staff_in.status is not None:
        staff.status = staff_in.status
    if staff_in.permissions is not None:
        staff.permissions = staff_in.permissions
    if staff_in.avatar is not None:
        staff.avatar = staff_in.avatar
        
    db.commit()
    db.refresh(staff)
    return staff

@router.delete("/staff/{staff_id}")
def delete_staff_user(staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(StaffUser).filter(StaffUser.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff user not found")
    if staff.role == "Super Admin":
        raise HTTPException(status_code=400, detail="Super Admin staff user cannot be deleted")
        
    db.delete(staff)
    db.commit()
    return {"message": f"Staff user '{staff.name}' deleted successfully"}
