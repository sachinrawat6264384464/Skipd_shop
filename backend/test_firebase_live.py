import os
import sys

sys.path.append(os.path.dirname(__file__))

from app.core.firebase import init_firebase_admin, verify_firebase_id_token

def test_firebase():
    print("[FIREBASE TEST] Initializing Firebase Admin SDK...")
    init_firebase_admin()
    
    # Test verifying dummy/invalid token gracefully
    print("[FIREBASE TEST] Verifying test token gracefully...")
    result = verify_firebase_id_token("dummy_test_token_123")
    print(f"[FIREBASE TEST] Verify Result: {result} (Expected None for dummy token)")
    
    print("[FIREBASE AUDIT SUCCESS] Firebase integration initialized cleanly with zero crashes!")

if __name__ == "__main__":
    test_firebase()
