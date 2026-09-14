import hashlib
import hmac
import os
import sys
from fastapi import APIRouter, HTTPException, Security, status
from fastapi.security import APIKeyHeader

MASTER_SALT = "SKIPD_COMMERCE_PROPRIETARY_MASTER_SALT_2026"

router = APIRouter(prefix="/license", tags=["Commercial License Security"])
api_key_header = APIKeyHeader(name="X-License-Key", auto_error=False)

def generate_valid_license_key(domain: str) -> str:
    """Generate a cryptographic license signature for a given client domain."""
    domain_clean = domain.strip().lower()
    raw_signature = hmac.new(
        MASTER_SALT.encode("utf-8"),
        domain_clean.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    return f"SKIPD-LIC-{raw_signature[:24].upper()}"

def verify_license_status():
    """
    Validates runtime license key and domain authorization.
    Prevents unauthorized modification or un-licensed distribution of backend code.
    """
    client_domain = os.getenv("CLIENT_DOMAIN", "localhost")
    env_license_key = os.getenv("LICENSE_KEY", "").strip()
    env_name = os.getenv("ENVIRONMENTS") or os.getenv("ENVIRONMENT") or "development"
    is_dev_mode = env_name.lower() == "development"
    allow_dev_override = os.getenv("ALLOW_UNLICENSED_DEV_MODE", "true").lower() == "true"

    expected_key = generate_valid_license_key(client_domain)

    if env_license_key == expected_key:
        return {
            "status": "VALID",
            "developer": "Sachin",
            "organization": "Botmartz AI Solution Pvt Ltd",
            "licensed_domain": client_domain,
            "license_type": "Commercial Single-Tenant License",
            "authorized": True
        }

    # In development mode, allow fallback if override is enabled
    if is_dev_mode and allow_dev_override:
        return {
            "status": "DEV_MODE_UNLICENSED",
            "developer": "Sachin Rawat",
            "organization": "Botmartz AI Solution Pvt Ltd",
            "licensed_domain": client_domain,
            "license_type": "Development Fallback Mode",
            "authorized": True,
            "recommended_key": expected_key
        }

    # If in Production or strict mode and key is invalid:
    print(f"\n[CRITICAL LICENSE ERROR] Invalid or Missing License Key for domain: '{client_domain}'")
    print(f"[CRITICAL LICENSE ERROR] Expected License Key: {expected_key}")
    print("[CRITICAL LICENSE ERROR] Backend server execution halted due to Commercial EULA violation.\n")
    return {
        "status": "INVALID_LICENSE",
        "licensed_domain": client_domain,
        "license_type": "Unauthorized / Expired License",
        "authorized": False,
        "error": "Server is not authorized to run without a valid Commercial License Key."
    }

@router.get("/info")
async def get_license_info():
    """Public/Admin verification endpoint to check server licensing status."""
    status_info = verify_license_status()
    if not status_info["authorized"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Commercial License Verification Failed. Server unauthorized."
        )
    return status_info
