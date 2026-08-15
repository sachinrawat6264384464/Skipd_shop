import asyncio
import sys
import os

sys.path.append("d:/ecommers/backend")

from app.core.database import AsyncSessionLocal
from app.models.models import Category, Product, ProductVariant
from sqlalchemy import select

ALL_CATEGORIES = [
    {"name": "Mobiles", "slug": "mobiles", "description": "Latest smartphones & mobile accessories", "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"},
    {"name": "Laptops", "slug": "laptops", "description": "High-performance laptops & ultrabooks", "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"},
    {"name": "Electronics", "slug": "electronics", "description": "Gadgets, audio gear & home electronics", "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"},
    {"name": "Fashion", "slug": "fashion", "description": "Trendy apparel, jackets & ethnic wear", "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"},
    {"name": "Footwear", "slug": "footwear", "description": "Sneakers, boots & formal shoes", "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"},
    {"name": "Watches", "slug": "watches", "description": "Smartwatches & luxury timepieces", "image_url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"},
    {"name": "Lifestyle", "slug": "lifestyle", "description": "Modern kitchen & everyday appliances", "image_url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"},
    {"name": "Home & Living", "slug": "home", "description": "Furniture, decor & home storage", "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"},
    {"name": "Sports", "slug": "sports", "description": "Fitness gear, gym equipment & nutrition", "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"},
    {"name": "Artisan", "slug": "artisan", "description": "Handcrafted organic goods & natural foods", "image_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"},
    {"name": "Health", "slug": "health", "description": "Personal safety, masks & medical kits", "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800"}
]

