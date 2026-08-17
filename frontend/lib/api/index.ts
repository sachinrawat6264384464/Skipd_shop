import { getUserOrdersKey } from "../utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

export interface Product {
  id: number;
  title: string;
  handle: string;
  description: string;
  price: number;
  compare_at_price?: number;
  featured: boolean;
  images: string[];
  tags: string[];
  stock_quantity?: number;  // 0 = Out of Stock
  highlights?: string[];
  box_contents?: (string | { title: string; image?: string; icon?: string })[];
  colors?: string[] | { name: string; price: number; mrp?: number }[];
  category?: {
    name: string;
    slug: string;
  };
  variants?: {
    id: number;
    title: string;
    sku: string;
    price: number;
    stock_quantity: number;
  }[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface TrackingData {
  order_number: string;
  awb_code: string;
  courier_name: string;
  current_status: string;
  estimated_delivery: string;
  timeline: {
    status: string;
    location: string;
    timestamp: string;
    completed: boolean;
  }[];
}

export interface UserOrder {
  id: string;
  order_number: string;
  date: string;
  total: number;
  title: string;
  image: string;
  status: string;
  awb?: string;
  deliveryText?: string;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "OnePlus Nord 6 | 8GB+256GB | Pitch Black",
    handle: "oneplus-nord-6",
    description: "Snapdragon 8s Gen 4 | Segment-first stable 165FPS gaming | Segment-largest 9000mAh battery | Personalized AI",
    price: 44499,
    compare_at_price: 52999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800", "https://images.unsplash.com/photo-1523206489230-c012c64b2047?w=800"],
    tags: ["mobiles", "bestseller", "oneplus"],
    category: { name: "Mobiles", slug: "mobiles" }
  },
  {
    id: 2,
    title: "Active ANC Wireless Headphones",
    handle: "active-anc-headphones",
    description: "Studio-grade noise cancelling headphones with 40-hour battery life and spatial audio.",
    price: 4999,
    compare_at_price: 7999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"],
    tags: ["electronics", "audio"],
    category: { name: "Electronics", slug: "electronics" }
  },
  {
    id: 3,
    title: "Apple Watch Series 9 GPS 45mm Midnight",
    handle: "apple-watch-series-9",
    description: "Always-On Retina display, S9 SiP, Double tap gesture, Precision Finding for iPhone.",
    price: 41900,
    compare_at_price: 44900,
    featured: true,
    images: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"],
    tags: ["watches", "tech"],
    category: { name: "Watches", slug: "watches" }
  },
  {
    id: 4,
    title: "iPhone 14 Pro Max 256GB Deep Purple",
    handle: "iphone-14-pro-max",
    description: "6.7-inch Super Retina XDR display featuring Always-On and Dynamic Island with 48MP main camera.",
    price: 129900,
    compare_at_price: 139900,
    featured: true,
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800"],
    tags: ["mobiles", "bestseller"],
    category: { name: "Mobiles", slug: "mobiles" }
  },
  {
    id: 5,
    title: "Apple MacBook Air M2 13.6-inch Space Grey",
    handle: "macbook-air-m2",
    description: "Incredibly thin design, 13.6-inch Liquid Retina display, 8GB unified memory, 256GB SSD storage.",
    price: 104900,
    compare_at_price: 119900,
    featured: true,
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"],
    tags: ["laptops", "bestseller"],
    category: { name: "Laptops", slug: "laptops" }
  },
  {
    id: 6,
    title: "Nike Air Force 1 '07 Classic White",
    handle: "nike-air-force-1",
    description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on classic leather.",
    price: 9695,
    compare_at_price: 10995,
    featured: true,
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"],
    tags: ["footwear", "fashion"],
    category: { name: "Footwear", slug: "footwear" }
  },
  {
    id: 7,
    title: "Minimalist Oversized Graphic Tee",
    handle: "minimalist-graphic-tee",
    description: "Heavyweight 240 GSM organic cotton t-shirt with premium screen-printed typography.",
    price: 1299,
    compare_at_price: 1999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"],
    tags: ["apparel", "fashion"],
    category: { name: "Fashion", slug: "fashion" }
  },
  {
    id: 8,
    title: "Matte Black Leather Chrono Watch",
    handle: "matte-black-chrono-watch",
    description: "Water-resistant stainless steel chronograph watch with full grain genuine leather strap.",
    price: 3499,
    compare_at_price: 5499,
    featured: true,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"],
    tags: ["watches", "lifestyle"],
    category: { name: "Watches", slug: "watches" }
  },
  {
    id: 9,
    title: "RC 4K Camera Pro Toy Drone",
    handle: "rc-4k-toy-drone",
    description: "Foldable quadcopter drone with 4K UHD camera, altitude hold, and gesture control.",
    price: 2499,
    compare_at_price: 4999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800"],
    tags: ["electronics", "drone"],
    category: { name: "Electronics", slug: "electronics" }
  },
  {
    id: 10,
    title: "Winter Heavy Trench Wool Jacket",
    handle: "winter-trench-jacket",
    description: "Insulated fleece-lined winter trench jacket for sub-zero weather protection.",
    price: 3999,
    compare_at_price: 6999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1544441893-675973e31985?w=800"],
    tags: ["fashion", "jacket"],
    category: { name: "Fashion", slug: "fashion" }
  },

  // 🍳 KITCHEN & LIFESTYLE
  {
    id: 11,
    title: "Convection Digital Microwave Oven 28L",
    handle: "microwave-oven-28l",
    description: "Multi-stage cooking with auto-cook menu, grill mode, and stainless steel cavity.",
    price: 11499,
    compare_at_price: 15999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"],
    tags: ["lifestyle", "kitchen"],
    category: { name: "Lifestyle", slug: "lifestyle" }
  },
  {
    id: 12,
    title: "Smart Digital Air Fryer 5.5L Rapid Air",
    handle: "air-fryer-5l",
    description: "90% less oil frying with touch screen preset controls and non-stick dishwasher-safe basket.",
    price: 4999,
    compare_at_price: 8999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800"],
    tags: ["lifestyle", "kitchen"],
    category: { name: "Lifestyle", slug: "lifestyle" }
  },
  {
    id: 13,
    title: "Stainless Steel Induction Pressure Cooker 5L",
    handle: "pressure-cooker-5l",
    description: "Heavy-gauge tri-ply stainless steel pressure cooker with safety valve.",
    price: 2299,
    compare_at_price: 3499,
    featured: true,
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800"],
    tags: ["lifestyle", "kitchen"],
    category: { name: "Lifestyle", slug: "lifestyle" }
  },
  {
    id: 14,
    title: "Non-Stick Granite Cookware Set 4-Piece",
    handle: "granite-cookware-set",
    description: "German granite coating fry pan, kadhai with lid, and tawa.",
    price: 3199,
    compare_at_price: 5999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1547592180-85f173990554?w=800"],
    tags: ["lifestyle", "kitchen"],
    category: { name: "Lifestyle", slug: "lifestyle" }
  },

  // 🪑 FURNITURE & HOME LIVING
  {
    id: 15,
    title: "Modern 3-Seater Velvet Sofa",
    handle: "modern-3seater-sofa",
    description: "High-density foam seating with solid neem wood internal frame and plush velvet upholstery.",
    price: 22499,
    compare_at_price: 35999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"],
    tags: ["home", "furniture"],
    category: { name: "Home & Living", slug: "home" }
  },
  {
    id: 16,
    title: "Ergonomic Mesh High-Back Study Chair",
    handle: "study-chair-ergonomic",
    description: "Adjustable lumbar support, 3D armrests, heavy-duty chrome base with 135° tilt lock.",
    price: 5999,
    compare_at_price: 11999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800"],
    tags: ["home", "furniture"],
    category: { name: "Home & Living", slug: "home" }
  },
  {
    id: 17,
    title: "Engineered Wood 3-Door Wardrobe",
    handle: "3-door-wardrobe",
    description: "Spacious storage with internal drawers, hanging rod, and security lock.",
    price: 14999,
    compare_at_price: 24999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800"],
    tags: ["home", "furniture"],
    category: { name: "Home & Living", slug: "home" }
  },
  {
    id: 18,
    title: "Queen Size Solid Wood Bed with Storage",
    handle: "queen-wood-bed",
    description: "Sheesham wood queen bed with hydraulic storage lifts and tufted headboard.",
    price: 19999,
    compare_at_price: 32999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800"],
    tags: ["home", "furniture"],
    category: { name: "Home & Living", slug: "home" }
  },

  // 📦 HOME & KITCHEN STORAGE
  {
    id: 19,
    title: "Collapsible Fabric Storage Boxes Set of 3",
    handle: "fabric-storage-boxes",
    description: "Reinforced handles and sturdy cardboard frame for closet organization.",
    price: 899,
    compare_at_price: 1499,
    featured: true,
    images: ["https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800"],
    tags: ["home", "storage"],
    category: { name: "Home & Living", slug: "home" }
  },
  {
    id: 20,
    title: "Multi-Tier Kitchen Organizer Shelves",
    handle: "kitchen-organizer-shelves",
    description: "Rust-proof stainless steel spice rack and countertop storage organizer.",
    price: 1299,
    compare_at_price: 2199,
    featured: true,
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"],
    tags: ["home", "storage"],
    category: { name: "Home & Living", slug: "home" }
  },
  {
    id: 21,
    title: "Modular Cabinet Rack System",
    handle: "cabinet-rack-system",
    description: "Heavy-duty steel wire shelf rack for pantry and garage storage.",
    price: 1799,
    compare_at_price: 2999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800"],
    tags: ["home", "storage"],
    category: { name: "Home & Living", slug: "home" }
  },
  {
    id: 22,
    title: "Minimalist Floating TV Unit Desk",
    handle: "floating-tv-unit",
    description: "Wall-mounted TV console with cable management holes and storage slots.",
    price: 3499,
    compare_at_price: 5999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
    tags: ["home", "furniture"],
    category: { name: "Home & Living", slug: "home" }
  },

  // 🏃 SPORTS, FITNESS & OUTDOORS
  {
    id: 23,
    title: "Rubber Encased Hex Dumbbells Set 10kg",
    handle: "hex-dumbbells-10kg",
    description: "Anti-roll hexagonal rubber dumbbells with ergonomic chrome handles.",
    price: 2499,
    compare_at_price: 3999,
    featured: true,
    images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"],
    tags: ["sports", "fitness"],
    category: { name: "Sports", slug: "sports" }
  },
  {
    id: 24,
    title: "Heavy Duty Wall Mounted Pull-up Bar",
    handle: "pull-up-bar",
    description: "Multi-grip doorway pull-up bar for chin-ups, dips, and core workouts.",
    price: 1499,
    compare_at_price: 2499,
    featured: true,
    images: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"],
    tags: ["sports", "fitness"],
    category: { name: "Sports", slug: "sports" }
  },
  {
    id: 25,
    title: "Anti-Skid Extra Thick 8mm Yoga Mat",
    handle: "extra-thick-yoga-mat",
    description: "Eco-friendly TPE yoga mat with alignment lines and carrying strap.",
    price: 799,
    compare_at_price: 1499,
    featured: true,
    images: ["https://images.unsplash.com/photo-1593476550610-87baa860004a?w=800"],
    tags: ["sports", "fitness"],
    category: { name: "Sports", slug: "sports" }
  },
  {
    id: 26,
    title: "Whey Protein Isolate Powder 1kg + Shaker",
    handle: "whey-protein-1kg",
    description: "25g pure protein per scoop with digestive enzymes and zero added sugar.",
    price: 2899,
    compare_at_price: 4299,
    featured: true,
    images: ["https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800"],
    tags: ["sports", "nutrition"],
    category: { name: "Sports", slug: "sports" }
  },

  // 🌾 ARTISAN CRAFTS & ORGANICS
  {
    id: 27,
    title: "House of Himalayas Barnyard Millet Biscuits",
    handle: "barnyard-millet-biscuits",
    description: "Handcrafted 100% natural organic millet biscuits free from palm oil.",
    price: 297,
    compare_at_price: 350,
    featured: true,
    images: ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"],
    tags: ["artisan", "organic"],
    category: { name: "Artisan", slug: "artisan" }
  },
  {
    id: 28,
    title: "Organic Oats Premium Pack 1kg",
    handle: "organic-oats-1kg",
    description: "High-fiber whole grain rolled oats sourced directly from Himalayan farms.",
    price: 199,
    compare_at_price: 350,
    featured: true,
    images: ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"],
    tags: ["artisan", "organic"],
    category: { name: "Artisan", slug: "artisan" }
  },
  {
    id: 29,
    title: "Jhangora Biscuits 50% Unpolished",
    handle: "jhangora-biscuits",
    description: "Traditional mountain recipe prepared with pure cow ghee and unrefined jaggery.",
    price: 149,
    compare_at_price: 250,
    featured: true,
    images: ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"],
    tags: ["artisan", "organic"],
    category: { name: "Artisan", slug: "artisan" }
  },
  {
    id: 30,
    title: "Ragi Cookies Natural 200g",
    handle: "ragi-cookies-natural",
    description: "Calcium-rich finger millet cookies baked by artisan self-help groups.",
    price: 129,
    compare_at_price: 200,
    featured: true,
    images: ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"],
    tags: ["artisan", "organic"],
    category: { name: "Artisan", slug: "artisan" }
  },

  // 🏥 PERSONAL SAFETY & CARE
  {
    id: 31,
    title: "N95 Respirator Mask 10 Pcs Pack",
    handle: "n95-mask-10pack",
    description: "5-layer PM2.5 filtration mask with soft earloops and adjustable nose clip.",
    price: 399,
    compare_at_price: 699,
    featured: true,
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800"],
    tags: ["health", "safety"],
    category: { name: "Health", slug: "health" }
  },
  {
    id: 32,
    title: "Dettol Hand Sanitizer 500ml Pump",
    handle: "sanitizer-500ml",
    description: "99.99% germ protection rinse-free sanitizer with moisturizers.",
    price: 199,
    compare_at_price: 299,
    featured: true,
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800"],
    tags: ["health", "safety"],
    category: { name: "Health", slug: "health" }
  },
  {
    id: 33,
    title: "Nitrile Safety Gloves 100 Pcs Box",
    handle: "nitrile-gloves-100",
    description: "Powder-free medical grade disposable nitrile examination gloves.",
    price: 349,
    compare_at_price: 599,
    featured: true,
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800"],
    tags: ["health", "safety"],
    category: { name: "Health", slug: "health" }
  },
  {
    id: 34,
    title: "First Aid Medical Kit Complete Box",
    handle: "first-aid-kit",
    description: "45 essential medical supplies emergency kit for home and travel.",
    price: 449,
    compare_at_price: 799,
    featured: true,
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800"],
    tags: ["health", "safety"],
    category: { name: "Health", slug: "health" }
  },

  // 🛍️ DEALS / FREEDOM SALE OFFER PRODUCTS
  {
    id: 101,
    title: "Saree Premium Silk",
    handle: "saree-premium-silk",
    description: "Exquisite hand-woven premium silk saree with intricate golden zari border. Ideal for weddings, festivities and special occasions. Pure silk with traditional Banarasi weaving craft.",
    price: 299,
    compare_at_price: 590,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
      "https://images.unsplash.com/photo-1599841222-e3d3a6e7de04?w=800"
    ],
    tags: ["fashion", "saree", "silk", "ethnic"],
    category: { name: "Fashion", slug: "fashion" }
  },
  {
    id: 102,
    title: "Cold Pressed Oil 1L",
    handle: "cold-pressed-oil-1l",
    description: "100% pure wood-pressed cold pressed oil, extracted without heat to retain all nutrients. Rich in Omega fatty acids and antioxidants. No chemicals, no preservatives — straight from the farm.",
    price: 249,
    compare_at_price: 499,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800",
      "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800"
    ],
    tags: ["organic", "oil", "kitchen", "health"],
    category: { name: "Artisan", slug: "artisan" }
  },
  {
    id: 103,
    title: "Velvet Cushion Cover",
    handle: "velvet-cushion-cover",
    description: "Luxurious premium velvet cushion cover with hidden zipper. Super soft feel with vibrant color retention. Machine washable and wrinkle-resistant. Perfect for sofa, bed and home decor.",
    price: 800,
    compare_at_price: 1499,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
    ],
    tags: ["home", "decor", "cushion"],
    category: { name: "Home & Living", slug: "home" }
  },
  {
    id: 104,
    title: "20000mAh Power Bank",
    handle: "20000mah-power-bank",
    description: "Ultra-capacity 20000mAh fast-charging power bank with 22.5W PD charging. Features dual USB-A and USB-C outputs with LED indicator. Airline-approved, compact design with built-in safety protections.",
    price: 999,
    compare_at_price: 1999,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1609592424089-a2e4b3c4342d?w=800",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"
    ],
    tags: ["electronics", "power bank", "charging"],
    category: { name: "Electronics", slug: "electronics" }
  },
  {
    id: 105,
    title: "Nike Running Shoe",
    handle: "nike-running-shoe",
    description: "High-performance Nike running shoes with React foam midsole for maximum cushioning and energy return. Breathable Flyknit upper keeps feet cool. Rubber outsole provides traction on all surfaces.",
    price: 700,
    compare_at_price: 1299,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"
    ],
    tags: ["footwear", "nike", "sports", "running"],
    category: { name: "Footwear", slug: "footwear" }
  },
  {
    id: 106,
    title: "Leather Jacket",
    handle: "leather-jacket",
    description: "Premium genuine leather biker jacket with quilted lining, side buckles and YKK zippers. Timeless design that gets better with age. Available in multiple sizes. Perfect for winters and style.",
    price: 999,
    compare_at_price: 3499,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=800",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800"
    ],
    tags: ["fashion", "jacket", "leather"],
    category: { name: "Fashion", slug: "fashion" }
  },
  {
    id: 107,
    title: "FPV Toy Drone",
    handle: "fpv-toy-drone",
    description: "Feature-packed FPV toy drone with 4K HD camera, altitude hold, one-key return and gesture photo/video control. 25-min flight time, 300m range, foldable design for easy carry. Perfect for beginners and enthusiasts.",
    price: 999,
    compare_at_price: 2499,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800",
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800"
    ],
    tags: ["electronics", "drone", "gadget"],
    category: { name: "Electronics", slug: "electronics" }
  },
  {
    id: 108,
    title: "Pro Headphones",
    handle: "pro-headphones",
    description: "Studio-grade over-ear headphones with 40mm dynamic drivers, active noise cancellation and 35-hour playtime. Foldable design with premium memory foam ear cups. Compatible with all devices via 3.5mm and Bluetooth 5.3.",
    price: 950,
    compare_at_price: 2499,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"
    ],
    tags: ["electronics", "audio", "headphones"],
    category: { name: "Electronics", slug: "electronics" }
  }
];

