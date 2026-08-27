import asyncio
import os
import sys

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_co6MJSXeWK8z@ep-still-king-axcdr7h1-pooler.c-4.us-east-2.aws.neon.tech/neondb"

async def check_neon_db_images():
    print("Connecting to Neon Cloud PostgreSQL DB...")
    engine = create_async_engine(DATABASE_URL, echo=False)
    
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT id, title, handle, image_url, images FROM products ORDER BY id DESC LIMIT 15;"))
        rows = result.fetchall()
        
        print(f"\nFound {len(rows)} products in Neon DB:")
        print("="*80)
        cloudinary_count = 0
        for r in rows:
            p_id, title, handle, img_url, images = r[0], r[1], r[2], r[3], r[4]
            is_cloudinary = "cloudinary.com" in str(img_url or "") or "cloudinary.com" in str(images or "")
            if is_cloudinary:
                cloudinary_count += 1
            print(f"ID: {p_id} | Title: {title}")
            print(f"   image_url: {img_url}")
            print(f"   images: {images}")
            print(f"   Is Cloudinary: {'[YES - Cloudinary CDN]' if is_cloudinary else '[NO - Unsplash / External CDN URL]'}")
            print("-" * 80)
            
        print(f"\nSummary: {cloudinary_count}/{len(rows)} products have Cloudinary CDN URLs in Neon DB.")

if __name__ == "__main__":
    asyncio.run(check_neon_db_images())
