import os
import firebase_admin
from firebase_admin import credentials, auth

SERVICE_ACCOUNT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "e-commerse-5db6a-firebase-adminsdk-fbsvc-ab0d2a0e3b.json"
)

def init_firebase_admin():
    if not firebase_admin._apps:
        if os.path.exists(SERVICE_ACCOUNT_PATH):
            cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
            firebase_admin.initialize_app(cred)
            print("🔥 [FIREBASE ADMIN INITIALIZED] Service Account certificate loaded successfully!")
        else:
            print(f"⚠️ [FIREBASE WARN] Service Account JSON file not found at: {SERVICE_ACCOUNT_PATH}")

def verify_firebase_id_token(id_token: str):
    """Verify Firebase ID Token returned by frontend Firebase Auth."""
    init_firebase_admin()
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"❌ [FIREBASE TOKEN VERIFY ERROR] {e}")
        return None
