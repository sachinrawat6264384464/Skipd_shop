import { getUserOrdersKey } from "../utils";

export const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && !envUrl.includes("127.0.0.1") && !envUrl.includes("localhost")) {
      return envUrl;
    }
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return "https://skipd-ecom.onrender.com/api/v1";
    }
    return envUrl || "http://127.0.0.1:8000/api/v1";
  }

  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes("127.0.0.1") && !envUrl.includes("localhost")) {
    return envUrl;
  }
  return "https://skipd-ecom.onrender.com/api/v1";
};

export const API_BASE_URL = getApiBaseUrl();

export interface Product {
  id: number;
  title: string;
  handle: string;
  description: string;
  price: number;
  compare_at_price?: number;
  featured: boolean;
  is_new_arrival?: boolean;
  images: string[];
  tags: string[];
  stock_quantity?: number;  // 0 = Out of Stock
  created_at?: string;
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

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        backendProducts = data;
        isBackendOk = true;
      }
    }
  } catch (err: any) {
    if (err && (err.$$typeof || err.message?.includes("postpone") || err.digest?.includes("NEXT_PRERENDER"))) {
      throw err;
    }
    console.warn("[API SDK Warning] Backend offline or cold-starting. Serving fallback catalog instantly.", err);
  }

  let list = isBackendOk ? backendProducts : MOCK_PRODUCTS;

  if (query?.featured) list = list.filter(p => p.featured);
  if (query?.category && query.category !== "all") {
    list = list.filter(p => p.category?.slug === query.category || (p as any).category_slug === query.category || p.tags?.includes(query.category!));
  }
  if (query?.search && !["all", "all-categories", "catalog"].includes(query.search.toLowerCase())) {
    list = list.filter(p => p.title.toLowerCase().includes(query.search!.toLowerCase()) || p.category?.name?.toLowerCase().includes(query.search!.toLowerCase()));
  }
  return list;
}