export async function fetchProducts(query?: { category?: string; search?: string; featured?: boolean }): Promise<Product[]> {
  let backendProducts: Product[] = [];
  let isBackendOk = false;
  try {
    const params = new URLSearchParams();
    if (query?.category) params.append("category", query.category);
    if (query?.search) params.append("search", query.search);
    if (query?.featured !== undefined) params.append("featured", String(query.featured));

    const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`, {
      cache: "no-store"
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        backendProducts = data;
        isBackendOk = true;
      }
    }
  } catch (err: any) {
    if (err && (err.$$typeof || err.message?.includes("postpone") || err.digest?.includes("NEXT_PRERENDER"))) {
      throw err;
    }
    console.warn("[API SDK Warning] FastAPI backend offline, using fallback catalog.", err);
  }

  // Pure 100% live database products when backend API is connected
  if (isBackendOk && backendProducts.length > 0) {
    return backendProducts;
  }

  // Safe fallback catalog only if backend server is unreachable
  let customProducts: any[] = [];
  let updatedProductsMap: Record<string, any> = {};
  let deletedIdsSet = new Set<string>();

  if (typeof window !== "undefined") {
    try {
      const storedCustom = localStorage.getItem("skipd_custom_products");
      if (storedCustom) {
        const parsed = JSON.parse(storedCustom);
        if (Array.isArray(parsed)) customProducts = parsed;
      }

      const storedUpdates = localStorage.getItem("skipd_updated_products");
      if (storedUpdates) {
        updatedProductsMap = JSON.parse(storedUpdates);
      }

      const storedDeletions = localStorage.getItem("skipd_deleted_product_ids");
      if (storedDeletions) {
        const parsed = JSON.parse(storedDeletions);
        if (Array.isArray(parsed)) {
          parsed.forEach((id: any) => deletedIdsSet.add(String(id)));
        }
      }
    } catch {}
  }

  let combined = [...customProducts, ...MOCK_PRODUCTS];

  // Remove duplicates & deleted items, apply updates
  const seenIds = new Set();
  combined = combined
    .filter(p => {
      const pIdStr = String(p.id);
      if (deletedIdsSet.has(pIdStr) || deletedIdsSet.has(p.handle)) return false;
      const key = p.id || p.handle;
      if (seenIds.has(key)) return false;
      seenIds.add(key);
      return true;
    })
    .map(p => {
      const pIdStr = String(p.id);
      if (updatedProductsMap[pIdStr]) {
        return { ...p, ...updatedProductsMap[pIdStr] };
      }
      return p;
    });

  if (query?.featured) combined = combined.filter(p => p.featured);
  if (query?.category && query.category !== "all") {
    combined = combined.filter(p => p.category?.slug === query.category || p.category_slug === query.category || p.tags?.includes(query.category!));
  }
  if (query?.search && !["all", "all-categories", "catalog"].includes(query.search.toLowerCase())) {
    combined = combined.filter(p => p.title.toLowerCase().includes(query.search!.toLowerCase()) || p.category?.name?.toLowerCase().includes(query.search!.toLowerCase()));
  }
  
  return combined;
}

export async function fetchProductByHandle(handle: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${handle}`, {
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.id) return data;
    }
  } catch (err) {
    console.warn("[API SDK Warning] FastAPI backend offline, using fallback product detail.", err);
  }

  // Search full product catalog (PostgreSQL DB + Custom Admin Products + Mock Catalog)
  const allProds = await fetchProducts();
  const found = allProds.find(p => 
    p.handle === handle || 
    String(p.id) === handle || 
    p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === handle
  );
  if (found) return found;

  const mockFound = MOCK_PRODUCTS.find(p => p.handle === handle || String(p.id) === handle);
  return mockFound ?? null;
}

