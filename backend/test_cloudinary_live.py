import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.cloudinary_svc import upload_image_to_cloudinary, IS_CLOUDINARY_AVAILABLE

def test_live_cloudinary_upload():
    print("Testing Cloudinary CDN Integration...")
    print(f"Cloudinary available: {IS_CLOUDINARY_AVAILABLE}")
    assert IS_CLOUDINARY_AVAILABLE, "Cloudinary SDK should be configured"

    # Test sample image URL upload to Cloudinary
    sample_img = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
    res = upload_image_to_cloudinary(sample_img, folder="ecom_test_products")
    
    print(f"Cloudinary Secure URL: {res.get('url')}")
    print(f"Cloudinary Public ID: {res.get('public_id')}")

    assert "cloudinary.com" in res.get("url"), "Uploaded URL should be on Cloudinary CDN"
    print("✅ Live Cloudinary upload test PASSED successfully!")

if __name__ == "__main__":
    test_live_cloudinary_upload()