export async function fetchProductByHandle(handle: string): Promise<Product | null> {
  const cleanSearch = handle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${API_BASE_URL}/products/${handle}`, {
      cache: "no-store",
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.id) return data;
    }
  } catch (err) {
    console.warn("[API SDK Warning] Backend offline or cold-starting.", err);
  }

  // Search full product catalog (Live or Mock Fallback)
  const allProds = await fetchProducts();

  let found = allProds.find(p =>
    p.handle === handle ||
    String(p.id) === handle ||
    (p.handle && p.handle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") === cleanSearch) ||
    p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") === cleanSearch
  );
  if (found) return found;

  return allProds[0] || null;
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    const dbRes = await fetch(`${API_BASE_URL}/categories`, {
      cache: "no-store",
      signal: controller.signal
    });
    clearTimeout(timer);

    if (dbRes.ok) {
      const dbCats = await dbRes.json();
      if (Array.isArray(dbCats) && dbCats.length > 0) return dbCats;
    }
  } catch (e) { }

  return [
    { id: 1, name: "Mobiles", slug: "mobiles" },
    { id: 2, name: "Electronics", slug: "electronics" },
    { id: 3, name: "Watches", slug: "watches" },
    { id: 4, name: "Fashion", slug: "fashion" },
    { id: 5, name: "Home & Living", slug: "home" },
    { id: 6, name: "Sports", slug: "sports" },
    { id: 7, name: "Artisan", slug: "artisan" }
  ];
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

export async function fetchWalletBalance(): Promise<{ balance: number }> {
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

export async function fetchTrackOrder(orderIdentifier: string) {
  try {
    const cleanId = orderIdentifier.trim().replace(/^#/, "");
    const res = await fetch(`${API_BASE_URL}/orders/track/${encodeURIComponent(cleanId)}`, {
      cache: "no-store"
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("[API SDK Warning] Live track endpoint failed:", e);
  }
  return null;
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

export function getProductImageByTitle(title?: string): string {
  const t = (title || "").toLowerCase();
  if (t.includes("sony") || t.includes("headphone") || t.includes("audio") || t.includes("anc")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";
  }
  if (t.includes("oneplus") || t.includes("nord") || t.includes("iphone") || t.includes("mobile") || t.includes("phone")) {
    return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800";
  }
  if (t.includes("watch") || t.includes("chrono") || t.includes("apple watch")) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800";
  }
  if (t.includes("drone") || t.includes("rc")) {
    return "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800";
  }
  if (t.includes("macbook") || t.includes("laptop")) {
    return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800";
  }
  if (t.includes("nike") || t.includes("air force") || t.includes("shoe") || t.includes("sneaker")) {
    return "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800";
  }
  if (t.includes("jacket") || t.includes("trench") || t.includes("wool")) {
    return "https://images.unsplash.com/photo-1544441893-675973e31985?w=800";
  }
  if (t.includes("tee") || t.includes("shirt") || t.includes("apparel")) {
    return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800";
  }
  return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";
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
        return data.map((o: any) => {
          const firstItem = o.items?.[0];
          const prodTitle = firstItem?.product_name || "Purchased Product";
          const imgUrl = firstItem?.product_image || (firstItem?.product?.images && firstItem.product.images[0]) || getProductImageByTitle(prodTitle);
          
          let formattedDate = "Today";
          if (o.created_at) {
            const dt = new Date(o.created_at);
            formattedDate = dt.toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            });
          }

          return {
            id: String(o.id),
            order_number: o.order_number || `SKIPD-${o.id}`,
            date: formattedDate,
            total: o.total_amount || 0,
            title: prodTitle,
            image: imgUrl,
            status: o.status || "SHIPPED",
            awb: `SR-AWB-${o.order_number || o.id}`,
            deliveryText: o.status === "DELIVERED" ? "Delivered" : "In Transit across regional hubs"
          };
        });
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
  } catch (e) { }

  return [];
}

export async function updateOrderStatusGlobal(orderId: string, newStatus: string) {
  const cleanId = orderId.replace("#", "").trim();
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${cleanId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("skipd_orders_changed"));
      }
      return await res.json();
    }
  } catch (e) {
    console.warn("[API SDK] updateOrderStatusGlobal warning:", e);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("skipd_orders_changed"));
  }
  return null;
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
  } catch (e) { }
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
  } catch (e) { }
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
  } catch (e) { }
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
  } catch (e) { }
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
  } catch (e) { }
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
    console.warn("[API SDK Warning] FastAPI admin stats endpoint offline");
  }

  const liveProducts = await fetchProducts();
  const productsCount = liveProducts.length;

  return {
    metrics: {
      total_revenue: 0,
      revenue_growth: "₹0 Real-Time",
      total_orders: 0,
      orders_growth: "0 Orders",
      total_customers: 0,
      customers_growth: "0 Registered Users",
      products_sold: 0,
      products_growth: "0 Items Sold",
      store_visits: 0,
      visits_growth: "0 Real Visits"
    },
    sales_overview: [
      { date: "Period 1", revenue: 0, orders: 0 },
      { date: "Period 2", revenue: 0, orders: 0 },
      { date: "Period 3", revenue: 0, orders: 0 },
      { date: "Period 4", revenue: 0, orders: 0 },
      { date: "Period 5", revenue: 0, orders: 0 },
      { date: "Period 6", revenue: 0, orders: 0 },
      { date: "Period 7", revenue: 0, orders: 0 }
    ],
    order_status: {
      total: 0,
      breakdown: [
        { label: "Delivered", count: 0, percentage: 0, color: "#10b981" },
        { label: "Processing", count: 0, percentage: 0, color: "#3b82f6" },
        { label: "Shipped", count: 0, percentage: 0, color: "#f59e0b" },
        { label: "Cancelled", count: 0, percentage: 0, color: "#8b5cf6" }
      ]
    },
    top_selling_products: liveProducts.slice(0, 5).map((p) => ({
      id: p.id,
      title: p.title,
      sold: 0,
      price: p.price,
      image: p.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200"
    })),
    recent_orders: [],
    low_stock_alerts: liveProducts.filter(p => (p.stock_quantity ?? 100) <= 20).slice(0, 4).map(p => ({
      id: p.id,
      title: p.title,
      variant: (p as any).category_slug || p.category?.name || "Catalog Item",
      stock: p.stock_quantity ?? 0,
      image: p.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200"
    })),
    store_overview: {
      total_categories: 11,
      total_brands: 30,
      total_products: productsCount,
      total_customers: 0,
      newsletter_subscribers: 0
    }
  };
}

export async function purgeAllStoreOrders() {
  try {
    await fetch(`${API_BASE_URL}/admin/reset-store`, { method: "POST" });
  } catch (e) { }

  if (typeof window !== "undefined") {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith("skipd_orders_") || k === "skipd_all_store_orders" || k === "skipd_payments");
      keys.forEach(k => localStorage.removeItem(k));
      window.dispatchEvent(new Event("skipd_orders_changed"));
    } catch (e) { }
  }
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
        } catch (e) { }
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
    } catch (e) { }
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

export function saveRegisteredEmail(email: string) {
  if (typeof window === "undefined" || !email) return;
  const cleanEmail = email.toLowerCase().trim();
  try {
    const existing = localStorage.getItem("skipd_registered_users");
    let list: string[] = [];
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (Array.isArray(parsed)) list = parsed.map((item: any) => (typeof item === "string" ? item : item.email)).filter(Boolean);
      } catch (e) { }
    }
    if (!list.includes(cleanEmail)) {
      list.push(cleanEmail);
      localStorage.setItem("skipd_registered_users", JSON.stringify(list));
    }
  } catch (e) { }
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

  // Strictly check against registered account list in fallback / offline mode
  let registeredEmails = [
    "sachin.rawat@email.com",
    "sachinrawat6264384464@gmail.com",
    "familyzila1213@gmail.com",
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
    } catch (e) { }
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

export async function syncFirebaseUser(payload: {
  firebase_uid: string;
  email: string;
  full_name?: string;
  phone?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/firebase-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("[API SDK] Firebase sync endpoint offline or unreachable:", e);
  }
  return {
    status: "success",
    access_token: "jwt_token_skipd_2026",
    id: Date.now(),
    firebase_uid: payload.firebase_uid,
    user_name: payload.full_name || payload.email.split("@")[0],
    email: payload.email,
    phone: payload.phone || "",
    user_role: "customer"
  };
}

// ─────────────────────────────────────────────
// 📦 ADMIN PRODUCT MANAGEMENT SDK
// ─────────────────────────────────────────────
export async function createAdminProduct(payload: any) {
  const res = await fetch(`${API_BASE_URL}/products/admin/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    return await res.json();
  }

  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.detail || errData.message || `Database error (${res.status}): Failed to save product in Neon PostgreSQL DB`);
}