ALL_PRODUCTS = [
  {
    "title": "OnePlus Nord 6 | 8GB+256GB | Pitch Black",
    "handle": "oneplus-nord-6",
    "description": "Snapdragon 8s Gen 4 | Segment-first stable 165FPS gaming | Segment-largest 9000mAh battery | Personalized AI",
    "price": 44499.0,
    "compare_at_price": 52999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800", "https://images.unsplash.com/photo-1523206489230-c012c64b2047?w=800"],
    "tags": ["mobiles", "bestseller", "oneplus"],
    "cat_slug": "mobiles"
  },
  {
    "title": "Active ANC Wireless Headphones",
    "handle": "active-anc-headphones",
    "description": "Studio-grade noise cancelling headphones with 40-hour battery life and spatial audio.",
    "price": 4999.0,
    "compare_at_price": 7999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"],
    "tags": ["electronics", "audio"],
    "cat_slug": "electronics"
  },
  {
    "title": "Apple Watch Series 9 GPS 45mm Midnight",
    "handle": "apple-watch-series-9",
    "description": "Always-On Retina display, S9 SiP, Double tap gesture, Precision Finding for iPhone.",
    "price": 41900.0,
    "compare_at_price": 44900.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"],
    "tags": ["watches", "tech"],
    "cat_slug": "watches"
  },
  {
    "title": "iPhone 14 Pro Max 256GB Deep Purple",
    "handle": "iphone-14-pro-max",
    "description": "6.7-inch Super Retina XDR display featuring Always-On and Dynamic Island with 48MP main camera.",
    "price": 129900.0,
    "compare_at_price": 139900.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800"],
    "tags": ["mobiles", "bestseller"],
    "cat_slug": "mobiles"
  },
  {
    "title": "Apple MacBook Air M2 13.6-inch Space Grey",
    "handle": "macbook-air-m2",
    "description": "Incredibly thin design, 13.6-inch Liquid Retina display, 8GB unified memory, 256GB SSD storage.",
    "price": 104900.0,
    "compare_at_price": 119900.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"],
    "tags": ["laptops", "bestseller"],
    "cat_slug": "laptops"
  },
  {
    "title": "Nike Air Force 1 '07 Classic White",
    "handle": "nike-air-force-1",
    "description": "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on classic leather.",
    "price": 9695.0,
    "compare_at_price": 10995.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"],
    "tags": ["footwear", "fashion"],
    "cat_slug": "footwear"
  },
  {
    "title": "Minimalist Oversized Graphic Tee",
    "handle": "minimalist-graphic-tee",
    "description": "Heavyweight 240 GSM organic cotton t-shirt with premium screen-printed typography.",
    "price": 1299.0,
    "compare_at_price": 1999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"],
    "tags": ["apparel", "fashion"],
    "cat_slug": "fashion"
  },
  {
    "title": "Matte Black Leather Chrono Watch",
    "handle": "matte-black-chrono-watch",
    "description": "Water-resistant stainless steel chronograph watch with full grain genuine leather strap.",
    "price": 3499.0,
    "compare_at_price": 5499.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"],
    "tags": ["watches", "lifestyle"],
    "cat_slug": "watches"
  },
  {
    "title": "RC 4K Camera Pro Toy Drone",
    "handle": "rc-4k-toy-drone",
    "description": "Foldable quadcopter drone with 4K UHD camera, altitude hold, and gesture control.",
    "price": 2499.0,
    "compare_at_price": 4999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800"],
    "tags": ["electronics", "drone"],
    "cat_slug": "electronics"
  },
  {
    "title": "Winter Heavy Trench Wool Jacket",
    "handle": "winter-trench-jacket",
    "description": "Insulated fleece-lined winter trench jacket for sub-zero weather protection.",
    "price": 3999.0,
    "compare_at_price": 6999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1544441893-675973e31985?w=800"],
    "tags": ["fashion", "jacket"],
    "cat_slug": "fashion"
  },
  {
    "title": "Convection Digital Microwave Oven 28L",
    "handle": "microwave-oven-28l",
    "description": "Multi-stage cooking with auto-cook menu, grill mode, and stainless steel cavity.",
    "price": 11499.0,
    "compare_at_price": 15999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"],
    "tags": ["lifestyle", "kitchen"],
    "cat_slug": "lifestyle"
  },
  {
    "title": "Smart Digital Air Fryer 5.5L Rapid Air",
    "handle": "air-fryer-5l",
    "description": "90% less oil frying with touch screen preset controls and non-stick dishwasher-safe basket.",
    "price": 4999.0,
    "compare_at_price": 8999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800"],
    "tags": ["lifestyle", "kitchen"],
    "cat_slug": "lifestyle"
  },
  {
    "title": "Stainless Steel Induction Pressure Cooker 5L",
    "handle": "pressure-cooker-5l",
    "description": "Heavy-gauge tri-ply stainless steel pressure cooker with safety valve.",
    "price": 2299.0,
    "compare_at_price": 3499.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800"],
    "tags": ["lifestyle", "kitchen"],
    "cat_slug": "lifestyle"
  },
  {
    "title": "Non-Stick Granite Cookware Set 4-Piece",
    "handle": "granite-cookware-set",
    "description": "German granite coating fry pan, kadhai with lid, and tawa.",
    "price": 3199.0,
    "compare_at_price": 5999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1547592180-85f173990554?w=800"],
    "tags": ["lifestyle", "kitchen"],
    "cat_slug": "lifestyle"
  },
  {
    "title": "Modern 3-Seater Velvet Sofa",
    "handle": "modern-3seater-sofa",
    "description": "High-density foam seating with solid neem wood internal frame and plush velvet upholstery.",
    "price": 22499.0,
    "compare_at_price": 35999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"],
    "tags": ["home", "furniture"],
    "cat_slug": "home"
  },
  {
    "title": "Ergonomic Mesh High-Back Study Chair",
    "handle": "study-chair-ergonomic",
    "description": "Adjustable lumbar support, 3D armrests, heavy-duty chrome base with 135° tilt lock.",
    "price": 5999.0,
    "compare_at_price": 11999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800"],
    "tags": ["home", "furniture"],
    "cat_slug": "home"
  },
  {
    "title": "Engineered Wood 3-Door Wardrobe",
    "handle": "3-door-wardrobe",
    "description": "Spacious storage with internal drawers, hanging rod, and security lock.",
    "price": 14999.0,
    "compare_at_price": 24999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800"],
    "tags": ["home", "furniture"],
    "cat_slug": "home"
  },
  {
    "title": "Queen Size Solid Wood Bed with Storage",
    "handle": "queen-wood-bed",
    "description": "Sheesham wood queen bed with hydraulic storage lifts and tufted headboard.",
    "price": 19999.0,
    "compare_at_price": 32999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800"],
    "tags": ["home", "furniture"],
    "cat_slug": "home"
  },
  {
    "title": "Collapsible Fabric Storage Boxes Set of 3",
    "handle": "fabric-storage-boxes",
    "description": "Reinforced handles and sturdy cardboard frame for closet organization.",
    "price": 899.0,
    "compare_at_price": 1499.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800"],
    "tags": ["home", "storage"],
    "cat_slug": "home"
  },
  {
    "title": "Multi-Tier Kitchen Organizer Shelves",
    "handle": "kitchen-organizer-shelves",
    "description": "Rust-proof stainless steel spice rack and countertop storage organizer.",
    "price": 1299.0,
    "compare_at_price": 2199.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"],
    "tags": ["home", "storage"],
    "cat_slug": "home"
  },
  {
    "title": "Modular Cabinet Rack System",
    "handle": "cabinet-rack-system",
    "description": "Heavy-duty steel wire shelf rack for pantry and garage storage.",
    "price": 1799.0,
    "compare_at_price": 2999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800"],
    "tags": ["home", "storage"],
    "cat_slug": "home"
  },
  {
    "title": "Minimalist Floating TV Unit Desk",
    "handle": "floating-tv-unit",
    "description": "Wall-mounted TV console with cable management holes and storage slots.",
    "price": 3499.0,
    "compare_at_price": 5999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
    "tags": ["home", "furniture"],
    "cat_slug": "home"
  },
  {
    "title": "Rubber Encased Hex Dumbbells Set 10kg",
    "handle": "hex-dumbbells-10kg",
    "description": "Anti-roll hexagonal rubber dumbbells with ergonomic chrome handles.",
    "price": 2499.0,
    "compare_at_price": 3999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"],
    "tags": ["sports", "fitness"],
    "cat_slug": "sports"
  },
  {
    "title": "Heavy Duty Wall Mounted Pull-up Bar",
    "handle": "pull-up-bar",
    "description": "Multi-grip doorway pull-up bar for chin-ups, dips, and core workouts.",
    "price": 1499.0,
    "compare_at_price": 2499.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"],
    "tags": ["sports", "fitness"],
    "cat_slug": "sports"
  },
  {
    "title": "Anti-Skid Extra Thick 8mm Yoga Mat",
    "handle": "extra-thick-yoga-mat",
    "description": "Eco-friendly TPE yoga mat with alignment lines and carrying strap.",
    "price": 799.0,
    "compare_at_price": 1499.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1593476550610-87baa860004a?w=800"],
    "tags": ["sports", "fitness"],
    "cat_slug": "sports"
  },
  {
    "title": "Whey Protein Isolate Powder 1kg + Shaker",
    "handle": "whey-protein-1kg",
    "description": "25g pure protein per scoop with digestive enzymes and zero added sugar.",
    "price": 2899.0,
    "compare_at_price": 4299.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800"],
    "tags": ["sports", "nutrition"],
    "cat_slug": "sports"
  },
  {
    "title": "House of Himalayas Barnyard Millet Biscuits",
    "handle": "barnyard-millet-biscuits",
    "description": "Handcrafted 100% natural organic millet biscuits free from palm oil.",
    "price": 297.0,
    "compare_at_price": 350.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"],
    "tags": ["artisan", "organic"],
    "cat_slug": "artisan"
  },
  {
    "title": "Organic Oats Premium Pack 1kg",
    "handle": "organic-oats-1kg",
    "description": "High-fiber whole grain rolled oats sourced directly from Himalayan farms.",
    "price": 199.0,
    "compare_at_price": 350.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"],
    "tags": ["artisan", "organic"],
    "cat_slug": "artisan"
  },
  {
    "title": "Jhangora Biscuits 50% Unpolished",
    "handle": "jhangora-biscuits",
    "description": "Traditional mountain recipe prepared with pure cow ghee and unrefined jaggery.",
    "price": 149.0,
    "compare_at_price": 250.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"],
    "tags": ["artisan", "organic"],
    "cat_slug": "artisan"
  },
  {
    "title": "Ragi Cookies Natural 200g",
    "handle": "ragi-cookies-natural",
    "description": "Calcium-rich finger millet cookies baked by artisan self-help groups.",
    "price": 129.0,
    "compare_at_price": 200.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"],
    "tags": ["artisan", "organic"],
    "cat_slug": "artisan"
  },
  {
    "title": "N95 Respirator Mask 10 Pcs Pack",
    "handle": "n95-mask-10pack",
    "description": "5-layer PM2.5 filtration mask with soft earloops and adjustable nose clip.",
    "price": 399.0,
    "compare_at_price": 699.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800"],
    "tags": ["health", "safety"],
    "cat_slug": "health"
  },
  {
    "title": "Saree Premium Silk",
    "handle": "saree-premium-silk",
    "description": "Exquisite hand-woven premium silk saree with intricate golden zari border. Ideal for weddings, festivities and special occasions.",
    "price": 299.0,
    "compare_at_price": 590.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"],
    "tags": ["fashion", "saree", "silk"],
    "cat_slug": "fashion"
  },
  {
    "title": "Cold Pressed Oil 1L",
    "handle": "cold-pressed-oil-1l",
    "description": "100% pure wood-pressed cold pressed oil, extracted without heat to retain all nutrients.",
    "price": 249.0,
    "compare_at_price": 499.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800"],
    "tags": ["organic", "oil", "kitchen"],
    "cat_slug": "artisan"
  },
  {
    "title": "20000mAh Power Bank",
    "handle": "20000mah-power-bank",
    "description": "Ultra-capacity 20000mAh fast-charging power bank with 22.5W PD charging.",
    "price": 999.0,
    "compare_at_price": 1999.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1609592424089-a2e4b3c4342d?w=800"],
    "tags": ["electronics", "powerbank"],
    "cat_slug": "electronics"
  },
  {
    "title": "Nike Running Shoe",
    "handle": "nike-running-shoe",
    "description": "High-performance Nike running shoes with React foam midsole for maximum cushioning.",
    "price": 700.0,
    "compare_at_price": 1299.0,
    "featured": True,
    "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"],
    "tags": ["footwear", "nike", "sports"],
    "cat_slug": "footwear"
  }
]