export async function fetchCategories(): Promise<Category[]> {
  let categories: Category[] = [
    { id: 1, name: "Mobiles", slug: "mobiles" },
    { id: 2, name: "Laptops", slug: "laptops" },
    { id: 3, name: "Electronics", slug: "electronics" },
    { id: 4, name: "Fashion", slug: "fashion" },
    { id: 5, name: "Footwear", slug: "footwear" },
    { id: 6, name: "Watches", slug: "watches" },
    { id: 7, name: "Beauty", slug: "beauty" },
    { id: 8, name: "Home & Living", slug: "home" },
    { id: 9, name: "Gaming", slug: "gaming" }
  ];

  try {
    const res = await fetch(`${API_BASE_URL}/products/categories`, {
      cache: "no-store"
    });
    if (res.ok) {
      const apiCats = await res.json();
      if (Array.isArray(apiCats) && apiCats.length > 0) {
        apiCats.forEach(c => {
          if (!categories.some(exist => exist.slug === c.slug || exist.name.toLowerCase() === c.name.toLowerCase())) {
            categories.push(c);
          }
        });
      }
    }
  } catch (err) {
    console.warn("[API SDK Warning] FastAPI backend offline, using fallback categories.");
  }

  // Dynamic Category extraction from all products (including custom products & categories added by Admin!)
  if (typeof window !== "undefined") {
    try {
      // 1. Extract from custom categories in localStorage
      const customCatsItem = localStorage.getItem("skipd_custom_categories");
      if (customCatsItem) {
        const parsed = JSON.parse(customCatsItem);
        if (Array.isArray(parsed)) {
          parsed.forEach(c => {
            const name = typeof c === "string" ? c : (c.name || c.title);
            if (name && typeof name === "string" && name.trim().length > 0) {
              const slug = (typeof c === "object" && c.slug ? c.slug : name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              if (!categories.some(exist => exist.slug === slug || exist.name.toLowerCase() === name.toLowerCase())) {
                categories.push({ id: Date.now() + Math.floor(Math.random() * 1000), name, slug });
              }
            }
          });
        }
      }

      // 2. Extract categories from custom products in localStorage
      const customProdsItem = localStorage.getItem("skipd_custom_products");
      if (customProdsItem) {
        const parsedP = JSON.parse(customProdsItem);
        if (Array.isArray(parsedP)) {
          parsedP.forEach(p => {
            const catName = p.category_name || p.category?.name || p.category_slug || (typeof p.category === "string" ? p.category : null);
            if (catName && typeof catName === "string" && catName.trim().length > 0) {
              const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              if (!categories.some(exist => exist.slug === slug || exist.name.toLowerCase() === catName.toLowerCase())) {
                categories.push({ id: Date.now() + Math.floor(Math.random() * 1000), name: catName, slug });
              }
            }
          });
        }
      }
    } catch (e) {}
  }

  return categories;
}

export async function createCheckoutSession(checkoutData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/checkout`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("skipd_token") || "jwt_token_demo_skipd_2026"}`
      },
      body: JSON.stringify(checkoutData)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("[API SDK Warning] FastAPI checkout endpoint offline, returning mock order.");
  }

  return {
    id: 101,
    order_number: `SKIPD-${Math.floor(100000 + Math.random() * 900000)}`,
    total_amount: checkoutData.total || 1299,
    currency: "INR",
    status: "PENDING_PAYMENT",
    razorpay_order_id: `order_rzp_mock_${Date.now()}`
  };
}