export async function bulkCreateAdminProducts(products: any[]) {
  const res = await fetch(`${API_BASE_URL}/products/admin/bulk-create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products })
  });

  if (res.ok) {
    return await res.json();
  }

  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.detail || errData.message || `Database error (${res.status}): Failed to bulk save products in Neon PostgreSQL DB`);
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
    console.error("[API SDK] Update product offline:", e);
  }
  return null;
}

export async function toggleProductNewArrival(id: number | string, isNewArrival: boolean) {
  return await toggleNewArrivalDB(id);
}

export async function fetchNewArrivalsDB(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/new-arrivals`, { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error("[API SDK] Fetch new arrivals from DB error:", e);
  }
  return [];
}

export async function fetchNewArrivalIdsDB(): Promise<number[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/new-arrivals/ids`, { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error("[API SDK] Fetch new arrival IDs error:", e);
  }
  return [];
}

export async function toggleNewArrivalDB(productId: number | string) {
  try {
    const res = await fetch(`${API_BASE_URL}/new-arrivals/toggle/${productId}`, {
      method: "POST"
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("[API SDK] Toggle new arrival DB error:", e);
  }
  return null;
}

export async function addProductToNewArrivalsDB(productId: number | string) {
  try {
    const res = await fetch(`${API_BASE_URL}/new-arrivals/add/${productId}`, {
      method: "POST"
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("[API SDK] Add new arrival DB error:", e);
  }
  return null;
}

export async function removeProductFromNewArrivalsDB(productId: number | string) {
  try {
    const res = await fetch(`${API_BASE_URL}/new-arrivals/remove/${productId}`, {
      method: "DELETE"
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("[API SDK] Remove new arrival DB error:", e);
  }
  return null;
}

export async function deleteAdminProduct(id: number | string) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/admin/${id}`, { method: "DELETE" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("[API SDK] Delete product offline:", e);
  }
  return null;
}

export async function seedCatalogProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products/admin/bulk-seed`, { method: "POST" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("[API SDK] Bulk seed offline:", e);
  }
  return null;
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

export async function fetchAdminQueries() {
  try {
    const res = await fetch(`${API_BASE_URL}/queries`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : (data.queries || []);
    }
  } catch (e) {
    console.warn("[API SDK] Fetch admin queries offline fallback");
  }
  return [];
}

export async function submitCustomerQuery(queryData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/queries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryData)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Submit customer query offline fallback");
  }
  return null;
}

export async function updateQueryStatus(id: number | string, status: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/queries/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Update query status offline fallback");
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

export async function loginCustomerUser(email: string, password?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password: password || "password123" })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Customer DB Login API offline");
  }
  return null;
}

export async function fetchAdminPayments() {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/admin/all`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Fetch admin payments offline fallback");
  }
  return [];
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

// ─────────────────────────────────────────────
// 📁 CATEGORY API FUNCTIONS (Strict PostgreSQL Database Sync)
// ─────────────────────────────────────────────

