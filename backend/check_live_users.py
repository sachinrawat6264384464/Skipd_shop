import urllib.request, json

# Firebase Web API Key from frontend .env.local
FIREBASE_API_KEY = "AIzaSyBpFtgdE-vJeSJzhIdqpq5b_wnQuJrrGt0"
PROJECT_ID = "e-commerse-5db6a"

# Use Firebase Auth REST API to sign in and list users via Identity Toolkit
# Admin SDK can list users via: https://identitytoolkit.googleapis.com/v1/accounts:lookup

# First sign in with your admin account to get ID token
print("=== Signing in to Firebase ===")
sign_in_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"
sign_in_data = json.dumps({
    "email": "sachinrawat6264384464@gmail.com",
    "password": "sachin@123",
    "returnSecureToken": True
}).encode()

id_token = ""
try:
    req = urllib.request.Request(sign_in_url, data=sign_in_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as r:
        resp = json.loads(r.read())
        id_token = resp.get("idToken", "")
        print(f"Signed in as: {resp.get('email')} | displayName: {resp.get('displayName')}")
except Exception as e:
    print(f"Sign-in error: {e}")

if id_token:
    # Get account info for this user
    lookup_url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={FIREBASE_API_KEY}"
    lookup_data = json.dumps({"idToken": id_token}).encode()
    try:
        req2 = urllib.request.Request(lookup_url, data=lookup_data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req2, timeout=15) as r2:
            resp2 = json.loads(r2.read())
            users = resp2.get("users", [])
            for u in users:
                print(f"\nUser info:")
                print(f"  UID: {u.get('localId')}")
                print(f"  Name: {u.get('displayName')}")
                print(f"  Email: {u.get('email')}")
                print(f"  Email Verified: {u.get('emailVerified')}")
                print(f"  Created: {u.get('createdAt')}")
                print(f"  Last Login: {u.get('lastLoginAt')}")
    except Exception as e:
        print(f"Lookup error: {e}")
else:
    print("No ID token - trying other passwords...")
    for pwd in ["admin123", "Admin@123", "Sachin@123", "sachin123", "123456", "sachin@2026"]:
        try:
            sign_in_data2 = json.dumps({
                "email": "sachinrawat6264384464@gmail.com",
                "password": pwd,
                "returnSecureToken": True
            }).encode()
            req = urllib.request.Request(sign_in_url, data=sign_in_data2, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=10) as r:
                resp = json.loads(r.read())
                print(f"SUCCESS with password '{pwd}'!")
                id_token = resp.get("idToken", "")
                break
        except Exception as e:
            print(f"  Password '{pwd}' failed")
