import os
from typing import Dict, Any, List, Optional
from app.core.config import settings

# Initialize Cloudinary SDK safely
try:
    import cloudinary
    import cloudinary.uploader
    import cloudinary.api

    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", settings.CLOUDINARY_CLOUD_NAME),
        api_key=os.getenv("CLOUDINARY_API_KEY", settings.CLOUDINARY_API_KEY),
        api_secret=os.getenv("CLOUDINARY_API_SECRET", settings.CLOUDINARY_API_SECRET),
        secure=True
    )
    IS_CLOUDINARY_AVAILABLE = True
except Exception as err:
    print(f"[CLOUDINARY INIT WARNING] {err}")
    IS_CLOUDINARY_AVAILABLE = False


def upload_image_to_cloudinary(image_input: str, folder: str = "ecom_products") -> Dict[str, Any]:
    """
    Upload image (URL, Base64 string, or local path) directly to Cloudinary CDN.
    Returns dict: {"url": secure_url, "public_id": public_id}
    """
    if not image_input or not isinstance(image_input, str):
        return {"url": image_input or "", "public_id": ""}

    # If already hosted on Cloudinary, return as is
    if "res.cloudinary.com" in image_input:
        return {"url": image_input, "public_id": ""}

    if not IS_CLOUDINARY_AVAILABLE:
        return {"url": image_input, "public_id": ""}

    try:
        res = cloudinary.uploader.upload(
            image_input,
            folder=folder,
            overwrite=True,
            resource_type="auto"
        )
        secure_url = res.get("secure_url") or res.get("url") or image_input
        public_id = res.get("public_id") or ""
        print(f"☁️ [CLOUDINARY UPLOAD SUCCESS] {public_id} -> {secure_url}")
        return {"url": secure_url, "public_id": public_id}
    except Exception as err:
        print(f"[CLOUDINARY UPLOAD ERROR] {err}")
        return {"url": image_input, "public_id": ""}


def upload_multiple_images_to_cloudinary(image_inputs: List[str], folder: str = "ecom_products") -> List[Dict[str, Any]]:
    """Upload a list of image URLs/Base64 to Cloudinary CDN."""
    results = []
    if not isinstance(image_inputs, list):
        return results

    for img in image_inputs:
        if img:
            res = upload_image_to_cloudinary(img, folder=folder)
            results.append(res)
    return results
