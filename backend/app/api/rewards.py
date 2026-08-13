from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/rewards", tags=["Rewards & Wallet"])

class ReferralInput(BaseModel):
    referral_code: str

@router.get("/wallet-balance")
async def get_wallet_balance():
    return {
        "user_id": 1,
        "wallet_balance_inr": 250.0,
        "skipd_coins": 500,
        "referral_code": "SKIPD-REF-9842"
    }

@router.post("/verify-referral")
async def verify_referral(data: ReferralInput):
    if data.referral_code.upper().startswith("SKIPD"):
        return {
            "valid": True,
            "discount_inr": 250.0,
            "message": "Referral code applied! You get ₹250 wallet bonus."
        }
    raise HTTPException(status_code=400, detail="Invalid referral code")