export async function fetchWalletBalance(): Promise<{balance: number}> {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("skipd_token") || "jwt_token_demo_skipd_2026"}`
      },
      cache: "no-store"
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("[API SDK Warning] FastAPI wallet endpoint offline.");
  }
  return { balance: 0.0 };
}

export async function fetchLiveTracking(awbOrOrder: string): Promise<TrackingData> {
  try {
    const res = await fetch(`${API_BASE_URL}/shipping/track?tracking_number=${awbOrOrder}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("[API SDK Warning] Live tracking API endpoint offline, returning mock tracking timeline.");
  }

  return {
    order_number: awbOrOrder.startsWith("SR-") ? "SKIPD-984201" : awbOrOrder,
    awb_code: awbOrOrder,
    courier_name: "Shiprocket Express Air (BlueDart)",
    current_status: "IN_TRANSIT",
    estimated_delivery: "Tomorrow, 9:00 PM",
    timeline: [
      { status: "Order Placed", location: "Bengaluru Warehouse", timestamp: "12 Aug, 10:30 AM", completed: true },
      { status: "Packed & Picked Up by Courier", location: "Shiprocket Air Cargo Hub", timestamp: "12 Aug, 02:15 PM", completed: true },
      { status: "In Transit to Destination Hub", location: "Mumbai Sort Facility", timestamp: "12 Aug, 08:45 PM", completed: true },
      { status: "Out for Delivery", location: "Local Courier Hub", timestamp: "Expected Tomorrow, 09:00 AM", completed: false },
      { status: "Delivered", location: "Customer Address", timestamp: "Expected Tomorrow, 09:00 PM", completed: false }
    ]
  };
}

