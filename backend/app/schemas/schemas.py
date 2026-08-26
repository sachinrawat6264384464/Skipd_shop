from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator

# User Schemas
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class FirebaseSyncInput(BaseModel):
    firebase_uid: str
    email: EmailStr
    full_name: Optional[str] = "Customer"
    phone: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str
    user_role: str
    email: str

class UserProfile(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    role: str

# Catalog Schemas
class CategorySchema(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = "📁"
    status: Optional[str] = "Active"

    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = "📁"
    status: Optional[str] = "Active"

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None
    status: Optional[str] = None

class VariantSchema(BaseModel):
    id: int
    title: str
    sku: str
    price: float
    stock_quantity: int

    class Config:
        from_attributes = True

class ProductSchema(BaseModel):
    id: int
    title: str
    handle: str
    description: Optional[str] = None
    price: float
    compare_at_price: Optional[float] = None
    featured: bool = False
    images: Optional[Any] = []
    tags: Optional[Any] = []
    stock_quantity: Optional[int] = 100
    category: Optional[CategorySchema] = None
    variants: Optional[List[VariantSchema]] = []

    @field_validator("images", mode="before")
    @classmethod
    def parse_images(cls, v):
        if v is None:
            return []
        if isinstance(v, str):
            if v.startswith("["):
                try:
                    import json
                    return json.loads(v)
                except Exception:
                    pass
            return [v]
        if isinstance(v, list):
            return [str(item) for item in v if item]
        return []

    @field_validator("tags", mode="before")
    @classmethod
    def parse_tags(cls, v):
        if v is None:
            return []
        if isinstance(v, str):
            if v.startswith("["):
                try:
                    import json
                    return json.loads(v)
                except Exception:
                    pass
            return [v]
        if isinstance(v, list):
            return [str(item) for item in v if item]
        return []

    class Config:
        from_attributes = True

# Checkout & Order Schemas
class ShippingAddress(BaseModel):
    first_name: str
    last_name: str
    address1: str
    address2: Optional[str] = None
    city: str
    state: str
    zip: str
    country: str = "India"
    phone: str

class CartItemInput(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int

class CheckoutInput(BaseModel):
    items: List[CartItemInput]
    shipping_address: ShippingAddress
    customer_email: EmailStr
    customer_name: str
    customer_phone: str
    use_wallet: bool = False

class OrderItemSchema(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    product_image: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_email: str
    total_amount: float
    currency: str
    status: str
    razorpay_order_id: Optional[str] = None
    created_at: datetime
    items: List[OrderItemSchema] = []

    class Config:
        from_attributes = True

# Payment Verification Schema
class PaymentVerifyInput(BaseModel):
    order_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

# Live Tracking Schema
class TrackingTimelineItem(BaseModel):
    status: str
    location: str
    timestamp: str
    completed: bool

class TrackingResponse(BaseModel):
    order_number: str
    awb_code: str
    courier_name: str
    current_status: str
    estimated_delivery: str
    timeline: List[TrackingTimelineItem]

# Wallet Schemas
class WalletTransactionResponse(BaseModel):
    id: int
    amount: float
    transaction_type: str
    reference_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class WalletResponse(BaseModel):
    balance: float
    transactions: List[WalletTransactionResponse] = []

    class Config:
        from_attributes = True

# Return Request Schemas
class ReturnRequestInput(BaseModel):
    reason: str

class ReturnRequestResponse(BaseModel):
    id: int
    order_id: int
    reason: str
    status: str
    refund_amount: float
    admin_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
