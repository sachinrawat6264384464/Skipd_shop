import time
import random
from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import User, UserRole
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserProfile, FirebaseSyncInput
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/firebase-sync")
async def firebase_sync(payload: FirebaseSyncInput, db: AsyncSession = Depends(get_db)):
    """Synchronize Firebase authenticated user into PostgreSQL users database table linked by firebase_uid."""
    email_clean = payload.email.strip().lower()
    
    # Check if user already exists by firebase_uid or email
    result = await db.execute(select(User).where((User.firebase_uid == payload.firebase_uid) | (User.email == email_clean)))
    user = result.scalars().first()

    if not user:
        # Create fresh customer user row in PostgreSQL database linked to firebase_uid
        display_name = payload.full_name.strip() if payload.full_name and payload.full_name.strip() else email_clean.split("@")[0].replace(".", " ").title()
        user = User(
            firebase_uid=payload.firebase_uid,
            full_name=display_name,
            email=email_clean,
            phone=payload.phone,
            hashed_password=get_password_hash("firebase_oauth_user_secret"),
            role=UserRole.CUSTOMER
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # ✉️ Send Welcome HTML Email containing account credentials & welcome message
        try:
            send_welcome_account_email(
                to_email=user.email,
                full_name=user.full_name,
                raw_password="Set via Account Settings / OAuth"
            )
        except Exception as e:
            print(f"⚠️ [WELCOME EMAIL ERROR] {e}")
    else:
        # Update existing user record with firebase_uid / name / phone
        updated = False
        if not user.firebase_uid:
            user.firebase_uid = payload.firebase_uid
            updated = True
        if payload.full_name and payload.full_name.strip() and user.full_name != payload.full_name.strip():
            user.full_name = payload.full_name.strip()
            updated = True
        if payload.phone and not user.phone:
            user.phone = payload.phone
            updated = True
        
        if updated:
            await db.commit()
            await db.refresh(user)

    token = create_access_token(subject=user.email)
    return {
        "status": "success",
        "access_token": token,
        "id": user.id,
        "firebase_uid": user.firebase_uid,
        "user_name": user.full_name,
        "email": user.email,
        "phone": user.phone or "",
        "user_role": user.role.value if hasattr(user.role, 'value') else str(user.role),
        "message": "User synchronized with PostgreSQL database successfully"
    }

# In-memory OTP storage with 60-second expiration (NOT stored in DB)
# Structure: { email_or_phone: { "otp": "123456", "expires_at": timestamp } }
OTP_CACHE: Dict[str, dict] = {}


import asyncio

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

    # Send HTML OTP Email Asynchronously in background thread
    if "@" in email_or_phone:
        asyncio.create_task(asyncio.to_thread(send_otp_email, email_or_phone, otp_code))

    return {
        "status": "success",
        "message": f"6-digit OTP sent to {email_or_phone}",
        "expires_in_seconds": 60
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
            email=email_or_phone if "@" in email_or_phone else f"{email_or_phone}@e-com.in",
            phone=email_or_phone if not "@" in email_or_phone else "9876543210",
            hashed_password=get_password_hash("defaultpass123"),
            role=UserRole.CUSTOMER
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # ✉️ Send Welcome HTML Email containing account credentials & welcome message
        try:
            send_welcome_account_email(
                to_email=user.email,
                full_name=user.full_name,
                raw_password="Set via Account Settings / OTP"
            )
        except Exception as e:
            print(f"⚠️ [WELCOME EMAIL ERROR] {e}")

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


@router.post("/check-email")
async def check_email(payload: dict = Body(...), db: AsyncSession = Depends(get_db)):
    """Check if email or phone is registered in database for Forgot Password validation."""
    email = payload.get("email", "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email address is required")

    result = await db.execute(select(User).where((User.email == email) | (User.phone == email)))
    user = result.scalars().first()
    if not user:
        return {"exists": False, "message": "This email is not registered with us"}
    
    return {
        "exists": True,
        "email": user.email,
        "full_name": user.full_name,
        "message": "Registered Email Verified"
    }


@router.post("/reset-password")
async def reset_password(payload: dict = Body(...), db: AsyncSession = Depends(get_db)):
    """Reset forgotten password permanently in database."""
    email = payload.get("email", "").strip().lower()
    new_password = payload.get("new_password", "").strip()

    if not email or not new_password or len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

    result = await db.execute(select(User).where((User.email == email) | (User.phone == email)))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="This email is not registered with us")

    user.hashed_password = get_password_hash(new_password)
    await db.commit()
    return {"status": "success", "message": "Password changed successfully! Please login with your new password."}


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


from app.services.email_service import send_otp_email, send_welcome_account_email

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

    # ✉️ Send Welcome HTML Email containing login credentials & welcome message
    try:
        send_welcome_account_email(
            to_email=new_user.email,
            full_name=new_user.full_name,
            raw_password=data.password
        )
    except Exception as e:
        print(f"⚠️ [WELCOME EMAIL ERROR] {e}")

    token = create_access_token(subject=new_user.email)
    return TokenResponse(
        access_token=token,
        user_name=new_user.full_name,
        user_role=new_user.role.value,
        email=new_user.email
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    email_clean = data.email.strip().lower()
    
    # 🔑 Master Admin Credentials Override
    if email_clean in ["admin@e-com.in", "sachin@e-com.in", "admin@e-com.com"] and data.password in ["admin123", "admin", "e-com@2026"]:
        token = create_access_token(subject=email_clean)
        return TokenResponse(
            access_token=token,
            user_name="Sachin Rawat (Super Admin)",
            user_role="admin",
            email=email_clean
        )

    result = await db.execute(select(User).where(User.email == email_clean))
    user = result.scalars().first()
    if not user or not user.hashed_password or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(subject=user.email)
    return TokenResponse(
        access_token=token,
        user_name=user.full_name,
        user_role=user.role.value if hasattr(user.role, 'value') else str(user.role),
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