export async function fetchUserOrders(): Promise<UserOrder[]> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("skipd_token") : null;
    if (!token) return [];

    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((o: any) => ({
          id: String(o.id),
          order_number: o.order_number || `SKIPD-${o.id}`,
          date: o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Today",
          total: o.total_amount || 0,
          title: o.items?.[0]?.product_name || "Purchased Product",
          image: o.items?.[0]?.product_image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
          status: o.status || "SHIPPED",
          awb: `SR-AWB-${o.order_number || o.id}`,
          deliveryText: o.status === "DELIVERED" ? "Delivered" : "In Transit across regional hubs"
        }));
      }
    }
  } catch (e) {
    console.warn("[Backend SQL API] Orders endpoint offline, checking user-scoped orders history.");
  }

  // Load User-Scoped Orders History
  const ordersKey = getUserOrdersKey();
  try {
    const saved = localStorage.getItem(ordersKey);
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  return [];
}

export async function fetchUserAddressesAPI() {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("skipd_token") : null;
    if (!token) return [];
    const res = await fetch(`${API_BASE_URL}/addresses`, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      return data.addresses || [];
    }
  } catch (e) {}
  return [];
}

export async function addUserAddressAPI(addressData: any) {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("skipd_token") : null;
    if (!token) return null;
    const res = await fetch(`${API_BASE_URL}/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(addressData)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

export async function fetchUserWalletAPI() {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("skipd_token") : null;
    if (!token) return { balance: 0.0, transactions: [] };
    const res = await fetch(`${API_BASE_URL}/wallet`, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store"
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { balance: 0.0, transactions: [] };
}

export async function fetchUserCartAPI() {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("skipd_token") : null;
    if (!token) return [];
    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      return data.cart_items || [];
    }
  } catch (e) {}
  return [];
}

export async function addToCartAPI(productId: number, quantity: number = 1) {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("skipd_token") : null;
    if (!token) return null;
    const res = await fetch(`${API_BASE_URL}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

export async function requestReturn(orderId: string, reason: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/return`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("skipd_token") || "jwt_token_demo_skipd_2026"}`
      },
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || "Failed to request return");
    }
    return data;
  } catch (err) {
    console.warn("[API SDK Warning] FastAPI return endpoint offline.");
    return { message: "Return requested successfully (Mocked)" };
  }
}

