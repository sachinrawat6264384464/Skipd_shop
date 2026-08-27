"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "components/auth/auth-provider";
import { getUserCartKey, getCartStore, saveCartStore } from "lib/utils";
import { BuyNowButton } from "components/auth/buy-now-button";
import { ProductZoomMagnifier } from "./product-zoom-magnifier";
import { toast } from "sonner";
import { useWishlist } from "components/wishlist/wishlist-context";
import { FrequentlyBoughtTogether } from "./frequently-bought-together";
import { RecommendedProductsGrid } from "./recommended-products-grid";
import { ProductReviewsSection } from "components/reviews/product-reviews-section";
import { PWAInstallPrompt } from "components/pwa/pwa-install-prompt";

interface ProductDetailViewProps {
  product: {
    id: number;
    title: string;
    handle: string;
    description: string;
    price: number;
    compare_at_price?: number;
    stock_quantity?: number;
    category?: { name: string; slug: string };
    images: string[];
    tags?: string[];
    colors?: string[] | { name: string; price: number; mrp?: number }[];
  };
  relatedProducts: any[];
}

const FALLBACK_RECS = [
  { id: 101, title: "boAt Rockerz 450 Pro Bluetooth Headphones", handle: "boat-rockerz-450-pro", price: 1499, compare_at_price: 3990, images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400"] },
  { id: 102, title: "OnePlus Nord 6 5G (12GB+256GB)", handle: "oneplus-nord-6", price: 44499, compare_at_price: 52999, images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"] },
  { id: 103, title: "Apple Watch Series 9 GPS 45mm Midnight", handle: "apple-watch-series-9", price: 41900, compare_at_price: 44900, images: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400"] },
  { id: 104, title: "Nike Air Force 1 07 Triple White Sneakers", handle: "nike-air-force-1", price: 7495, compare_at_price: 8995, images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400"] },
  { id: 105, title: "Apple MacBook Air M2 13.6-inch Space Grey", handle: "apple-macbook-air-m2", price: 99990, compare_at_price: 114900, images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"] },
  { id: 106, title: "Noise ColorFit Pro 5 Smartwatch Jet Black", handle: "noise-colorfit-pro-5", price: 3499, compare_at_price: 5999, images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"] },
  { id: 107, title: "RC 4K Camera Pro Toy Drone Quadcopter", handle: "rc-4k-camera-pro-toy-drone", price: 3999, compare_at_price: 7999, images: ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400"] },
  { id: 108, title: "Minimalist Heavyweight Graphic Tee 240 GSM", handle: "minimalist-graphic-tee", price: 1299, compare_at_price: 1999, images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400"] },
  { id: 109, title: "Winter Heavy Fleece Trench Jacket Black", handle: "winter-trench-jacket", price: 3999, compare_at_price: 6999, images: ["https://images.unsplash.com/photo-1544441893-675973e31985?w=400"] },
  { id: 110, title: "Sony WH-1000XM5 Studio Headphones", handle: "sony-wh-1000xm5", price: 24999, compare_at_price: 29999, images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"] },
  { id: 111, title: "65W Fast Wall Adapter Charger", handle: "65w-fast-charger", price: 599, compare_at_price: 1299, images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400"] },
  { id: 112, title: "GadgetBite Headphone Hard EVA Case Storage Bag", handle: "headphone-hard-case", price: 400, compare_at_price: 800, images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400"] },
  { id: 113, title: "20000mAh Dual Port Power Bank", handle: "20000mah-power-bank", price: 999, compare_at_price: 1999, images: ["https://images.unsplash.com/photo-1609592424089-a2e4b3c4342d?w=400"] },
  { id: 114, title: "Cold Pressed Organic Coconut Oil 1L", handle: "cold-pressed-coconut-oil", price: 249, compare_at_price: 499, images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400"] },
];

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [warrantyAdded, setWarrantyAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(
    product.images[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
  );
  const [exchangeOption, setExchangeOption] = useState<"without" | "with">("without");
  const [openSubNav, setOpenSubNav] = useState<string | null>(null);

  // Determine Size Category: 'shoes' | 'clothing' | 'none'
  const catName = typeof product.category === "object" ? (product.category?.name || "") : (product.category || (product as any).category_name || "");
  const subCatName = (product as any).sub_category || (product as any).subCategory || "";
  const tagsText = Array.isArray(product.tags) ? product.tags.join(" ") : (product.tags || "");
  const sizeSearchText = `${catName} ${subCatName} ${tagsText} ${product.title || ""}`.toLowerCase();

  const isShoesProduct = /\b(shoe|shoes|footwear|sneaker|sneakers|boot|boots|slipper|slippers|sandal|sandals|loafer|heels|foot wear)\b/i.test(sizeSearchText);
  const isClothingProduct = /\b(clothes|clothing|fashion|apparel|wear|t-shirt|tshirt|shirt|shirts|pant|pants|trousers|jeans|jacket|jackets|dress|dresses|top|tops|winterwear|garment|garments|hoodie|sweater|kurta|saree|suit|home living|home & living|home_living|bedsheet|curtains|bedding|pillow|towel|mat|blanket|quilt)\b/i.test(sizeSearchText);

  let sizeType: "clothing" | "shoes" | "none" = "none";
  if (isShoesProduct) {
    sizeType = "shoes";
  } else if (isClothingProduct) {
    sizeType = "clothing";
  } else if ((product as any).size) {
    const szVal = String((product as any).size);
    if (/^\d+|uk|us/i.test(szVal)) {
      sizeType = "shoes";
    } else {
      sizeType = "clothing";
    }
  }

  const sizesList = sizeType === "shoes" ? ["6", "7", "8", "9"] : ["S", "M", "L", "XL"];
  const recommendedSize = sizeType === "shoes" ? "8" : "L";
  const alsoAvailableSize = sizeType === "shoes" ? "UK 10" : "Plus";

  // States for Size, Quantity & Size Chart Modal
  const [selectedSize, setSelectedSize] = useState<string>(sizeType === "shoes" ? "8" : "S");
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeChart, setShowSizeChart] = useState<boolean>(false);

  // States for Add-on Items and Toast
  const [addon1Added, setAddon1Added] = useState(true);
  const [addon2Added, setAddon2Added] = useState(true);
  const [cartAddedToast, setCartAddedToast] = useState(false);

  // Dynamic Color Variants parsing
  const rawColors = (product as any).colors || (product as any).variant_color;
  let parsedColorList: { name: string; price: number; mrp: number }[] = [];

  if (Array.isArray(rawColors) && rawColors.length > 0) {
    parsedColorList = rawColors.map((c: any) => {
      if (typeof c === "string") {
        return {
          name: c,
          price: product.price,
          mrp: product.compare_at_price || Math.round(product.price * 1.25)
        };
      }
      return {
        name: c.name || "Default",
        price: c.price || product.price,
        mrp: c.mrp || product.compare_at_price || Math.round(product.price * 1.25)
      };
    });
  } else if (typeof rawColors === "string" && rawColors.trim().length > 0) {
    parsedColorList = rawColors.split(",").map((c: string) => ({
      name: c.trim(),
      price: product.price,
      mrp: product.compare_at_price || Math.round(product.price * 1.25)
    }));
  }

  if (parsedColorList.length === 0) {
    parsedColorList = [
      { name: "Default Edition", price: product.price, mrp: product.compare_at_price || Math.round(product.price * 1.25) }
    ];
  }

  const [selectedColor, setSelectedColor] = useState(parsedColorList[0]?.name || "Default");

  // Dynamic Bullet Points (ABOUT THIS ITEM)
  const rawHighlights = (product as any).highlights || (product as any).features || (product as any).about_item || (product as any).bullet_points;
  let parsedHighlights: string[] = [];

  if (Array.isArray(rawHighlights) && rawHighlights.length > 0) {
    parsedHighlights = rawHighlights.filter(Boolean).map(String);
  } else if (typeof rawHighlights === "string" && rawHighlights.trim().length > 0) {
    try {
      const jsonParsed = JSON.parse(rawHighlights);
      if (Array.isArray(jsonParsed)) {
        parsedHighlights = jsonParsed.filter(Boolean).map(String);
      } else {
        parsedHighlights = rawHighlights.split(/[\n,]/).map(s => s.replace(/^[•\-\*]\s*/, "").trim()).filter(Boolean);
      }
    } catch (e) {
      parsedHighlights = rawHighlights.split(/[\n,]/).map(s => s.replace(/^[•\-\*]\s*/, "").trim()).filter(Boolean);
    }
  } else if (product.description) {
    parsedHighlights = product.description.split(".").map(s => s.trim()).filter(s => s.length > 8).slice(0, 6);
  }

  // Dynamic Box Contents (WHAT IS IN THE BOX)
  const rawBoxContents = (product as any).box_contents || (product as any).box_items || (product as any).in_box;
  let parsedBoxContents: { icon: string; title: string; image?: string }[] = [];

  let boxItemsList: any[] = [];
  if (Array.isArray(rawBoxContents) && rawBoxContents.length > 0) {
    boxItemsList = rawBoxContents;
  } else if (typeof rawBoxContents === "string" && rawBoxContents.trim().length > 0) {
    try {
      const jsonP = JSON.parse(rawBoxContents);
      if (Array.isArray(jsonP)) boxItemsList = jsonP;
      else boxItemsList = rawBoxContents.split(",").map(s => s.trim());
    } catch (e) {
      boxItemsList = rawBoxContents.split(",").map(s => s.trim());
    }
  }

  if (boxItemsList.length > 0) {
    parsedBoxContents = boxItemsList.filter(Boolean).map((item: any) => {
      if (typeof item === "object" && item !== null) {
        const title = item.title || item.name || "Item";
        const image = item.image || item.img || item.image_url;
        const icon = item.icon || (
          title.toLowerCase().includes("cable") || title.toLowerCase().includes("charger") ? "🔌" :
          title.toLowerCase().includes("manual") || title.toLowerCase().includes("card") ? "📖" :
          title.toLowerCase().includes("case") || title.toLowerCase().includes("bag") ? "💼" :
          title.toLowerCase().includes("phone") || title.toLowerCase().includes("device") || title.toLowerCase().includes("unit") || title.toLowerCase().includes("headphone") ? "🎧" : "📦"
        );
        return { icon, title, image };
      }
      const name = String(item);
      const icon = name.toLowerCase().includes("cable") || name.toLowerCase().includes("charger") ? "🔌" :
                   name.toLowerCase().includes("manual") || name.toLowerCase().includes("card") ? "📖" :
                   name.toLowerCase().includes("case") || name.toLowerCase().includes("bag") ? "💼" :
                   name.toLowerCase().includes("phone") || name.toLowerCase().includes("device") || name.toLowerCase().includes("unit") || name.toLowerCase().includes("headphone") ? "🎧" : "📦";
      return { icon, title: name };
    });
  }

  // Add to Cart handler (Requires Login)
  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    // 🔒 REQUIRE LOGIN FOR ADD TO CART
    const token = typeof window !== "undefined" ? localStorage.getItem("ecom_token") : null;
    if (!token) {
      toast.error("🔒 Please sign in to add items to your cart", {
        description: "Redirecting you to the login page...",
        duration: 2500
      });
      setTimeout(() => {
        router.push("/auth/login");
      }, 500);
      return;
    }

    if (product.stock_quantity === 0) {
      toast.error("🚫 This product is currently out of stock", {
        description: "Please check back later or select another item.",
        duration: 2500
      });
      return;
    }

    const existing = getCartStore();
    const sizePart = sizeType !== "none" && selectedSize ? ` / Size: ${selectedSize}` : "";
    const itemToAdd = {
      id: product.id,
      handle: product.handle,
      title: `${product.title} (${selectedColor}${sizePart})`,
      price: product.price,
      quantity: quantity,
      image: selectedImage
    };

    const idx = existing.findIndex((i: any) => {
      if (i.id != null && product.id != null && String(i.id) === String(product.id)) return true;
      if (i.handle && product.handle && i.handle !== "product" && i.handle === product.handle) return true;
      return false;
    });
    let updated;
    if (idx > -1) {
      existing[idx].quantity = (existing[idx].quantity || 1) + quantity;
      updated = [...existing];
    } else {
      updated = [...existing, itemToAdd];
    }
    saveCartStore(updated);

    try {
      toast.success(`🛒 Added ${itemToAdd.title} to your cart!`, {
        description: "Click cart icon in navbar to review or checkout.",
        duration: 3000
      });
    } catch (err) {}

    setCartAddedToast(true);
    setTimeout(() => setCartAddedToast(false), 3000);
  };

  // Buy Now handler (Requires Login)
  const handleBuyNow = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (product.stock_quantity === 0) {
      toast.error("🚫 This product is currently out of stock", {
        description: "Please check back later or select another item.",
        duration: 2500
      });
      return;
    }
    requireAuth(() => {
      const mainItem = {
        id: product.id,
        handle: product.handle,
        title: `${product.title} (${selectedColor})`,
        price: product.price,
        quantity: 1,
        image: selectedImage
      };
      sessionStorage.setItem("ecom_buy_now_item", JSON.stringify([mainItem]));
      router.push("/checkout?buyNow=true");
    });
  };

  // Buy Combo handler ("Buy Combo" dynamically adds selected items) (Requires Login)
  const handleBuyCombo = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    requireAuth(() => {
      const cartKey = getUserCartKey();
      const existing = JSON.parse(localStorage.getItem(cartKey) || "[]");
      const mainItem = {
        id: product.id,
        handle: product.handle,
        title: `${product.title} (${selectedColor})`,
        price: product.price,
        quantity: 1,
        image: selectedImage
      };

      const comboItems = [mainItem];
      if (addon1Added) {
        comboItems.push({
          id: product.id + 9901,
          handle: "gadgetbite-eva-hard-case",
          title: "GadgetBite Headphone Carrying Hard EVA Case Storage Bag (Black)",
          price: 400,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400"
        });
      }
      if (addon2Added) {
        comboItems.push({
          id: product.id + 9902,
          handle: "fast-wall-adapter-65w",
          title: "65W Fast Wall Adapter Charger (PD 3.0 Dual Port)",
          price: 599,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400"
        });
      }

      localStorage.setItem(cartKey, JSON.stringify([...existing, ...comboItems]));
      window.dispatchEvent(new Event("ecom_cart_updated"));
      window.dispatchEvent(new Event("ecom_cart_changed"));
      router.push("/checkout");
    });
  };

  // Add Add-on Item handler (Requires Login)
  const handleAddAddon = (
    addon: { id: number; title: string; price: number; image: string },
    setAddedState: (v: boolean) => void
  ) => {
    requireAuth(() => {
      const cartKey = getUserCartKey();
      const existing = JSON.parse(localStorage.getItem(cartKey) || "[]");
      const newItem = {
        id: addon.id,
        handle: addon.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        title: addon.title,
        price: addon.price,
        quantity: 1,
        image: addon.image
      };

      const updated = [...existing, newItem];
      localStorage.setItem(cartKey, JSON.stringify(updated));
      window.dispatchEvent(new Event("ecom_cart_updated"));
      window.dispatchEvent(new Event("ecom_cart_changed"));
      setAddedState(true);
      try {
        toast.success(`🛒 Added ${addon.title} to cart!`);
      } catch (e) {}
    });
  };

  // Toggle E-COM Protect Extended Warranty Plan Add-on
  const handleToggleWarranty = () => {
    requireAuth(() => {
      const cartKey = getUserCartKey();
      const existing = JSON.parse(localStorage.getItem(cartKey) || "[]");
      const warrantyId = 9903;

      if (warrantyAdded) {
        const updated = existing.filter((item: any) => item.id !== warrantyId);
        localStorage.setItem(cartKey, JSON.stringify(updated));
        window.dispatchEvent(new Event("ecom_cart_updated"));
        window.dispatchEvent(new Event("ecom_cart_changed"));
        setWarrantyAdded(false);
        try { toast.info("🛡️ E-COM Protect Warranty removed from cart."); } catch (e) {}
      } else {
        const newItem = {
          id: warrantyId,
          handle: "e-com-protect-1yr-warranty",
          title: `E-COM Protect 1-Year Extended Warranty`,
          price: 199,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200"
        };
        const updated = [...existing, newItem];
        localStorage.setItem(cartKey, JSON.stringify(updated));
        window.dispatchEvent(new Event("ecom_cart_updated"));
        window.dispatchEvent(new Event("ecom_cart_changed"));
        setWarrantyAdded(true);
        try { toast.success("🛡️ E-COM Protect Warranty (₹199) added to cart!"); } catch (e) {}
      }
    });
  };

const SUB_NAV_ITEMS = [
  {
    key: "mobiles",
    title: "Mobiles & Accessories",
    subtitle: "Mobiles",
    mainSlug: "smartphones",
    links: [
      { name: "Smartphones & Basic Mobiles", slug: "smartphones" },
      { name: "Mobile Cases & Covers", slug: "mobile-cases" },
      { name: "Fast Chargers & Cables", slug: "chargers" },
      { name: "Power Banks & Wireless Pads", slug: "power-banks" },
    ]
  },
  {
    key: "laptops",
    title: "Laptops & Accessories",
    subtitle: "Laptops",
    mainSlug: "gaming-laptops",
    links: [
      { name: "Gaming & Performance Laptops", slug: "gaming-laptops" },
      { name: "Thin & Light Ultrabooks", slug: "ultrabooks" },
      { name: "Laptop Sleeves & Backpacks", slug: "backpacks" },
      { name: "Wireless Mice & Keyboards", slug: "wireless-mice" },
    ]
  },
  {
    key: "tv",
    title: "TV & Home Entertainment",
    subtitle: "Home Cinema",
    mainSlug: "4k-smart-tvs",
    links: [
      { name: "4K Ultra HD Smart TVs", slug: "4k-smart-tvs" },
      { name: "Home Theatre Soundbars", slug: "soundbars" },
      { name: "Streaming Sticks & Boxes", slug: "streaming-boxes" },
    ]
  },
  {
    key: "audio",
    title: "Audio",
    subtitle: "Audio Gear",
    mainSlug: "anc-headphones",
    links: [
      { name: "Active ANC Headphones", slug: "anc-headphones" },
      { name: "True Wireless Earbuds (TWS)", slug: "tws-earbuds" },
      { name: "Portable Bluetooth Speakers", slug: "bluetooth-speakers" },
    ]
  },
  {
    key: "camera",
    title: "Camera",
    subtitle: "Photography",
    mainSlug: "drones",
    links: [
      { name: "RC 4K Camera Pro Drones", slug: "drones" },
      { name: "DSLR & Mirrorless Cameras", slug: "dslr-cameras" },
      { name: "Action Cameras & Gimbals", slug: "action-gimbals" },
    ]
  },
  {
    key: "computer",
    title: "Computer Accessories",
    subtitle: "Peripherals",
    mainSlug: "ssds-drives",
    links: [
      { name: "External SSDs & Hard Drives", slug: "ssds-drives" },
      { name: "USB Type-C Hubs & Adapters", slug: "usb-hubs" },
      { name: "Full HD Webcams & Mics", slug: "webcams-mics" },
    ]
  },
  {
    key: "smart",
    title: "Smart Technology",
    subtitle: "Wearables & Smart",
    mainSlug: "smartwatches",
    links: [
      { name: "Smartwatches & Fitness Bands", slug: "smartwatches" },
      { name: "Smart Home Lighting & Plugs", slug: "smart-lighting" },
    ]
  }
];

  // Bundle Items State for "Frequently Purchased Together"
  const [bundleChecked, setBundleChecked] = useState({
    main: true,
    item1: true,
    item2: true,
  });

  const bundleItems = [
    {
      id: "main",
      title: `This item: ${product.title}`,
      price: product.price,
      image: selectedImage,
    },
    {
      id: "item1",
      title: "POPIO Military-Grade Gorilla Tempered Glass for 9H...",
      price: 299,
      image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400",
    },
    {
      id: "item2",
      title: "RIGGEAR Shockproof Sleek Hybrid Armor Magnetic Back Cover...",
      price: 599,
      image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400",
    },
  ];

  const bundleTotal = bundleItems.reduce(
    (acc, item) => (bundleChecked[item.id as keyof typeof bundleChecked] ? acc + item.price : acc),
    0
  );

  const imagesList = product.images.length > 0 ? product.images : [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
    "https://images.unsplash.com/photo-1523206489230-c012c64b2047?w=800",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800",
    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800",
  ];

  const discountPercent = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 16;

  const getValidHandle = (item: any) => {
    if (!item) return "oneplus-nord-6";
    if (item.handle && typeof item.handle === "string" && item.handle !== "undefined" && item.handle.trim() !== "") {
      return item.handle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    if (item.slug && typeof item.slug === "string" && item.slug !== "undefined" && item.slug.trim() !== "") {
      return item.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    if (item.title && typeof item.title === "string") {
      return item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    return String(item.id || "1");
  };

  // Combine passed relatedProducts with FALLBACK_RECS so recommendation sections are ALWAYS 100% full
  const recsMap = new Map<string, any>();
  const currHandle = getValidHandle(product);

  (relatedProducts || []).forEach(p => {
    if (p && String(p.id) !== String(product.id)) {
      const h = getValidHandle(p);
      if (h !== currHandle) {
        recsMap.set(h, { ...p, handle: h });
      }
    }
  });

  FALLBACK_RECS.forEach(fb => {
    const h = getValidHandle(fb);
    if (h !== currHandle && !recsMap.has(h)) {
      recsMap.set(h, { ...fb, handle: h });
    }
  });

  const fullRecommendations = Array.from(recsMap.values());
  const sponsoredList = fullRecommendations.slice(0, 7);
  const customersAlsoViewedList = fullRecommendations.slice(7, 14);

  return (
    <div className="space-y-8 font-sans">
      
      {/* 🏷️ Top Sub-Navigation Header Bar with Interactive Click & Hover Dropdowns */}
      <div className="bg-white border-b border-gray-200 py-2.5 px-4 shadow-2xs z-30 relative">
        <div className="max-w-7xl mx-auto flex items-center gap-4 sm:gap-6 text-xs font-semibold text-gray-700 whitespace-nowrap overflow-x-auto md:overflow-visible scrollbar-hide py-1">
          <Link href="/search" className="font-black text-gray-900 hover:text-orange-600">
            {product.category?.name || "Electronics"}
          </Link>
          <span className="text-gray-300">|</span>

          {SUB_NAV_ITEMS.map((cat) => (
            <div
              key={cat.key}
              className="relative group py-1 cursor-pointer"
              onMouseEnter={() => setOpenSubNav(cat.key)}
              onMouseLeave={() => setOpenSubNav(null)}
            >
              <button
                type="button"
                onClick={() => setOpenSubNav(openSubNav === cat.key ? null : cat.key)}
                className="hover:text-orange-600 flex items-center gap-1 font-semibold text-gray-700 bg-transparent border-none p-0 cursor-pointer whitespace-nowrap"
              >
                {cat.title} <span className="text-[10px] text-gray-400">▾</span>
              </button>

              {/* 💻 DESKTOP DROPDOWN POPUP */}
              <div className={`hidden md:block absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 z-50 text-xs space-y-1 transition duration-150 ${
                openSubNav === cat.key ? "opacity-100 pointer-events-auto block" : "opacity-0 pointer-events-none hidden group-hover:block group-hover:opacity-100 group-hover:pointer-events-auto"
              }`}>
                <p className="font-black text-gray-900 text-[11px] px-3 py-1 uppercase tracking-wider text-amber-700">{cat.subtitle}</p>
                {cat.links.map((link) => (
                  <Link
                    key={link.slug}
                    href={`/category/${link.slug}`}
                    onClick={() => setOpenSubNav(null)}
                    className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700 transition"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* 📱 MOBILE CATEGORY SHEET MODAL (Renders via Portal on Mobile Click) */}
      {openSubNav && typeof document !== "undefined" && createPortal(
        <div className="block md:hidden fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-end justify-center font-sans animate-in fade-in duration-150">
          {/* Backdrop dismiss */}
          <div className="absolute inset-0" onClick={() => setOpenSubNav(null)} />

          {/* Sheet Container */}
          <div className="relative bg-white w-full rounded-t-3xl p-5 shadow-2xl space-y-4 z-10 animate-in slide-in-from-bottom duration-200 border-t border-gray-200">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-gray-900 text-sm">
                  {SUB_NAV_ITEMS.find((c) => c.key === openSubNav)?.title}
                </h3>
                <p className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider">
                  {SUB_NAV_ITEMS.find((c) => c.key === openSubNav)?.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpenSubNav(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              {SUB_NAV_ITEMS.find((c) => c.key === openSubNav)?.links.map((link) => (
                <Link
                  key={link.slug}
                  href={`/category/${link.slug}`}
                  onClick={() => setOpenSubNav(null)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-emerald-50 text-gray-800 font-bold transition border border-gray-100"
                >
                  <span>{link.name}</span>
                  <span className="text-emerald-600 font-black text-sm">&rsaquo;</span>
                </Link>
              ))}
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* 🏷️ Schema.org JSON-LD Rich Snippet for Google Search Ranking */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.title,
            "image": product.images || [selectedImage],
            "description": product.description || (product as any).short_description || product.title,
            "sku": (product as any).sku || `SKU-${product.id}`,
            "brand": {
              "@type": "Brand",
              "name": (product as any).brand || "E-COM"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://ecom.botmartz.com/product/${product.handle}`,
              "priceCurrency": "INR",
              "price": product.price,
              "priceValidUntil": "2026-12-31",
              "itemCondition": "https://schema.org/NewCondition",
              "availability": (product.stock_quantity ?? 1) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "E-COM Store"
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "128"
            }
          })
        }}
      />

      {/* 📍 Breadcrumb Bar */}
      <div className="max-w-[1536px] mx-auto px-4 lg:px-8">
        <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5 flex-wrap">
          <Link href="/search" className="hover:underline">{product.category?.name || "Electronics"}</Link>
          <span>&rsaquo;</span>
          <Link href="/search/tech" className="hover:underline">Catalog &amp; Accessories</Link>
          <span>&rsaquo;</span>
          <span className="text-gray-800 font-bold">{product.title}</span>
        </div>
      </div>

      {/* 🛍️ Main Product Hero Details (Matching Screenshot 1) */}
      <div className="max-w-[1536px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 5-COL: Image Gallery & Main Photo + Ratings Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex gap-4">
              {/* Thumbnail Strip */}
              <div className="flex flex-col gap-3 shrink-0">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-12 h-12 rounded-xl border-2 overflow-hidden bg-gray-50 transition cursor-pointer ${
                      selectedImage === img ? "border-amber-500 ring-2 ring-amber-300" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Preview Image with Amazon-Style Interactive Magnifier */}
              <div className="flex-1 relative">
                <ProductZoomMagnifier imageSrc={selectedImage} altText={product.title} />
                {(product.stock_quantity === 0) && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-3xl z-20 flex items-center justify-center pointer-events-none">
                    <div className="border-4 border-red-600 text-red-600 font-black text-2xl px-6 py-2.5 rounded-2xl transform -rotate-12 uppercase tracking-widest bg-white/95 shadow-2xl animate-in zoom-in-90 duration-200">
                      🚫 OUT OF STOCK
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ✨ Key Product Highlights & Delivery Pincode Checker Card under Image Gallery */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-black text-gray-900 text-sm">Product Highlights &amp; Specs</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  VERIFIED ITEM
                </span>
              </div>

              {/* Highlights List */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-gray-700">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0">⚡</span>
                  <span className="font-semibold text-[11px]">Express 2-Day Doorstep Delivery</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-700">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0">🛡️</span>
                  <span className="font-semibold text-[11px]">100% Original Sourced from Official Brand</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-700">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0">🔄</span>
                  <span className="font-semibold text-[11px]">7 Days Easy Doorstep Replacement</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-700">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0">🏷️</span>
                  <span className="font-semibold text-[11px]">Guaranteed Lowest Price &amp; Extra Coupons</span>
                </div>
              </div>

              {/* Delivery Pincode Quick Checker */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="font-extrabold text-[11px] text-gray-800 flex items-center gap-1">
                  <span>📍</span> Check Delivery Availability
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue="474001"
                    placeholder="Enter 6-digit Pincode"
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
                  />
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer">
                    Check
                  </button>
                </div>
                <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-0.5">
                  <span>✓</span> Free Express Shipping Available for 474001
                </p>
              </div>
            </div>

            {/* 🌟 E-COM Assured Store Guarantee & Highlights Card */}
            <div className="bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40 border border-emerald-200/80 rounded-3xl p-5 shadow-sm space-y-4 text-xs">
              
              {/* Header Badge */}
              <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    ✓
                  </span>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-xs tracking-tight">E-COM Assured Promise</h4>
                    <p className="text-[10px] text-emerald-700 font-bold">100% Genuine • Fast Delivery</p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200">
                  VERIFIED
                </span>
              </div>

              {/* 4 Trust Highlights Grid */}
              <div className="space-y-2.5 pt-0.5">
                <div className="flex items-start gap-3 bg-white/80 border border-emerald-100/80 p-2.5 rounded-2xl shadow-2xs">
                  <span className="text-lg shrink-0">🚚</span>
                  <div>
                    <h5 className="font-bold text-gray-900 text-[11px]">Same-Day Dispatch &amp; Express Shipping</h5>
                    <p className="text-[10px] text-gray-500 leading-snug">Shipped directly from verified hub with live SMS tracking.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/80 border border-emerald-100/80 p-2.5 rounded-2xl shadow-2xs">
                  <span className="text-lg shrink-0">🛡️</span>
                  <div>
                    <h5 className="font-bold text-gray-900 text-[11px]">1-Year Brand Warranty</h5>
                    <p className="text-[10px] text-gray-500 leading-snug">Guaranteed authentic product with manufacturer warranty.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/80 border border-emerald-100/80 p-2.5 rounded-2xl shadow-2xs">
                  <span className="text-lg shrink-0">🔄</span>
                  <div>
                    <h5 className="font-bold text-gray-900 text-[11px]">7 Days Easy Return &amp; Exchange</h5>
                    <p className="text-[10px] text-gray-500 leading-snug">No questions asked instant replacement or doorstep refund.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/80 border border-emerald-100/80 p-2.5 rounded-2xl shadow-2xs">
                  <span className="text-lg shrink-0">💳</span>
                  <div>
                    <h5 className="font-bold text-gray-900 text-[11px]">Pay on Delivery (COD Available)</h5>
                    <p className="text-[10px] text-gray-500 leading-snug">Pay conveniently at your door via Cash, UPI QR or Cards.</p>
                  </div>
                </div>
              </div>

              {/* Satisfaction Meter */}
              <div className="bg-emerald-600 text-white rounded-2xl p-3 flex items-center justify-between text-[11px] shadow-sm">
                <div>
                  <p className="font-black text-xs">99.4% Customer Satisfaction</p>
                  <p className="text-[10px] text-emerald-100 font-medium">Based on 12,450+ verified orders</p>
                </div>
                <div className="text-right">
                  <span className="text-amber-300 font-black text-sm">4.9 ★</span>
                </div>
              </div>

            </div>

          </div>

          {/* MIDDLE 4-COL: Title, Rating, Offers */}
          <div className="lg:col-span-4 space-y-4">
            
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-snug">
                {product.title}
              </h1>
              <p className="text-xs text-emerald-700 font-bold mt-1 hover:underline cursor-pointer">Visit the E-COM Official Store</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-amber-500 font-bold">4.3 ★★★★☆</span>
                <span className="text-emerald-700 font-bold hover:underline cursor-pointer">(1,732 ratings)</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 font-medium">3k+ purchased in last month</span>
              </div>
            </div>

            <div className="border-t border-b border-gray-100 py-3 space-y-2">
              <span className="bg-red-600 text-white font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md">
                ⚡ Lightning Deals
              </span>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-red-600 font-black text-2xl">-{discountPercent}%</span>
                <span className="text-2xl font-black text-gray-900">₹{product.price.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-xs text-gray-500">
                M.R.P.: <span className="line-through">₹{(product.compare_at_price || Math.round(product.price * 1.2)).toLocaleString("en-IN")}</span>
              </p>

              <div className="inline-flex items-center gap-1.5 bg-gray-900 text-white font-bold text-[10px] px-2.5 py-1 rounded-md uppercase">
                <span>a</span> Fulfilled
              </div>
              <p className="text-[11px] text-gray-600">Inclusive of all taxes</p>
            </div>



            {/* 🎨 Color Swatches Selector (Matching Screenshot 2) */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-900">
                Color: <span className="font-extrabold text-gray-800">{selectedColor}</span>
              </p>
              <div className="flex items-center gap-3">
                {[
                  { name: "Charcoal", bg: "bg-[#3A3B3C]" },
                  { name: "Navy", bg: "bg-[#4A5B78]" },
                  { name: "Slate", bg: "bg-[#7A8B9E]" }
                ].map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColor(col.name)}
                    className={`w-8 h-8 rounded-full border-2 transition cursor-pointer flex items-center justify-center ${col.bg} ${
                      selectedColor === col.name
                        ? "border-gray-900 ring-2 ring-emerald-400 ring-offset-2 scale-110 shadow-sm"
                        : "border-gray-300 hover:border-gray-500 opacity-80 hover:opacity-100"
                    }`}
                    title={col.name}
                  />
                ))}
              </div>
            </div>

            {/* 📏 Size Selector (Matching Screenshot 2) */}
            {(() => {
              const numId = typeof product.id === "number" ? product.id : (parseInt(String(product.id || "").replace(/[^0-9]/g, "")) || 1);
              const maxStock = typeof product.stock_quantity === "number" ? product.stock_quantity : 12;
              const isOutOfStock = maxStock === 0;

              const handleIncreaseQty = () => {
                if (maxStock > 0 && quantity >= maxStock) {
                  toast.warning(`⚠️ Maximum available stock reached!`, {
                    description: `Only ${maxStock} unit(s) of this item are in stock. No more items in stock!`,
                    duration: 3000
                  });
                  return;
                }
                setQuantity(prev => prev + 1);
              };

              return (
                <>
                  {/* Render Size Selector ONLY for Clothes, Fashion, Home Living, and Shoes */}
                  {sizeType !== "none" && (
                    <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-900">
                          Size: <span className={`font-extrabold ${isOutOfStock ? "text-red-600" : maxStock <= 5 ? "text-amber-600" : "text-[#0284C7]"}`}>
                            {isOutOfStock ? "Out of Stock / Unavailable" : maxStock <= 5 ? `Only ${maxStock} Left!` : "In Stock"}
                          </span>
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowSizeChart(true)}
                          className="text-gray-700 hover:text-emerald-700 font-bold flex items-center gap-1.5 underline underline-offset-2 cursor-pointer"
                        >
                          <span>📏</span> Size Chart
                        </button>
                      </div>

                      {/* Size Pills Grid: S, M, L, XL for Clothes/Fashion/Home Living OR 6, 7, 8, 9 for Shoes */}
                      <div className="flex items-center gap-2.5">
                        {sizesList.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`w-12 h-10 rounded-xl font-black text-xs transition border cursor-pointer flex items-center justify-center ${
                              selectedSize === sz
                                ? "bg-black text-white border-black shadow-sm"
                                : "bg-white text-gray-800 border-gray-300 hover:border-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>

                      {/* RECOMMENDED Size Banner */}
                      <div className="border border-gray-900 rounded-xl p-3 bg-white flex items-center justify-between font-black text-xs text-gray-900 shadow-2xs max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-serif italic font-black text-sm">TF</span>
                          <span>RECOMMENDED: {recommendedSize}</span>
                        </div>
                        <span>&rarr;</span>
                      </div>

                      {/* Also Available in Size */}
                      <div className="space-y-1.5 pt-1">
                        <p className="font-bold text-gray-700 text-[11px]">Also Available in Size</p>
                        <button className="border border-gray-300 rounded-xl px-4 py-2 text-xs font-bold text-gray-800 bg-white hover:bg-gray-50 cursor-pointer">
                          {alsoAvailableSize}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 🔢 Quantity Stepper & 🛍️ Circular Wishlist Heart + ADD TO CART Action Row */}
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    
                    {/* Quantity Selector */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-gray-900">Quantity:</p>
                        {maxStock > 0 && (
                          <span className={`text-[11px] font-black ${maxStock <= 5 ? "text-amber-700" : "text-emerald-700"}`}>
                            (Max limit: {maxStock} available)
                          </span>
                        )}
                      </div>
                      <div className="inline-flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          disabled={isOutOfStock || quantity <= 1}
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3.5 py-2 text-gray-700 hover:bg-gray-100 font-black text-sm transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 font-black text-xs text-gray-900">{isOutOfStock ? 0 : quantity}</span>
                        <button
                          type="button"
                          disabled={isOutOfStock || (maxStock > 0 && quantity >= maxStock)}
                          onClick={handleIncreaseQty}
                          className="px-3.5 py-2 text-gray-700 hover:bg-gray-100 font-black text-sm transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title={quantity >= maxStock ? "No more product in stock!" : "Add quantity"}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Action Row: Wishlist Heart Circle + ADD TO CART Pill Button */}
                    <div className="flex items-center gap-3 pt-2">
                      
                      {/* 🤍 Circular Wishlist Heart Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const item = {
                            id: product.id,
                            handle: product.handle,
                            title: product.title,
                            price: product.price,
                            compare_at_price: product.compare_at_price,
                            image: product.images?.[0] || selectedImage,
                            category: product.category?.name || "Store",
                            rating: 4.5
                          };
                          const wasLiked = isInWishlist(product.id);
                          toggleWishlist(item);
                          if (wasLiked) {
                            toast("💔 Removed from Wishlist", { description: product.title });
                          } else {
                            toast.success("❤️ Added to Wishlist!", { description: product.title });
                          }
                        }}
                        className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition shrink-0 cursor-pointer shadow-sm ${
                          isInWishlist(product.id)
                            ? "bg-emerald-50 border-emerald-500 text-emerald-600 scale-105"
                            : "bg-white border-emerald-400 text-emerald-500 hover:border-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>

                      {/* 🛒 ADD TO CART Big Green Pill Button */}
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={handleAddToCart}
                        className={`flex-1 font-black text-sm py-4 px-6 rounded-full transition text-center tracking-wider uppercase ${
                          isOutOfStock
                            ? "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed opacity-80"
                            : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-600/30 cursor-pointer"
                        }`}
                      >
                        {isOutOfStock ? "🚫 OUT OF STOCK" : (cartAddedToast ? "✓ ADDED TO CART!" : "ADD TO CART")}
                      </button>

                    </div>

                  </div>
                </>
              );
            })()}

            {/* 📋 About This Item Specs Bullet Points */}
            {parsedHighlights.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">About this item</h4>
                <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside leading-relaxed font-medium">
                  {parsedHighlights.map((hl, idx) => {
                    const parts = hl.split(":");
                    return (
                      <li key={idx}>
                        {parts.length > 1 ? (
                          <>
                            <span className="font-bold text-gray-900">{parts[0]}:</span> {parts.slice(1).join(":")}
                          </>
                        ) : (
                          <span>{hl}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* 📦 Box Contents Section */}
            {parsedBoxContents.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">📦 WHAT IS IN THE BOX</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[11px] font-semibold text-gray-700">
                  {parsedBoxContents.map((boxItem, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:border-emerald-300 transition flex flex-col items-center justify-center gap-1.5 min-h-[90px]">
                      {boxItem.image ? (
                        <img src={boxItem.image} alt={boxItem.title} className="w-10 h-10 object-contain rounded-lg p-0.5" />
                      ) : (
                        <span className="text-2xl block">{boxItem.icon}</span>
                      )}
                      <span className="truncate w-full font-bold text-gray-800">{boxItem.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 📋 Complete Technical Specifications & Enterprise Attributes Breakdown Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚙️</span> Technical Specifications &amp; Attributes
                </h4>
                <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-200">
                  Full 32-Field Specs
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {(product as any).brand && (
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-bold block text-[9px] uppercase">Brand</span>
                    <span className="font-black text-gray-900">{(product as any).brand}</span>
                  </div>
                )}
                {(product as any).sub_category && (
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-bold block text-[9px] uppercase">Sub Category</span>
                    <span className="font-bold text-gray-800">{(product as any).sub_category}</span>
                  </div>
                )}
                {(product as any).sku && (
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-bold block text-[9px] uppercase">SKU</span>
                    <span className="font-mono font-bold text-gray-900">{(product as any).sku}</span>
                  </div>
                )}
                {(product as any).barcode && (
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-bold block text-[9px] uppercase">Barcode / EAN</span>
                    <span className="font-mono font-bold text-gray-800">{(product as any).barcode}</span>
                  </div>
                )}
                {(product as any).color && (
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-bold block text-[9px] uppercase">Color Variant</span>
                    <span className="font-extrabold text-gray-900">{(product as any).color}</span>
                  </div>
                )}
                {(product as any).size && (
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-bold block text-[9px] uppercase">Size Variant</span>
                    <span className="font-extrabold text-gray-900">{(product as any).size}</span>
                  </div>
                )}
                {(product as any).material && (
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-bold block text-[9px] uppercase">Material &amp; Fabric</span>
                    <span className="font-bold text-gray-800">{(product as any).material}</span>
                  </div>
                )}
                {(product as any).weight != null && (
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-bold block text-[9px] uppercase">Weight (kg)</span>
                    <span className="font-bold text-gray-900">{(product as any).weight} kg</span>
                  </div>
                )}
                {(product as any).dimensions && (
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-bold block text-[9px] uppercase">Dimensions (L x W x H)</span>
                    <span className="font-bold text-gray-800">{(product as any).dimensions} cm</span>
                  </div>
                )}
                {(product as any).gst_rate != null && (
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-bold block text-[9px] uppercase">GST Rate %</span>
                    <span className="font-black text-emerald-700">{(product as any).gst_rate}% GST</span>
                  </div>
                )}
                {(product as any).hsn_code && (
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-bold block text-[9px] uppercase">HSN Code</span>
                    <span className="font-mono font-bold text-gray-800">{(product as any).hsn_code}</span>
                  </div>
                )}
                {(product as any).country_of_origin && (
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-bold block text-[9px] uppercase">Country of Origin</span>
                    <span className="font-bold text-gray-900">{(product as any).country_of_origin}</span>
                  </div>
                )}
                {(product as any).warehouse && (
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 col-span-2">
                    <span className="text-gray-400 font-bold block text-[9px] uppercase">Fulfillment Warehouse</span>
                    <span className="font-extrabold text-gray-900">{(product as any).warehouse}</span>
                  </div>
                )}
              </div>

              {(product as any).video_url && (
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-gray-700">Product Video Demo</span>
                  <a
                    href={(product as any).video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-red-50 hover:bg-red-100 text-red-700 font-extrabold px-3 py-1 rounded-xl border border-red-200 transition text-[10px] flex items-center gap-1"
                  >
                    <span>▶ Watch Video</span>
                  </a>
                </div>
              )}
            </div>

            {/* 🏆 Brand Trust Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-gray-900 text-sm">{(product as any).brand || "Skipd"} Official Retail</span>
                <span className="bg-emerald-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded">Verified</span>
              </div>
              <p className="text-[11px] text-gray-700 font-medium">⭐ 85% Positive Ratings (from 100K+ customers)</p>
              <p className="text-[10px] text-gray-500">100K+ orders from this brand recently | 11+ years experience</p>
            </div>

          </div>

          {/* RIGHT 3-COL: Buy Box Card + Extended Protection & Seller Info */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* 1. Buy Box Main Card */}
            <div className="bg-white border border-gray-300 rounded-3xl p-5 shadow-md space-y-4">
              
              {/* Prime Badge */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 text-xs space-y-1">
                <div className="flex items-center gap-1 font-black text-emerald-800 text-sm">
                  <span>prime</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-tight">Enjoy unlimited free same-day/1-day delivery &amp; extra offers.</p>
                <button className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer">Join Prime &rsaquo;&rsaquo;</button>
              </div>

              {/* Delivery Info */}
              <div className="space-y-1 text-xs text-gray-700">
                <p className="font-bold text-emerald-700">FREE delivery Saturday, Aug 15.</p>
                <p className="text-[11px] text-gray-500">📍 Deliver to Gwalior 474001</p>
                {(() => {
                  const numId = typeof product.id === "number" ? product.id : (parseInt(String(product.id || "").replace(/[^0-9]/g, "")) || 1);
                  const maxStock = typeof product.stock_quantity === "number" ? product.stock_quantity : 12;
                  if (maxStock === 0) {
                    return <p className="text-red-600 font-black text-sm pt-1 uppercase tracking-wider flex items-center gap-1"><span>❌</span> Out of Stock (Unavailable)</p>;
                  }
                  if (maxStock <= 5) {
                    return <p className="text-amber-900 font-black text-xs pt-1 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg animate-pulse flex items-center gap-1"><span>⚡</span> Low Stock: Only {maxStock} left in stock!</p>;
                  }
                  return <p className="text-emerald-600 font-extrabold text-sm pt-1 flex items-center gap-1"><span>📦</span> In Stock ({maxStock} units available)</p>;
                })()}
                <p className="text-[10px] text-gray-500">Ships from and sold by E-COM Official Retail.</p>
              </div>

              {/* 🛒 Add to Cart (White) & ⚡ Buy Now (Brand Emerald Logo Color) Buttons */}
              <div className="space-y-2 pt-2">
                {product.stock_quantity === 0 ? (
                  <button
                    disabled
                    className="w-full bg-gray-100 border-2 border-gray-300 text-gray-400 font-black text-xs py-3.5 rounded-2xl text-center uppercase tracking-wider cursor-not-allowed opacity-80 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    🚫 Unavailable / Out of Stock
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="w-full bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-900 font-black text-xs py-3.5 rounded-2xl transition shadow-xs text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {cartAddedToast ? "✓ Added to Cart!" : "🛒 Add to Cart"}
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3.5 rounded-2xl transition shadow-md shadow-emerald-600/20 text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      ⚡ Buy Now
                    </button>
                  </>
                )}
              </div>

              {/* ❤️ Add to Wishlist Button */}
              <button
                type="button"
                onClick={() => {
                  const item = {
                    id: product.id,
                    handle: product.handle,
                    title: product.title,
                    price: product.price,
                    compare_at_price: product.compare_at_price,
                    image: product.images?.[0] || selectedImage,
                    category: product.category?.name || "Store",
                    rating: 4.5
                  };
                  const wasLiked = isInWishlist(product.id);
                  toggleWishlist(item);
                  if (wasLiked) {
                    toast("💔 Removed from Wishlist", { description: product.title });
                  } else {
                    toast.success("❤️ Added to Wishlist!", { description: product.title });
                  }
                }}
                className={`w-full font-black text-xs py-3 rounded-2xl transition border flex items-center justify-center gap-1.5 cursor-pointer ${
                  isInWishlist(product.id)
                    ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600"
                }`}
              >
                {isInWishlist(product.id) ? "❤️ In Your Wishlist" : "🤍 Add to Wishlist"}
              </button>

            </div>

            {/* 2. 🛡️ E-COM Protection Plan Card */}
            <div className={`border rounded-3xl p-5 shadow-2xs space-y-3 text-xs transition-all duration-300 ${
              warrantyAdded ? "bg-emerald-50/70 border-emerald-300 shadow-emerald-500/10" : "bg-white border-gray-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                  <span>🛡️</span> E-COM Protect Plan
                </span>
                <span className="text-emerald-700 font-black text-sm">₹199</span>
              </div>
              <p className="text-gray-500 text-[11px] leading-tight">Add 1-Year Extended Warranty covering accidental damage &amp; battery replacement.</p>
              <button
                type="button"
                onClick={handleToggleWarranty}
                className={`w-full font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                  warrantyAdded 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                {warrantyAdded ? (
                  <>
                    <span>✓</span>
                    <span>Warranty Plan Added</span>
                  </>
                ) : (
                  <>
                    <span>+</span>
                    <span>Add Warranty Coverage (₹199)</span>
                  </>
                )}
              </button>
            </div>

            {/* 3. 🏪 Seller & Express Shipping Info */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white font-black text-xs flex items-center justify-center">
                  E
                </div>
                <div>
                  <p className="font-bold text-gray-900">E-COM Official Retail Hub</p>
                  <p className="text-[10px] text-emerald-600 font-bold">4.9 ★ 98% Positive Feedback</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-2 space-y-1.5 text-[11px] text-gray-600">
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span className="font-bold text-gray-900">Secure Transaction</span>
                </div>
                <div className="flex justify-between">
                  <span>Ships from</span>
                  <span className="font-bold text-gray-900">E-COM Express Logistics</span>
                </div>
                <div className="flex justify-between">
                  <span>Returns</span>
                  <span className="font-bold text-gray-900">10-Day Replacement</span>
                </div>
              </div>
            </div>

            {/* 4. 🎧 Recommended Accessories Card (+ Add Working Buttons) */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-3 text-xs">
              <h4 className="font-black text-gray-900 text-xs uppercase tracking-wider">⚡ Frequently Add-on Items</h4>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                  <img src="https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=200" alt="EVA Case" className="w-9 h-9 object-contain rounded-lg bg-white p-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">EVA Hard Storage Case</p>
                    <p className="font-black text-emerald-700 text-xs">₹400.00</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !addon1Added;
                      setAddon1Added(next);
                      if (next) {
                        handleAddAddon({ id: 9901, title: "EVA Hard Storage Case", price: 400, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400" }, () => {});
                      }
                    }}
                    className={`font-extrabold text-[10px] px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      addon1Added ? "bg-emerald-600 text-white" : "bg-gray-900 hover:bg-black text-white"
                    }`}
                  >
                    {addon1Added ? "✓ Added" : "+ Add"}
                  </button>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                  <img src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200" alt="Fast Charger" className="w-9 h-9 object-contain rounded-lg bg-white p-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">65W Fast Wall Adapter</p>
                    <p className="font-black text-emerald-700 text-xs">₹599.00</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !addon2Added;
                      setAddon2Added(next);
                      if (next) {
                        handleAddAddon({ id: 9902, title: "65W Fast Wall Adapter", price: 599, image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400" }, () => {});
                      }
                    }}
                    className={`font-extrabold text-[10px] px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      addon2Added ? "bg-emerald-600 text-white" : "bg-gray-900 hover:bg-black text-white"
                    }`}
                  >
                    {addon2Added ? "✓ Added" : "+ Add"}
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 🧩 "Frequently Bought Together" Section */}
      <div className="max-w-[1536px] mx-auto px-4 lg:px-8 pt-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <span>Frequently Bought Together</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700">Eligible for Free Delivery</span>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Items Bundle Breakdown */}
            <div className="flex flex-wrap items-center gap-4 flex-1">
              {/* Item 1: Main Product */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 w-56 space-y-2 text-xs relative shadow-2xs">
                <span className="absolute top-3 right-3 text-emerald-600 font-bold text-sm">✓</span>
                <img src={selectedImage} alt={product.title} className="w-20 h-20 object-contain mx-auto rounded-lg" />
                <p className="font-bold text-gray-900 line-clamp-2 leading-tight">This item: {product.title}</p>
                <p className="font-black text-gray-900">₹{product.price.toLocaleString("en-IN")}.00</p>
              </div>

              {/* Item 2: EVA Storage Case (Addon 1) */}
              {addon1Added && (
                <>
                  <span className="text-2xl font-black text-gray-400">+</span>
                  <div
                    onClick={() => setAddon1Added(false)}
                    className="bg-gray-50 border border-emerald-300 rounded-2xl p-4 w-60 space-y-2 text-xs relative cursor-pointer hover:bg-emerald-50/50 transition shadow-2xs group"
                    title="Click to remove from combo"
                  >
                    <span className="absolute top-3 right-3 text-emerald-600 font-bold text-sm">✓</span>
                    <img src="https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400" alt="EVA Case" className="w-20 h-20 object-contain mx-auto rounded-lg" />
                    <p className="font-bold text-gray-900 line-clamp-2 leading-tight">GadgetBite Headphone Carrying Hard EVA Case</p>
                    <div className="flex justify-between items-center pt-1">
                      <p className="font-black text-gray-900">₹400.00</p>
                      <span className="text-[10px] text-red-600 font-bold group-hover:underline">Remove ✕</span>
                    </div>
                  </div>
                </>
              )}

              {/* Item 3: 65W Fast Charger (Addon 2) */}
              {addon2Added && (
                <>
                  <span className="text-2xl font-black text-gray-400">+</span>
                  <div
                    onClick={() => setAddon2Added(false)}
                    className="bg-gray-50 border border-emerald-300 rounded-2xl p-4 w-60 space-y-2 text-xs relative cursor-pointer hover:bg-emerald-50/50 transition shadow-2xs group"
                    title="Click to remove from combo"
                  >
                    <span className="absolute top-3 right-3 text-emerald-600 font-bold text-sm">✓</span>
                    <img src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400" alt="Fast Charger" className="w-20 h-20 object-contain mx-auto rounded-lg" />
                    <p className="font-bold text-gray-900 line-clamp-2 leading-tight">65W Fast Wall Adapter Charger</p>
                    <div className="flex justify-between items-center pt-1">
                      <p className="font-black text-gray-900">₹599.00</p>
                      <span className="text-[10px] text-red-600 font-bold group-hover:underline">Remove ✕</span>
                    </div>
                  </div>
                </>
              )}

              {/* Quick Add buttons if an addon is unselected */}
              {(!addon1Added || !addon2Added) && (
                <div className="flex flex-col gap-2 pl-2">
                  {!addon1Added && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddon1Added(true);
                        handleAddAddon({ id: 9901, title: "EVA Hard Storage Case", price: 400, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400" }, () => {});
                      }}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-2 rounded-xl border border-emerald-200 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>+ Add EVA Storage Case (₹400)</span>
                    </button>
                  )}
                  {!addon2Added && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddon2Added(true);
                        handleAddAddon({ id: 9902, title: "65W Fast Wall Adapter", price: 599, image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400" }, () => {});
                      }}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-2 rounded-xl border border-emerald-200 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>+ Add 65W Charger (₹599)</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bundle Checkout Box */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 text-center space-y-3 shrink-0 w-full lg:w-72 shadow-2xs">
              <span className="text-xs text-gray-600 font-bold block">Total Combo Price:</span>
              <span className="text-2xl font-black text-gray-900 block">
                ₹{(product.price + (addon1Added ? 400 : 0) + (addon2Added ? 599 : 0)).toLocaleString("en-IN")}.00
              </span>

              <button
                type="button"
                onClick={handleBuyCombo}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3.5 rounded-2xl transition shadow-md shadow-emerald-600/20 text-center block cursor-pointer uppercase tracking-wider"
              >
                ⚡ Buy Combo ({1 + (addon1Added ? 1 : 0) + (addon2Added ? 1 : 0)} Items)
              </button>
              <p className="text-[10px] text-gray-500 font-medium">
                Includes {product.title} {addon1Added ? "+ Hard Storage Case" : ""} {addon2Added ? "+ 65W Charger" : ""}
              </p>
            </div>

          </div>
        </div>
      </div>


      {/* ⚡ Machine Learning Recommendation System (Frequently Bought Together & Similar Products) */}
      <div className="max-w-[1536px] mx-auto px-4 lg:px-8">
        <FrequentlyBoughtTogether productId={product.id} />
        <RecommendedProductsGrid productId={product.id} title="You Might Also Like" />
      </div>

      {/* 📦 Sponsored Products Section */}
      <div className="max-w-[1536px] mx-auto px-4 lg:px-8 pt-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-gray-900">Sponsored Products Related to This Item</h3>
            <span className="text-xs font-bold text-gray-400">Page 1 of 27</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {sponsoredList.map((sp, sIdx) => {
              const spPrice = Number(sp.price || 0);
              const spCompare = Number(sp.compare_at_price || spPrice * 1.3);
              const discountPercent = spCompare > spPrice ? Math.round(((spCompare - spPrice) / spCompare) * 100) : 0;
              const spImg = sp.images && sp.images.length > 0 ? sp.images[0] : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";

              return (
                <div
                  key={sIdx}
                  className="bg-gray-50 border border-gray-200/80 rounded-2xl p-2.5 space-y-2 flex flex-col justify-between text-xs hover:shadow-md hover:border-emerald-400 transition group"
                >
                  <Link href={`/product/${sp.handle}`} className="space-y-2 block flex-1 cursor-pointer">
                    <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                      <img src={spImg} alt={sp.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300" />
                      {discountPercent > 0 && (
                        <span className="absolute top-1 left-1 bg-red-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-[11px] text-gray-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition">{sp.title}</h4>
                    <p className="text-[10px] flex items-center gap-1"><span className="text-amber-500 font-extrabold">★ 4.8</span> <span className="text-emerald-700 font-extrabold">✓ E-COM Assured</span></p>
                    <div>
                      <p className="font-black text-sm text-gray-900">₹{spPrice.toLocaleString("en-IN")}.00</p>
                      {spCompare > spPrice && (
                        <p className="text-[10px] text-gray-400 line-through">M.R.P.: ₹{spCompare.toLocaleString("en-IN")}.00</p>
                      )}
                    </div>
                  </Link>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-1 pt-2 border-t border-gray-200/80">
                    <BuyNowButton
                      mode="cart"
                      productObj={sp}
                      productHandle={sp.handle}
                      className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 font-bold text-[9px] py-1.5 px-1 rounded-lg transition text-center flex items-center justify-center gap-0.5 shadow-2xs cursor-pointer"
                    >
                      🛒 Cart
                    </BuyNowButton>
                    <BuyNowButton
                      mode="buy"
                      productObj={sp}
                      productHandle={sp.handle}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] py-1.5 px-1 rounded-lg transition text-center flex items-center justify-center gap-0.5 shadow-xs cursor-pointer"
                    >
                      ⚡ Buy Now
                    </BuyNowButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📱 Customers Also Viewed Section */}
      <div className="max-w-[1536px] mx-auto px-4 lg:px-8 pt-4">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-gray-900">Customers Who Viewed This Item Also Viewed</h3>
            <span className="text-xs font-bold text-gray-400">Live DB Recommendations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {customersAlsoViewedList.map((viewed, vIdx) => {
              const vPrice = Number(viewed.price || 0);
              const vCompare = Number(viewed.compare_at_price || vPrice * 1.25);
              const vDiscount = vCompare > vPrice ? Math.round(((vCompare - vPrice) / vCompare) * 100) : 0;
              const vImg = viewed.images && viewed.images.length > 0 ? viewed.images[0] : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";

              return (
                <div
                  key={vIdx}
                  className="bg-gray-50 border border-gray-200/80 rounded-2xl p-2.5 space-y-2 flex flex-col justify-between text-xs hover:shadow-md hover:border-emerald-400 transition group"
                >
                  <Link href={`/product/${viewed.handle}`} className="space-y-2 block flex-1 cursor-pointer">
                    <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                      <img src={vImg} alt={viewed.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300" />
                      {vDiscount > 0 && (
                        <span className="absolute top-1 left-1 bg-orange-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase">
                          -{vDiscount}%
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-[11px] text-gray-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition">{viewed.title}</h4>
                    <p className="text-[10px] flex items-center gap-1"><span className="text-amber-500 font-extrabold">★ 4.7</span> <span className="text-emerald-700 font-extrabold">✓ Verified Quality</span></p>
                    <div>
                      <p className="font-black text-sm text-gray-900">₹{vPrice.toLocaleString("en-IN")}.00</p>
                      {vCompare > vPrice && (
                        <p className="text-[10px] text-gray-400 line-through">M.R.P.: ₹{vCompare.toLocaleString("en-IN")}.00</p>
                      )}
                    </div>
                  </Link>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-1 pt-2 border-t border-gray-200/80">
                    <BuyNowButton
                      mode="cart"
                      productObj={viewed}
                      productHandle={viewed.handle}
                      className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 font-bold text-[9px] py-1.5 px-1 rounded-lg transition text-center flex items-center justify-center gap-0.5 shadow-2xs cursor-pointer"
                    >
                      🛒 Cart
                    </BuyNowButton>
                    <BuyNowButton
                      mode="buy"
                      productObj={viewed}
                      productHandle={viewed.handle}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] py-1.5 px-1 rounded-lg transition text-center flex items-center justify-center gap-0.5 shadow-xs cursor-pointer"
                    >
                      ⚡ Buy Now
                    </BuyNowButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🌟 Verified Customer Reviews Section (PostgreSQL DB Backed) */}
      <div className="max-w-[1536px] mx-auto px-4 lg:px-8 pt-4">
        <ProductReviewsSection productId={product.id} productTitle={product.title} />
      </div>

      {/* 📲 PWA Floating Install App Prompt */}
      <PWAInstallPrompt />

      {/* 📏 Size Chart Modal Popup */}
      {showSizeChart && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs font-sans relative border border-gray-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                <span>📏</span> {sizeType === "shoes" ? "Footwear Size Chart & Fit Guide" : "Apparel Size Chart & Fit Guide"}
              </h3>
              <button
                type="button"
                onClick={() => setShowSizeChart(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-600 text-xs">
              {sizeType === "shoes" ? "Standard footwear sizing conversions:" : "Standard body measurements in inches (in):"}
            </p>

            {sizeType === "shoes" ? (
              <table className="w-full text-center border-collapse border border-gray-200 text-xs">
                <thead>
                  <tr className="bg-gray-100 font-black text-gray-900">
                    <th className="p-2.5 border border-gray-200">Size (UK)</th>
                    <th className="p-2.5 border border-gray-200">Length (cm)</th>
                    <th className="p-2.5 border border-gray-200">US Size</th>
                    <th className="p-2.5 border border-gray-200">EU Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium">
                  <tr className={selectedSize === "6" ? "bg-emerald-50 font-bold text-emerald-800" : ""}>
                    <td className="p-2.5 border border-gray-200 font-black">6</td>
                    <td className="p-2.5 border border-gray-200">24.5 cm</td>
                    <td className="p-2.5 border border-gray-200">7</td>
                    <td className="p-2.5 border border-gray-200">39</td>
                  </tr>
                  <tr className={selectedSize === "7" ? "bg-emerald-50 font-bold text-emerald-800" : ""}>
                    <td className="p-2.5 border border-gray-200 font-black">7</td>
                    <td className="p-2.5 border border-gray-200">25.5 cm</td>
                    <td className="p-2.5 border border-gray-200">8</td>
                    <td className="p-2.5 border border-gray-200">40.5</td>
                  </tr>
                  <tr className={selectedSize === "8" ? "bg-emerald-50 font-bold text-emerald-800" : ""}>
                    <td className="p-2.5 border border-gray-200 font-black">8</td>
                    <td className="p-2.5 border border-gray-200">26.5 cm</td>
                    <td className="p-2.5 border border-gray-200">9</td>
                    <td className="p-2.5 border border-gray-200">42</td>
                  </tr>
                  <tr className={selectedSize === "9" ? "bg-emerald-50 font-bold text-emerald-800" : ""}>
                    <td className="p-2.5 border border-gray-200 font-black">9</td>
                    <td className="p-2.5 border border-gray-200">27.5 cm</td>
                    <td className="p-2.5 border border-gray-200">10</td>
                    <td className="p-2.5 border border-gray-200">43.5</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <table className="w-full text-center border-collapse border border-gray-200 text-xs">
                <thead>
                  <tr className="bg-gray-100 font-black text-gray-900">
                    <th className="p-2.5 border border-gray-200">Size</th>
                    <th className="p-2.5 border border-gray-200">Chest</th>
                    <th className="p-2.5 border border-gray-200">Waist</th>
                    <th className="p-2.5 border border-gray-200">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium">
                  <tr className={selectedSize === "S" ? "bg-emerald-50 font-bold text-emerald-800" : ""}>
                    <td className="p-2.5 border border-gray-200 font-black">S</td>
                    <td className="p-2.5 border border-gray-200">36 - 38"</td>
                    <td className="p-2.5 border border-gray-200">30 - 32"</td>
                    <td className="p-2.5 border border-gray-200">27"</td>
                  </tr>
                  <tr className={selectedSize === "M" ? "bg-emerald-50 font-bold text-emerald-800" : ""}>
                    <td className="p-2.5 border border-gray-200 font-black">M</td>
                    <td className="p-2.5 border border-gray-200">38 - 40"</td>
                    <td className="p-2.5 border border-gray-200">32 - 34"</td>
                    <td className="p-2.5 border border-gray-200">28"</td>
                  </tr>
                  <tr className={selectedSize === "L" ? "bg-emerald-50 font-bold text-emerald-800" : ""}>
                    <td className="p-2.5 border border-gray-200 font-black">L</td>
                    <td className="p-2.5 border border-gray-200">40 - 42"</td>
                    <td className="p-2.5 border border-gray-200">34 - 36"</td>
                    <td className="p-2.5 border border-gray-200">29"</td>
                  </tr>
                  <tr className={selectedSize === "XL" ? "bg-emerald-50 font-bold text-emerald-800" : ""}>
                    <td className="p-2.5 border border-gray-200 font-black">XL</td>
                    <td className="p-2.5 border border-gray-200">42 - 44"</td>
                    <td className="p-2.5 border border-gray-200">36 - 38"</td>
                    <td className="p-2.5 border border-gray-200">30"</td>
                  </tr>
                </tbody>
              </table>
            )}

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-[11px] text-emerald-900 font-bold">
              💡 Tip: If you prefer a relaxed fit, we recommend selecting one size larger.
            </div>

            <button
              type="button"
              onClick={() => setShowSizeChart(false)}
              className="w-full bg-gray-900 hover:bg-black text-white font-black py-3 rounded-2xl text-xs uppercase"
            >
              Close Guide
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
