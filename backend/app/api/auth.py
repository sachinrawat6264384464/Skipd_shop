import time
import random
from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import User, UserRole
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserProfile
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory OTP storage with 60-second expiration (NOT stored in DB)
# Structure: { email_or_phone: { "otp": "123456", "expires_at": timestamp } }
OTP_CACHE: Dict[str, dict] = {}


from app.services.email_service import send_otp_email

@router.post("/request-otp")
async def request_otp(payload: dict = Body(...), db: AsyncSession = Depends(get_db)):
    """Generate 6-digit OTP valid for 60 seconds (stored in-memory only)."""
    email_or_phone = payload.get("email_or_phone", "").strip().lower()
    if not email_or_phone:
        raise HTTPException(status_code=400, detail="Email or Mobile number is required")

    # Generate 6-digit random OTP
    otp_code = str(random.randint(100000, 999999))
    expires_at = time.time() + 60  # 60 seconds (1 minute)

    # Save to in-memory OTP cache
    OTP_CACHE[email_or_phone] = {
        "otp": otp_code,
        "expires_at": expires_at
    }

    print(f"🔥 [OTP GENERATED] Email/Phone: {email_or_phone} | OTP: {otp_code} | Expires in: 60s")

    # Send HTML OTP Email Flow
    if "@" in email_or_phone:
        send_otp_email(email_or_phone, otp_code)

    return {
        "status": "success",
        "message": f"6-digit OTP sent to {email_or_phone}",
        "expires_in_seconds": 60,
        "otp_demo": otp_code  # Exposed for instant UI testing/auto-fill
    }


@router.post("/verify-otp")
async def verify_otp(payload: dict = Body(...), db: AsyncSession = Depends(get_db)):
    """Verify 6-digit OTP. On successful match, OTP is permanently deleted immediately!"""
    email_or_phone = payload.get("email_or_phone", "").strip().lower()
    user_otp = payload.get("otp", "").strip()

    if not email_or_phone or not user_otp:
        raise HTTPException(status_code=400, detail="Email/Phone and OTP code are required")

    cached_data = OTP_CACHE.get(email_or_phone)
    if not cached_data:
        raise HTTPException(status_code=400, detail="No active OTP found. Please request a new OTP.")

    # Check 1-minute expiration
    if time.time() > cached_data["expires_at"]:
        del OTP_CACHE[email_or_phone]
        raise HTTPException(status_code=400, detail="OTP expired after 1 minute. Click Resend OTP.")

    # Verify match
    if cached_data["otp"] != user_otp:
        raise HTTPException(status_code=400, detail="Incorrect 6-digit OTP code")

    # 🔒 Match successful! Immediately & permanently delete OTP from memory
    del OTP_CACHE[email_or_phone]
    print(f"✅ [OTP VERIFIED & DELETED] {email_or_phone} verified successfully!")

    # Check if user exists or create default customer
    result = await db.execute(select(User).where(User.email == email_or_phone))
    user = result.scalars().first()

    if not user:
        # Create fresh user for this email
        display_name = email_or_phone.split("@")[0].replace(".", " ").title() if "@" in email_or_phone else "Sachin Rawat"
        user = User(
            full_name=display_name,
            email=email_or_phone if "@" in email_or_phone else f"{email_or_phone}@skipd.in",
            phone=email_or_phone if not "@" in email_or_phone else "9876543210",
            hashed_password=get_password_hash("defaultpass123"),
            role=UserRole.CUSTOMER
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token(subject=user.email)
    return {
        "access_token": token,
        "user_name": user.full_name,
        "user_role": user.role.value,
        "email": user.email,
        "phone": user.phone or "9876543210",
        "can_change_password": True,
        "message": "OTP verified successfully! Logged in."
    }


@router.post("/change-password")
async def change_password(payload: dict = Body(...), db: AsyncSession = Depends(get_db)):
    """Allow logged in user to update their account password."""
    email = payload.get("email", "").strip().lower()
    new_password = payload.get("new_password", "").strip()

    if not email or not new_password or len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")

    user.hashed_password = get_password_hash(new_password)
    await db.commit()
    return {"status": "success", "message": "Password updated successfully!"}


@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    hashed_pwd = get_password_hash(data.password)
    new_user = User(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        hashed_password=hashed_pwd,
        role=UserRole.CUSTOMER
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token(subject=new_user.email)
    return TokenResponse(
        access_token=token,
        user_name=new_user.full_name,
        user_role=new_user.role.value,
        email=new_user.email
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(subject=user.email)
    return TokenResponse(
        access_token=token,
        user_name=user.full_name,
        user_role=user.role.value,
        email=user.email
    )


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return UserProfile(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        role=current_user.role.value
    )