export async function fetchAdminStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("[API SDK Warning] FastAPI admin endpoint offline, calculating real-time dynamic admin stats.");
  }

  // Calculate Real-Time Dynamic Admin Stats from actual store activity
  let allOrders: any[] = [];
  if (typeof window !== "undefined") {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith("skipd_orders_") || k === "skipd_all_store_orders");
      keys.forEach(k => {
        const item = localStorage.getItem(k);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) {
              parsed.forEach(ord => {
                if (!allOrders.some(o => (o.order_number && o.order_number === ord.order_number) || (o.id && o.id === ord.id))) {
                  allOrders.push(ord);
                }
              });
            }
          } catch (e) {}
        }
      });
    } catch (e) {}
  }

  const totalRevenue = allOrders.reduce((sum, ord) => sum + (Number(ord.total) || Number(ord.total_amount) || 0), 0);
  const totalOrders = allOrders.length;
  const productsSold = allOrders.reduce((sum, ord) => sum + (ord.items?.length || 1), 0);

  // Registered Users Count
  let userCount = 0;
  if (typeof window !== "undefined") {
    const currentUser = localStorage.getItem("skipd_user");
    if (currentUser) userCount = 1;
    const registeredUsers = localStorage.getItem("skipd_all_registered_users");
    if (registeredUsers) {
      try {
        const parsed = JSON.parse(registeredUsers);
        if (Array.isArray(parsed)) userCount = Math.max(userCount, parsed.length);
      } catch (e) {}
    }
  }

  // Live Products from Database
  const liveProducts = await fetchProducts();
  const productsCount = liveProducts.length;

  // Visit Count
  let visitsCount = 1;
  if (typeof window !== "undefined") {
    const visits = localStorage.getItem("skipd_visit_count");
    if (visits) visitsCount = parseInt(visits) || 1;
  }

  // Status breakdown
  const deliveredCount = allOrders.filter(o => (o.status || "").toUpperCase() === "DELIVERED").length;
  const processingCount = allOrders.filter(o => (o.status || "").toUpperCase() === "PROCESSING" || (o.status || "").toUpperCase() === "CONFIRMED").length;
  const shippedCount = allOrders.filter(o => (o.status || "").toUpperCase() === "SHIPPED").length;
  const cancelledCount = allOrders.filter(o => (o.status || "").toUpperCase() === "CANCELLED").length;

  return {
    metrics: {
      total_revenue: totalRevenue,
      revenue_growth: totalOrders > 0 ? "+100% Real-Time" : "₹0 Real-Time",
      total_orders: totalOrders,
      orders_growth: totalOrders > 0 ? `${totalOrders} Orders Placed` : "0 Orders",
      total_customers: userCount,
      customers_growth: `${userCount} Registered`,
      products_sold: productsSold,
      products_growth: `${productsSold} Items Sold`,
      store_visits: visitsCount,
      visits_growth: `${visitsCount} Real Visits`
    },
    sales_overview: [
      { date: "May 19", revenue: 0, orders: 0 },
      { date: "May 20", revenue: 0, orders: 0 },
      { date: "May 21", revenue: 0, orders: 0 },
      { date: "May 22", revenue: 0, orders: 0 },
      { date: "May 23", revenue: 0, orders: 0 },
      { date: "May 24", revenue: 0, orders: 0 },
      { date: "Today", revenue: totalRevenue, orders: totalOrders }
    ],
    order_status: {
      total: totalOrders,
      breakdown: [
        { label: "Delivered", count: deliveredCount, percentage: totalOrders ? Math.round((deliveredCount / totalOrders) * 100) : 0, color: "#10b981" },
        { label: "Processing", count: processingCount, percentage: totalOrders ? Math.round((processingCount / totalOrders) * 100) : 0, color: "#3b82f6" },
        { label: "Shipped", count: shippedCount, percentage: totalOrders ? Math.round((shippedCount / totalOrders) * 100) : 0, color: "#f59e0b" },
        { label: "Cancelled", count: cancelledCount, percentage: totalOrders ? Math.round((cancelledCount / totalOrders) * 100) : 0, color: "#8b5cf6" }
      ]
    },
    top_selling_products: liveProducts.slice(0, 5).map((p, idx) => ({
      id: p.id,
      title: p.title,
      sold: Math.max(0, 10 - idx * 2),
      price: p.price,
      image: p.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200"
    })),
    recent_orders: allOrders.slice(0, 5).map(o => ({
      id: o.order_number || `SKIPD-${o.id}`,
      customer: o.user_name || o.email || "Store Customer",
      date: o.date || "Today",
      amount: o.total || 0,
      payment: o.payment_method || "UPI",
      status: o.status || "Processing"
    })),
    low_stock_alerts: liveProducts.filter(p => (p.stock_quantity ?? 100) <= 20).slice(0, 4).map(p => ({
      id: p.id,
      title: p.title,
      variant: (p as any).category_slug || p.category?.name || "Catalog Item",
      stock: p.stock_quantity ?? 0,
      image: p.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200"
    })),
    store_overview: {
      total_categories: 13,
      total_brands: 56,
      total_products: productsCount,
      total_customers: userCount,
      newsletter_subscribers: 4
    }
  };
}

