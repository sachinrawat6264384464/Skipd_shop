import argparse
import sys
import os

# Add parent directory to path to import app core functions
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.license_guard import generate_valid_license_key, MASTER_SALT

def main():
    parser = argparse.ArgumentParser(description="Skipd Shop Commercial License Key Generator")
    parser.add_argument("--domain", type=str, help="Client domain name (e.g. clientstore.com or mybrand.in)")
    
    args = parser.parse_args()

    domain = args.domain
    if not domain:
        domain = input("\nEnter Client Domain Name (e.g. clientstore.com): ").strip()
    
    if not domain:
        print("[Error] Domain name cannot be empty.")
        sys.exit(1)

    license_key = generate_valid_license_key(domain)

    print("\n" + "="*60)
    print("SKIPD SHOP - COMMERCIAL LICENSE KEY GENERATOR")
    print("Developer   : Sachin Rawat")
    print("Made By     : Botmartz AI Solution Pvt Ltd")
    print("="*60)
    print(f"Client Domain : {domain.lower()}")
    print(f"Master Salt    : {MASTER_SALT[:10]}... (Secret)")
    print("-" * 60)
    print("GENERATED LICENSE KEY:\n")
    print(f"    {license_key}")
    print("\n" + "-" * 60)
    print("COPY & PASTE IN CLIENT'S BACKEND .env FILE:")
    print("-" * 60)
    print(f"ENVIRONMENT=production")
    print(f"CLIENT_DOMAIN={domain.lower()}")
    print(f"LICENSE_KEY={license_key}")
    print(f"ALLOW_UNLICENSED_DEV_MODE=false")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
