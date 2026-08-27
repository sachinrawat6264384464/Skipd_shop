from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User, UserRole

from app.core.firebase import verify_firebase_id_token
from app.services.email_service import send_welcome_account_email

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None

    email: Optional[str] = None
    full_name: str = "User"
    firebase_uid: Optional[str] = None

    # 1. Try verifying Firebase JWT Token
    firebase_payload = verify_firebase_id_token(token)
    if firebase_payload:
        email = firebase_payload.get("email")
        firebase_uid = firebase_payload.get("uid")
        full_name = firebase_payload.get("name") or (email.split("@")[0] if email else "User")
    else:
        # 2. Fallback to standard FastAPI JWT Token
        email = decode_access_token(token)

    # 3. Fallback for demo/fallback tokens format or direct email tokens
    if not email:
        if "@" in token:
            email = token.strip().lower()
        else:
            import re
            emails = re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', token)
            if emails:
                email = emails[0].lower()

    if not email:
        return None
    
    # 3. Query & Map user in PostgreSQL database
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    # 4. Auto-provision new Firebase user into PostgreSQL if not exists
    if not user:
        try:
            user = User(
                firebase_uid=firebase_uid,
                full_name=full_name,
                email=email,
                hashed_password="firebase_auth_user",
                role=UserRole.CUSTOMER
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

            try:
                send_welcome_account_email(
                    to_email=user.email,
                    full_name=user.full_name,
                    raw_password="Set via Account Settings"
                )
            except Exception:
                pass
        except Exception as e:
            print(f"[USER SYNC WARN] Could not auto-create user in PostgreSQL: {e}")
            await db.rollback()
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalars().first()
    else:
        # Update firebase_uid if missing
        if firebase_uid and not user.firebase_uid:
            user.firebase_uid = firebase_uid
            db.add(user)
            await db.commit()
            await db.refresh(user)

    return user

async def get_current_admin(
    current_user: Optional[User] = Depends(get_current_user)
) -> User:
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return current_user