// ─────────────────────────────────────────────
// 🔥 SALE EVENTS API SDK
// ─────────────────────────────────────────────
export async function fetchActiveSales() {
  try {
    const res = await fetch(`${API_BASE_URL}/sales`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Sales endpoint offline, returning fallback sale event.");
  }
  return [
    {
      id: 1,
      title: "Great Freedom Sale",
      slug: "great-freedom-sale",
      subtitle: "Reach Every Home, Join Every Celebration!",
      badge_text: "LIVE NOW",
      hero_bg_color: "#f97316",
      status: "ACTIVE",
      products: [
        { id: 101, product_id: 101, title: "Saree Premium Silk", handle: "saree-premium-silk", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400", sale_price: 299, original_price: 599, shipping_type: "Easy Ship", weight_range: "<500gm", savings: 300 },
        { id: 102, product_id: 102, title: "Cold Pressed Oil 1L", handle: "cold-pressed-oil-1l", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400", sale_price: 249, original_price: 499, shipping_type: "Easy Ship", weight_range: "1kg-2kg", savings: 250 },
        { id: 103, product_id: 103, title: "Velvet Cushion Cover", handle: "velvet-cushion-cover", image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400", sale_price: 800, original_price: 1500, shipping_type: "FC", weight_range: "<500gm", savings: 700 },
        { id: 104, product_id: 104, title: "20000mAh Power Bank", handle: "20000mah-power-bank", image: "https://images.unsplash.com/photo-1609592424089-a2e4b3c4342d?w=400", sale_price: 999, original_price: 1999, shipping_type: "Easy Ship", weight_range: "500gm-1kg", savings: 1000 },
        { id: 105, product_id: 105, title: "Nike Running Shoe", handle: "nike-running-shoe", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", sale_price: 700, original_price: 1400, shipping_type: "Easy Ship", weight_range: "500gm-1kg", savings: 700 },
        { id: 106, product_id: 106, title: "Leather Jacket", handle: "leather-jacket", image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400", sale_price: 999, original_price: 1999, shipping_type: "FC", weight_range: "1kg-2kg", savings: 1000 },
        { id: 107, product_id: 107, title: "FPV Toy Drone", handle: "fpv-toy-drone", image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400", sale_price: 999, original_price: 2499, shipping_type: "Easy Ship", weight_range: "500gm-1kg", savings: 1500 },
        { id: 108, product_id: 108, title: "Pro Headphones", handle: "pro-headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", sale_price: 950, original_price: 4999, shipping_type: "FC", weight_range: "500gm-1kg", savings: 4049 }
      ]
    }
  ];
}

export async function fetchSaleBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/sales/${slug}`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Single sale endpoint offline");
  }
  const sales = await fetchActiveSales();
  return sales.find((s: any) => s.slug === slug) || sales[0];
}

export async function fetchAdminAllSales() {
  try {
    const res = await fetch(`${API_BASE_URL}/sales/admin/all`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Admin sales list offline");
  }
  return [
    { id: 1, title: "Great Freedom Sale", slug: "great-freedom-sale", badge_text: "LIVE NOW", hero_bg_color: "#f97316", status: "ACTIVE", products_count: 8, created_at: new Date().toISOString() }
  ];
}

export async function createAdminSale(payload: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/sales/admin/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Create sale offline");
  }
  return { id: Date.now(), message: "Mock sale created!" };
}

export async function updateAdminSale(saleId: number, payload: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/sales/admin/${saleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Update sale offline");
  }
  return { message: "Mock sale updated", status: payload.status };
}

export async function deleteAdminSale(saleId: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/sales/admin/${saleId}`, { method: "DELETE" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Delete sale offline");
  }
  return { message: "Mock sale deleted" };
}

export async function bulkAddSaleProducts(saleId: number, products: any[]) {
  try {
    const res = await fetch(`${API_BASE_URL}/sales/admin/${saleId}/products/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Bulk add sale products offline");
  }
  return { message: `${products.length} products added` };
}

export async function removeSaleProduct(saleId: number, saleProductId: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/sales/admin/${saleId}/products/${saleProductId}`, { method: "DELETE" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Remove sale product offline");
  }
  return { message: "Product removed from sale" };
}

// ─────────────────────────────────────────────
// 🏠 HOMEPAGE SECTIONS API SDK
// ─────────────────────────────────────────────
export async function fetchHomepageSections() {
  try {
    const res = await fetch(`${API_BASE_URL}/homepage/sections`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Homepage sections offline");
  }
  return [];
}

export async function fetchAdminHomepageSections() {
  try {
    const res = await fetch(`${API_BASE_URL}/homepage/admin/all`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Admin homepage sections offline");
  }
  return [];
}

export async function createAdminHomepageSection(payload: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/homepage/admin/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Create section offline");
  }
  return { id: Date.now(), message: "Section created" };
}

export async function updateAdminHomepageSection(id: number, payload: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/homepage/admin/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Update section offline");
  }
  return { message: "Section updated" };
}

export async function deleteAdminHomepageSection(id: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/homepage/admin/${id}`, { method: "DELETE" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Delete section offline");
  }
  return { message: "Section deleted" };
}

// ─────────────────────────────────────────────
// 🔒 OTP AUTHENTICATION API SDK
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// 🔒 OTP AUTHENTICATION API SDK
// ─────────────────────────────────────────────
export async function requestOTP(emailOrPhone: string) {
  const mockOtp = String(Math.floor(100000 + Math.random() * 900000));

  try {
    const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_or_phone: emailOrPhone })
    });
    if (res.ok) {
      const data = await res.json();
      if (emailOrPhone.includes("@")) {
        try {
          const { sendForgotOTPNotification } = await import("lib/services/email-service");
          sendForgotOTPNotification(emailOrPhone.trim(), data.otp_demo || mockOtp);
        } catch (e) {}
      }
      return data;
    }
  } catch (e) {
    console.warn("[API SDK] Request OTP endpoint offline, using fallback OTP system");
  }

  // Trigger email notification service for OTP
  if (emailOrPhone.includes("@")) {
    try {
      const { sendForgotOTPNotification } = await import("lib/services/email-service");
      sendForgotOTPNotification(emailOrPhone.trim(), mockOtp);
    } catch (e) {}
  }

  return {
    status: "success",
    message: `6-digit OTP sent to ${emailOrPhone}`,
    expires_in_seconds: 60,
    otp_demo: mockOtp
  };
}

export async function verifyOTP(emailOrPhone: string, otp: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_or_phone: emailOrPhone, otp })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || "Verification failed");
    }
    return data;
  } catch (e: any) {
    if (e.message && e.message !== "Failed to fetch") {
      throw e;
    }
    console.warn("[API SDK] Verify OTP endpoint offline, accepting mock OTP");
  }

  const name = emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "Sachin Rawat";
  return {
    access_token: "jwt_token_demo_skipd_2026",
    user_name: name,
    email: emailOrPhone.includes("@") ? emailOrPhone : "customer@skipd.in",
    phone: !emailOrPhone.includes("@") ? emailOrPhone : "9876543210",
    can_change_password: true,
    message: "OTP verified successfully!"
  };
}

export async function changePassword(email: string, newPassword: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, new_password: newPassword })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Change password endpoint offline");
  }
  return { status: "success", message: "Password updated successfully!" };
}

export async function checkEmailRegistered(email: string) {
  const targetEmail = email.toLowerCase().trim();

  try {
    const res = await fetch(`${API_BASE_URL}/auth/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.exists) return data;
    }
  } catch (e) {
    console.warn("[API SDK] Check email endpoint offline");
  }

  // Strictly check against registered account list in fallback mode
  let registeredEmails = [
    "sachin.rawat@email.com",
    "sachinrawat6264384464@gmail.com",
    "customer@skipd.in",
    "admin@skipd.in",
    "sachin.rawat@example.com"
  ];

  if (typeof window !== "undefined") {
    try {
      const currentUser = localStorage.getItem("skipd_user");
      if (currentUser) {
        const pUser = JSON.parse(currentUser);
        if (pUser.email) registeredEmails.push(pUser.email.toLowerCase().trim());
      }

      const allReg = localStorage.getItem("skipd_registered_users");
      if (allReg) {
        const pList = JSON.parse(allReg);
        if (Array.isArray(pList)) {
          pList.forEach((u: any) => {
            const uEmail = typeof u === "string" ? u : u.email;
            if (uEmail) registeredEmails.push(uEmail.toLowerCase().trim());
          });
        }
      }
    } catch (e) {}
  }

  if (registeredEmails.includes(targetEmail)) {
    return { exists: true, email: targetEmail, message: "Registered Email Verified" };
  }
  return { exists: false, message: "This email is not registered with us" };
}

export async function resetUserPassword(email: string, newPassword: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, new_password: newPassword })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || "Password reset failed");
    }
    return data;
  } catch (e: any) {
    if (e.message && e.message !== "Failed to fetch") throw e;
    return { status: "success", message: "Password updated successfully!" };
  }
}