async def seed():
    async with AsyncSessionLocal() as session:
        print("[DB SEEDER] Starting full database seeding...")
        
        # 1. Upsert Categories
        cat_map = {}
        for cdata in ALL_CATEGORIES:
            res = await session.execute(select(Category).where(Category.slug == cdata["slug"]))
            existing_cat = res.scalars().first()
            if not existing_cat:
                cat = Category(
                    name=cdata["name"],
                    slug=cdata["slug"],
                    description=cdata["description"],
                    image_url=cdata["image_url"]
                )
                session.add(cat)
                await session.flush()
                cat_map[cdata["slug"]] = cat.id
                print(f" -> Created Category: {cdata['name']}")
            else:
                cat_map[cdata["slug"]] = existing_cat.id

        await session.commit()

        # 2. Upsert Products
        seeded_count = 0
        for pdata in ALL_PRODUCTS:
            cat_id = cat_map.get(pdata["cat_slug"])
            res = await session.execute(select(Product).where(Product.handle == pdata["handle"]))
            existing_prod = res.scalars().first()

            if not existing_prod:
                prod = Product(
                    title=pdata["title"],
                    handle=pdata["handle"],
                    description=pdata["description"],
                    price=pdata["price"],
                    compare_at_price=pdata["compare_at_price"],
                    category_id=cat_id,
                    featured=pdata["featured"],
                    images=pdata["images"],
                    tags=pdata["tags"]
                )
                session.add(prod)
                await session.flush()

                # Add sample variant
                var = ProductVariant(
                    product_id=prod.id,
                    title="Standard Edition",
                    sku=f"{prod.handle[:8].upper()}-STD",
                    price=prod.price,
                    stock_quantity=100
                )
                session.add(var)
                seeded_count += 1
                print(f" -> Created Product: {pdata['title']}")
            else:
                # Ensure price, images, tags are up to date
                existing_prod.price = pdata["price"]
                existing_prod.images = pdata["images"]
                existing_prod.tags = pdata["tags"]
                existing_prod.category_id = cat_id
                seeded_count += 1

        await session.commit()
        print(f"[DB SEEDER SUCCESS] Successfully seeded/updated {seeded_count} products in Neon PostgreSQL Database!")

if __name__ == "__main__":
    asyncio.run(seed())
