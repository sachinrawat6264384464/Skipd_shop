import os
import json
import firebase_admin
from firebase_admin import credentials, auth

SERVICE_ACCOUNT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "e-commerse-5db6a-firebase-adminsdk-fbsvc-ab0d2a0e3b.json"
)

def init_firebase_admin():
    if not firebase_admin._apps:
        # Option 1: Env variable string
        raw_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
        if raw_json:
            try:
                cert_dict = json.loads(raw_json)
                cred = credentials.Certificate(cert_dict)
                firebase_admin.initialize_app(cred)
                print("[FIREBASE ADMIN INITIALIZED] Service Account loaded from FIREBASE_CREDENTIALS_JSON env var!")
                return
            except Exception as e:
                print(f"[FIREBASE ERR] Failed parsing FIREBASE_CREDENTIALS_JSON: {e}")

        # Option 2: Local JSON file
        if os.path.exists(SERVICE_ACCOUNT_PATH):
            cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
            firebase_admin.initialize_app(cred)
            print("[FIREBASE ADMIN INITIALIZED] Service Account certificate file loaded successfully!")
            return

        print("[FIREBASE WARN] Service Account JSON file/env var not configured.")

def verify_firebase_id_token(id_token: str):
    """Verify Firebase ID Token returned by frontend Firebase Auth."""
    init_firebase_admin()
    if not firebase_admin._apps:
        print("[FIREBASE WARN] Cannot verify ID token: Firebase Admin SDK is not configured (missing JSON cert/env).")
        return None
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"[FIREBASE TOKEN VERIFY ERROR] {e}")
        return None