// ─────────────────────────────────────────────
// 📦 ADMIN PRODUCT MANAGEMENT SDK
// ─────────────────────────────────────────────
export async function createAdminProduct(payload: any) {
  let createdObj: any = null;
  try {
    const res = await fetch(`${API_BASE_URL}/products/admin/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) createdObj = await res.json();
  } catch (e) {
    console.warn("[API SDK] Create product offline");
  }

  if (!createdObj) {
    createdObj = {
      id: Date.now(),
      title: payload.title,
      handle: payload.handle || (payload.title || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: payload.description || "Product item",
      price: payload.price,
      compare_at_price: payload.compare_at_price,
      stock_quantity: payload.stock_quantity ?? 50,
      featured: payload.featured ?? true,
      images: payload.images && payload.images.length > 0 ? payload.images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
      tags: payload.tags || ["bestseller"],
      category: { name: payload.category_slug || "General", slug: payload.category_slug || "general" },
      category_slug: payload.category_slug || "general"
    };
  }

  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem("skipd_custom_products") || "[]");
      const updated = [createdObj, ...existing];
      localStorage.setItem("skipd_custom_products", JSON.stringify(updated));
    } catch {}
  }

  if (!MOCK_PRODUCTS.some(p => p.id === createdObj.id)) {
    MOCK_PRODUCTS.unshift(createdObj);
  }

  return createdObj;
}

export async function updateAdminProduct(id: number | string, payload: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/admin/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Update product offline");
  }

  if (typeof window !== "undefined") {
    try {
      // 1. Update in skipd_custom_products if custom
      const existingCustom = JSON.parse(localStorage.getItem("skipd_custom_products") || "[]");
      const updatedCustom = existingCustom.map((p: any) => (p.id === id || String(p.id) === String(id)) ? { ...p, ...payload } : p);
      localStorage.setItem("skipd_custom_products", JSON.stringify(updatedCustom));

      // 2. Store in skipd_updated_products map for all products
      const existingUpdates = JSON.parse(localStorage.getItem("skipd_updated_products") || "{}");
      existingUpdates[String(id)] = { ...(existingUpdates[String(id)] || {}), ...payload };
      localStorage.setItem("skipd_updated_products", JSON.stringify(existingUpdates));
    } catch {}
  }

  const idx = MOCK_PRODUCTS.findIndex(p => p.id === id || String(p.id) === String(id));
  if (idx !== -1) {
    MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], ...payload };
  }

  return { message: "Product updated successfully" };
}

export async function deleteAdminProduct(id: number | string) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/admin/${id}`, { method: "DELETE" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Delete product offline");
  }

  if (typeof window !== "undefined") {
    try {
      // 1. Remove from skipd_custom_products
      const existing = JSON.parse(localStorage.getItem("skipd_custom_products") || "[]");
      const updated = existing.filter((p: any) => p.id !== id && String(p.id) !== String(id));
      localStorage.setItem("skipd_custom_products", JSON.stringify(updated));

      // 2. Add to skipd_deleted_product_ids array
      const existingDeletions = JSON.parse(localStorage.getItem("skipd_deleted_product_ids") || "[]");
      if (!existingDeletions.includes(String(id))) {
        existingDeletions.push(String(id));
      }
      localStorage.setItem("skipd_deleted_product_ids", JSON.stringify(existingDeletions));
    } catch {}
  }

  const idx = MOCK_PRODUCTS.findIndex(p => p.id === id || String(p.id) === String(id));
  if (idx !== -1) {
    MOCK_PRODUCTS.splice(idx, 1);
  }

  return { message: "Product deleted successfully" };
}

export async function seedCatalogProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products/admin/bulk-seed`, { method: "POST" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Bulk seed offline");
  }
  return { message: "10 catalog products seeded successfully" };
}

export async function fetchAdminOrders() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/orders`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Fetch admin orders offline fallback");
  }
  return null;
}

export async function fetchAdminCustomers() {
  try {
    const res = await fetch(`${API_BASE_URL}/users/admin/all`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Fetch admin customers offline fallback");
  }
  return null;
}

export async function deleteAdminUser(id: number | string, email?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/admin/${id}`, { method: "DELETE" });
    if (res.ok) {
      const data = await res.json();
      purgeLocalCustomerData(email || String(id));
      return data;
    }
  } catch (e) {
    console.warn("[API SDK] Delete admin user offline fallback");
  }

  purgeLocalCustomerData(email || String(id));
  return { status: "success", message: `User #${id} and all schema data deleted` };
}

export function purgeLocalCustomerData(emailOrId: string) {
  if (typeof window === "undefined") return;
  try {
    const target = emailOrId.toLowerCase().trim();

    // 1. Purge from skipd_registered_users
    const registered = localStorage.getItem("skipd_registered_users");
    if (registered) {
      const parsed = JSON.parse(registered);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((u: any) => {
          const uEmail = (typeof u === "string" ? u : u.email || "").toLowerCase().trim();
          const uId = String(u.id || "");
          return uEmail !== target && uId !== target && !uEmail.includes(target);
        });
        localStorage.setItem("skipd_registered_users", JSON.stringify(filtered));
      }
    }

    // 2. Purge from skipd_all_registered_users
    const allReg = localStorage.getItem("skipd_all_registered_users");
    if (allReg) {
      const parsed = JSON.parse(allReg);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((u: any) => {
          const uEmail = (typeof u === "string" ? u : u.email || "").toLowerCase().trim();
          const uId = String(u.id || "");
          return uEmail !== target && uId !== target;
        });
        localStorage.setItem("skipd_all_registered_users", JSON.stringify(filtered));
      }
    }

    // 3. Purge current logged in user if it matches target
    const currentUser = localStorage.getItem("skipd_user");
    if (currentUser) {
      const pUser = JSON.parse(currentUser);
      const curEmail = (pUser.email || "").toLowerCase().trim();
      const curId = String(pUser.uid || pUser.id || "");
      if (curEmail === target || curId === target) {
        localStorage.removeItem("skipd_user");
        localStorage.removeItem("skipd_token");
        window.dispatchEvent(new Event("skipd_auth_changed"));
      }
    }

    // 4. Purge customer return requests
    const returnQueries = localStorage.getItem("skipd_return_queries");
    if (returnQueries) {
      const parsed = JSON.parse(returnQueries);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((q: any) => (q.email || "").toLowerCase().trim() !== target);
        localStorage.setItem("skipd_return_queries", JSON.stringify(filtered));
      }
    }
  } catch (err) {
    console.error("Failed to purge customer local data:", err);
  }
}

export async function fetchAdminReviews() {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/admin/all`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Fetch admin reviews offline fallback");
  }
  return null;
}

export async function deleteAdminReview(id: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/admin/${id}`, { method: "DELETE" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Delete admin review offline fallback");
  }
  return { status: "success" };
}

export async function fetchAdminPayments() {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/admin/all`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Fetch admin payments offline fallback");
  }
  return null;
}

export async function fetchAdminShipments() {
  try {
    const res = await fetch(`${API_BASE_URL}/shipping/admin/all`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Fetch admin shipments offline fallback");
  }
  return null;
}

export async function fetchCoupons() {
  try {
    const res = await fetch(`${API_BASE_URL}/coupons/all`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Fetch coupons offline fallback");
  }
  return null;
}

export async function createCoupon(data: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/coupons/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Create coupon offline fallback");
  }
  return null;
}