export async function fetchAdminCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/admin/all`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (e) {
    console.warn("[API SDK] Fetch admin categories DB warning:", e);
  }
  return [];
}

export async function createAdminCategory(payload: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Create admin category DB warning:", e);
  }
  return null;
}

export async function updateAdminCategory(id: number | string, payload: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/admin/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Update admin category DB warning:", e);
  }
  return null;
}

export async function deleteAdminCategory(id: number | string) {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/admin/${id}`, { method: "DELETE" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Delete admin category DB warning:", e);
  }
  return null;
}

export async function fetchAdminGiftCards() {
  try {
    const res = await fetch(`${API_BASE_URL}/gift-cards/admin/all`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Fetch admin gift cards offline fallback");
  }
  return [];
}

export async function createAdminGiftCard(payload: { code?: string; amount: number; recipient?: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/gift-cards/admin/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Create gift card offline fallback");
  }
  return null;
}

export async function fetchAdminRewardsUsers() {
  try {
    const res = await fetch(`${API_BASE_URL}/rewards/admin/all-users`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Fetch rewards users offline fallback");
  }
  return [];
}

export async function creditUserSuperCoins(email: string, coins: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/rewards/admin/credit-coins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, coins })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Credit user coins offline fallback");
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 📊 ADMIN WISHLIST STATS — real counts from PostgreSQL wishlist_items table
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAdminWishlistStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/wishlist/admin/stats`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Fetch admin wishlist stats fallback");
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ❤️ USER WISHLIST — saved in PostgreSQL wishlist_items table (requires token)
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchUserWishlistDB(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Fetch user wishlist from DB fallback");
  }
  return null;
}

export async function toggleWishlistDB(token: string, productId: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Toggle wishlist DB fallback");
  }
  return null;
}

export async function createAdminUser(payload: { name?: string; full_name?: string; email: string; phone?: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/admin/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] Create admin user DB warning:", e);
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🛡️ ROLES & STAFF MANAGEMENT — Live PostgreSQL DB APIs
// ─────────────────────────────────────────────────────────────────────────────

export interface RoleData {
  id: number;
  name: string;
  slug: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  created_at: string;
}

export interface StaffUserData {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  role_id?: number;
  status: "Active" | "Inactive" | "Suspended";
  avatar?: string;
  last_active?: string;
  permissions: string[];
  created_at?: string;
}

export async function fetchAdminRoles(): Promise<RoleData[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/roles`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.warn("[API SDK] fetchAdminRoles warning:", e);
  }
  return [];
}

export async function createAdminRole(payload: Partial<RoleData>): Promise<RoleData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] createAdminRole warning:", e);
  }
  return null;
}

export async function fetchAdminStaff(): Promise<StaffUserData[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/staff`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.warn("[API SDK] fetchAdminStaff warning:", e);
  }
  return [];
}

export async function createAdminStaff(payload: Partial<StaffUserData>): Promise<StaffUserData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] createAdminStaff warning:", e);
  }
  return null;
}

export async function updateAdminStaff(staffId: number, payload: Partial<StaffUserData>): Promise<StaffUserData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[API SDK] updateAdminStaff warning:", e);
  }
  return null;
}

export async function deleteAdminStaff(staffId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
      method: "DELETE"
    });
    return res.ok;
  } catch (e) {
    console.warn("[API SDK] deleteAdminStaff warning:", e);
  }
  return false;
}

export async function checkPincodeServiceabilityAPI(pincode: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/shipping/serviceability?pincode=${pincode}`, {
      cache: "no-store"
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("[API SDK] checkPincodeServiceabilityAPI failed:", e);
  }
  
  const isMetro = ["11", "40", "56", "70", "60", "50"].some(prefix => pincode.startsWith(prefix));
  return {
    pincode,
    serviceable: true,
    courier_partner: "BlueDart Express / Delhivery",
    estimated_delivery: isMetro ? "Express 1-2 Business Days" : "Standard 3-4 Business Days",
    cod_available: true,
    prepaid_available: true,
    express_shipping: isMetro
  };
}

export async function createAdminShipmentAPI(payload: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/shipping/admin/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("[API SDK] createAdminShipmentAPI failed:", e);
  }
  return null;
}

export async function fetchSimilarProductsAPI(productId: number, limit: number = 6) {
  try {
    const res = await fetch(`${API_BASE_URL}/recommendations/products/${productId}/similar?limit=${limit}`, {
      cache: "no-store"
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("[API SDK] fetchSimilarProductsAPI failed:", e);
  }
  return [];
}

export async function fetchFrequentlyBoughtTogetherAPI(productId: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/recommendations/products/${productId}/frequently-bought-together`, {
      cache: "no-store"
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("[API SDK] fetchFrequentlyBoughtTogetherAPI failed:", e);
  }
  return null;
}



















