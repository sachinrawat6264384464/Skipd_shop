"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "components/auth/auth-provider";
import { getUserCartKey } from "lib/utils";
import { ProductZoomMagnifier } from "./product-zoom-magnifier";

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

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const [warrantyAdded, setWarrantyAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(
    product.images[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
  );
  const [exchangeOption, setExchangeOption] = useState<"without" | "with">("without");
  const [openSubNav, setOpenSubNav] = useState<string | null>(null);

  // States for Add-on Items and Toast
  const [addon1Added, setAddon1Added] = useState(false);
  const [addon2Added, setAddon2Added] = useState(false);
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
      { name: "Black Manas", price: product.price, mrp: product.compare_at_price || Math.round(product.price * 1.25) },
      { name: "Blue Psyche", price: product.price, mrp: product.compare_at_price || Math.round(product.price * 1.25) },
      { name: "Solid Black", price: Math.round(product.price * 1.1), mrp: Math.round(product.price * 1.35) },
      { name: "Army Green", price: Math.round(product.price * 1.1), mrp: Math.round(product.price * 1.35) },
      { name: "Camo Green", price: Math.round(product.price * 0.95), mrp: Math.round(product.price * 1.2) },
      { name: "Olive Green", price: product.price, mrp: product.compare_at_price || Math.round(product.price * 1.25) }
    ];
  }

  const [selectedColor, setSelectedColor] = useState(parsedColorList[0]?.name || "Default");

  // Add to Cart handler (Requires Login)
  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    requireAuth(() => {
      const cartKey = getUserCartKey();
      const existing = JSON.parse(localStorage.getItem(cartKey) || "[]");
      const itemToAdd = {
        id: product.id,
        handle: product.handle,
        title: `${product.title} (${selectedColor})`,
        price: product.price,
        quantity: 1,
        image: selectedImage
      };

      const idx = existing.findIndex((i: any) => i.id === product.id || i.handle === product.handle);
      let updated;
      if (idx > -1) {
        existing[idx].quantity += 1;
        updated = [...existing];
      } else {
        updated = [...existing, itemToAdd];
      }
      localStorage.setItem(cartKey, JSON.stringify(updated));
      window.dispatchEvent(new Event("skipd_cart_changed"));

      setCartAddedToast(true);
      setTimeout(() => setCartAddedToast(false), 3000);
    });
  };

  // Buy Now handler (Requires Login)
  const handleBuyNow = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    requireAuth(() => {
      const mainItem = {
        id: product.id,
        handle: product.handle,
        title: `${product.title} (${selectedColor})`,
        price: product.price,
        quantity: 1,
        image: selectedImage
      };
      sessionStorage.setItem("skipd_buy_now_item", JSON.stringify([mainItem]));
      router.push("/checkout?buyNow=true");
    });
  };

  // Buy Combo handler ("Add Both to Cart" -> "Buy Combo") (Requires Login)
  const handleBuyCombo = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    requireAuth(() => {
      const cartKey = getUserCartKey();
      const mainItem = {
        id: product.id,
        handle: product.handle,
        title: `${product.title} (${selectedColor})`,
        price: product.price,
        quantity: 1,
        image: selectedImage
      };
      const comboItem = {
        id: product.id + 9901,
        handle: "gadgetbite-eva-hard-case",
        title: "GadgetBite Headphone Carrying Hard EVA Case Storage Bag (Black)",
        price: 400,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400"
      };

      localStorage.setItem(cartKey, JSON.stringify([mainItem, comboItem]));
      window.dispatchEvent(new Event("skipd_cart_changed"));
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
      window.dispatchEvent(new Event("skipd_cart_changed"));
      setAddedState(true);
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

            {/* 🌟 Customer Ratings & Review Breakdown Card under Image Gallery */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-black text-gray-900 text-sm">Customer Reviews &amp; Ratings</h3>
                <span className="text-amber-500 font-bold text-xs">4.3 ★★★★☆</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="w-12 font-bold text-gray-600">5 Star</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: "68%" }} />
                  </div>
                  <span className="w-8 text-right text-gray-500 font-semibold">68%</span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="w-12 font-bold text-gray-600">4 Star</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: "18%" }} />
                  </div>
                  <span className="w-8 text-right text-gray-500 font-semibold">18%</span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="w-12 font-bold text-gray-600">3 Star</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: "8%" }} />
                  </div>
                  <span className="w-8 text-right text-gray-500 font-semibold">8%</span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="w-12 font-bold text-gray-600">2 Star</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: "4%" }} />
                  </div>
                  <span className="w-8 text-right text-gray-500 font-semibold">4%</span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="w-12 font-bold text-gray-600">1 Star</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: "2%" }} />
                  </div>
                  <span className="w-8 text-right text-gray-500 font-semibold">2%</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-[11px]">
                <span className="text-emerald-900 font-bold">🛡️ 100% Genuine Product &amp; Express Delivery</span>
                <span className="text-emerald-700 font-extrabold">Verified</span>
              </div>
            </div>

            {/* 💬 Verified Customer Reviews Snippets Card under Ratings Breakdown */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-4 text-xs">
              <h4 className="font-black text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center justify-between">
                <span>Top Verified Customer Reviews</span>
                <span className="text-[10px] text-emerald-700 font-bold">View All 1,732 &rsaquo;</span>
              </h4>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">★★★★★</div>
                    <span className="text-[10px] text-gray-400 font-medium">Aug 10, 2026</span>
                  </div>
                  <p className="font-bold text-gray-900">"Outstanding ANC &amp; sound clarity!"</p>
                  <p className="text-gray-600 text-[11px] leading-snug">The bass response is punchy and active noise cancellation easily blocks out office noise. Battery lasts 4+ days!</p>
                  <p className="text-[10px] text-emerald-700 font-bold pt-0.5">✓ Verified Purchase • Rohan M.</p>
                </div>

                <div className="space-y-1 border-t border-gray-100 pt-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">★★★★★</div>
                    <span className="text-[10px] text-gray-400 font-medium">Aug 08, 2026</span>
                  </div>
                  <p className="font-bold text-gray-900">"Super comfortable memory foam earcups"</p>
                  <p className="text-gray-600 text-[11px] leading-snug">Ear cushions are ultra-soft and lightweight. Perfect for long work &amp; gaming sessions without ear fatigue.</p>
                  <p className="text-[10px] text-emerald-700 font-bold pt-0.5">✓ Verified Purchase • Neha P.</p>
                </div>

                <div className="space-y-1 border-t border-gray-100 pt-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">★★★★★</div>
                    <span className="text-[10px] text-gray-400 font-medium">Aug 05, 2026</span>
                  </div>
                  <p className="font-bold text-gray-900">"Sleek design &amp; instant Bluetooth 5.4 pairing"</p>
                  <p className="text-gray-600 text-[11px] leading-snug">Connects immediately with both phone and laptop. Audio quality and mic clarity are top notch.</p>
                  <p className="text-[10px] text-emerald-700 font-bold pt-0.5">✓ Verified Purchase • Amit K.</p>
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
              <p className="text-xs text-blue-600 font-semibold mt-1">Visit the SKIPD Official Store</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-amber-500 font-bold">4.3 ★★★★☆</span>
                <span className="text-blue-600 font-medium hover:underline cursor-pointer">(1,732 ratings)</span>
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
              <p className="text-xs font-semibold text-gray-800">
                EMI starts at ₹1,564. No-cost EMI available. <span className="text-blue-600 cursor-pointer hover:underline">EMI Options ▾</span>
              </p>
            </div>

            {/* 🎁 Offers Carousel Box */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">🏷️ Applicable Offers</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 space-y-1">
                  <h5 className="font-bold text-gray-900 text-[11px]">No Cost EMI</h5>
                  <p className="text-[10px] text-gray-600 leading-tight">Select Credit Cards, Bajaj Finserv EMI Card, Amazon Pay...</p>
                  <span className="text-[10px] text-blue-600 font-bold hover:underline block pt-1">3 offers &rsaquo;</span>
                </div>
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 space-y-1">
                  <h5 className="font-bold text-gray-900 text-[11px]">Bank Offers</h5>
                  <p className="text-[10px] text-gray-600 leading-tight">Up to ₹2,500.00 off on select Credit Cards, SBI Debit...</p>
                  <span className="text-[10px] text-blue-600 font-bold hover:underline block pt-1">10 offers &rsaquo;</span>
                </div>
              </div>

              {/* UPI Cashback Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs flex items-center justify-between text-emerald-900 font-bold">
                <span>💎 Earn ₹179 cashback worth ₹17.9 on all UPI payments</span>
                <span className="text-emerald-700">&rsaquo;</span>
              </div>
            </div>

            {/* 🛡️ Service & Guarantee Icons Bar */}
            <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-gray-100 text-center text-[10px] font-semibold text-gray-700">
              <div className="space-y-1 p-2 bg-gray-50 rounded-xl">
                <span className="text-lg block">🔄</span>
                <span>10 Days Replacement</span>
              </div>
              <div className="space-y-1 p-2 bg-gray-50 rounded-xl">
                <span className="text-lg block">🚚</span>
                <span>Free Delivery</span>
              </div>
              <div className="space-y-1 p-2 bg-gray-50 rounded-xl">
                <span className="text-lg block">🛡️</span>
                <span>1 Year Warranty</span>
              </div>
              <div className="space-y-1 p-2 bg-gray-50 rounded-xl">
                <span className="text-lg block">💵</span>
                <span>Pay on Delivery</span>
              </div>
              <div className="space-y-1 p-2 bg-gray-50 rounded-xl">
                <span className="text-lg block">🏆</span>
                <span>Top Brand</span>
              </div>
              <div className="space-y-1 p-2 bg-gray-50 rounded-xl">
                <span className="text-lg block">📦</span>
                <span>SKIPD Fulfilled</span>
              </div>
            </div>

            {/* 🎨 Dynamic Color Swatches Selector */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-bold text-gray-900">Color: <span className="font-extrabold text-emerald-700">{selectedColor}</span></p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {parsedColorList.map((sw, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColor(sw.name)}
                    className={`shrink-0 border-2 rounded-2xl p-2 text-center text-[10px] transition cursor-pointer ${
                      selectedColor === sw.name ? "border-amber-500 bg-amber-50/50 text-gray-900 font-extrabold shadow-2xs" : "border-gray-200 bg-white hover:border-gray-400 text-gray-700 font-medium"
                    }`}
                  >
                    <p className="font-bold line-clamp-1">{sw.name}</p>
                    <p className="text-emerald-700 font-black">₹{sw.price.toLocaleString("en-IN")}</p>
                    <p className="text-gray-400 line-through text-[9px]">₹{sw.mrp.toLocaleString("en-IN")}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 📋 About This Item Specs Bullet Points */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">About this item</h4>
              <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside leading-relaxed font-medium">
                <li><span className="font-bold text-gray-900">Customizable Earcups:</span> Match your vibe every day with customizable magnetic earcups.</li>
                <li><span className="font-bold text-gray-900">50mm Drivers:</span> Feel every beat with punchy audio &amp; signature deep bass response.</li>
                <li><span className="font-bold text-gray-900">Up to 100 Hours Playback:</span> Power through long playlists with massive 100H battery life.</li>
                <li><span className="font-bold text-gray-900">Bluetooth v5.4 &amp; AUX:</span> Seamless wireless connection plus included 3.5mm AUX cable.</li>
                <li><span className="font-bold text-gray-900">Dual Pairing &amp; AI-ENC:</span> Connect phone and laptop simultaneously with crystal-clear calls.</li>
              </ul>
            </div>

            {/* 📦 Box Contents Section */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">📦 What is in the box</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold text-gray-700">
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-lg block">🎧</span>
                  <span>Headphones</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-lg block">🔌</span>
                  <span>Charging Cable</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-lg block">🔊</span>
                  <span>AUX Cable</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-lg block">📖</span>
                  <span>User Manual</span>
                </div>
              </div>
            </div>

            {/* 🏆 Brand Trust Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-gray-900 text-sm">boAt Official Retail</span>
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
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-xs space-y-1">
                <div className="flex items-center gap-1 font-black text-sky-700 text-sm">
                  <span>prime</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-tight">Enjoy unlimited free same-day/1-day delivery &amp; extra offers.</p>
                <button className="text-[10px] font-bold text-sky-700 hover:underline cursor-pointer">Join Prime &rsaquo;&rsaquo;</button>
              </div>

              {/* Exchange Radio Selectors */}
              <div className="space-y-2 border-t border-b border-gray-100 py-3 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="exchange"
                    checked={exchangeOption === "with"}
                    onChange={() => setExchangeOption("with")}
                    className="mt-0.5 accent-amber-500"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">With exchange</span>
                    <span className="text-red-600 font-bold text-[11px]">Up to ₹28,000.00 off</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                  <input
                    type="radio"
                    name="exchange"
                    checked={exchangeOption === "without"}
                    onChange={() => setExchangeOption("without")}
                    className="mt-0.5 accent-amber-500"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">Without exchange</span>
                    <span className="text-gray-900 font-black">₹{product.price.toLocaleString("en-IN")}.00</span>
                    <span className="text-gray-400 line-through text-[10px] ml-1">₹{(product.compare_at_price || product.price * 1.2).toLocaleString("en-IN")}</span>
                  </div>
                </label>
              </div>

              {/* Delivery Info */}
              <div className="space-y-1 text-xs text-gray-700">
                <p className="font-bold text-emerald-700">FREE delivery Saturday, Aug 15.</p>
                <p className="text-[11px] text-gray-500">📍 Deliver to Gwalior 474001</p>
                {product.stock_quantity === 0 ? (
                  <p className="text-red-600 font-black text-sm pt-1 uppercase tracking-wider animate-pulse">🚫 OUT OF STOCK</p>
                ) : (
                  <p className="text-emerald-600 font-extrabold text-sm pt-1">In Stock ({product.stock_quantity ?? 50} units available)</p>
                )}
                <p className="text-[10px] text-gray-500">Ships from and sold by SKIPD Official Retail.</p>
              </div>

              {/* 🛒 Add to Cart (White) & ⚡ Buy Now (Brand Emerald Logo Color) Buttons */}
              <div className="space-y-2 pt-2">
                {product.stock_quantity === 0 ? (
                  <button
                    disabled
                    className="w-full bg-red-50 border-2 border-red-500 text-red-600 font-black text-xs py-3.5 rounded-2xl text-center uppercase tracking-wider cursor-not-allowed opacity-90 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    🚫 Currently Out of Stock
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

            </div>

            {/* 2. 🛡️ SKIPD Protection Plan Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-gray-900">🛡️ SKIPD Protect Plan</span>
                <span className="text-emerald-700 font-black">₹199</span>
              </div>
              <p className="text-gray-500 text-[11px] leading-tight">Add 1-Year Extended Warranty covering accidental damage &amp; battery replacement.</p>
              <button
                type="button"
                onClick={() => {
                  requireAuth(() => {
                    handleAddAddon(
                      { id: 9903, title: "SKIPD Protect 1-Year Extended Warranty", price: 199, image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200" },
                      setWarrantyAdded
                    );
                  });
                }}
                className={`w-full font-extrabold py-2 rounded-xl text-[11px] transition cursor-pointer ${
                  warrantyAdded ? "bg-emerald-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                {warrantyAdded ? "✓ Warranty Plan Added" : "+ Add Warranty Coverage"}
              </button>
            </div>

            {/* 3. 🏪 Seller & Express Shipping Info */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white font-black text-xs flex items-center justify-center">
                  S
                </div>
                <div>
                  <p className="font-bold text-gray-900">SKIPD Official Retail Hub</p>
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
                  <span className="font-bold text-gray-900">SKIPD Express Logistics</span>
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
                    onClick={() => handleAddAddon({ id: 9901, title: "EVA Hard Storage Case", price: 400, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400" }, setAddon1Added)}
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
                    onClick={() => handleAddAddon({ id: 9902, title: "65W Fast Wall Adapter", price: 599, image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400" }, setAddon2Added)}
                    className={`font-extrabold text-[10px] px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      addon2Added ? "bg-emerald-600 text-white" : "bg-gray-900 hover:bg-black text-white"
                    }`}
                  >
                    {addon2Added ? "✓ Added" : "+ Add"}
                  </button>
                </div>
              </div>
            </div>

            {/* 6. 🔒 100% Encrypted & Bank-Grade Security Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-2xs space-y-2 text-xs">
              <div className="flex justify-between items-center text-[11px] font-bold text-gray-800">
                <span>🔒 256-Bit Bank Encryption</span>
                <span className="text-emerald-700 font-extrabold text-[10px]">Verified SSL</span>
              </div>
              <div className="flex items-center justify-around text-gray-500 text-[10px] font-bold border-t border-gray-100 pt-2">
                <span>UPI / QR</span>
                <span>•</span>
                <span>Cards</span>
                <span>•</span>
                <span>NetBanking</span>
                <span>•</span>
                <span>COD</span>
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
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 w-56 space-y-2 text-xs relative">
                <span className="absolute top-3 right-3 text-emerald-600 font-bold text-sm">✓</span>
                <img src={selectedImage} alt={product.title} className="w-24 h-24 object-contain mx-auto rounded-lg" />
                <p className="font-bold text-gray-900 line-clamp-2 leading-tight">This item: {product.title}</p>
                <p className="font-black text-gray-900">₹{product.price.toLocaleString("en-IN")}.00</p>
              </div>

              <span className="text-2xl font-black text-gray-400">+</span>

              {/* Item 2: GadgetBite Carrying EVA Case */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 w-64 space-y-2 text-xs relative">
                <span className="absolute top-3 right-3 text-emerald-600 font-bold text-sm">✓</span>
                <img src="https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400" alt="GadgetBite EVA Storage Case" className="w-24 h-24 object-contain mx-auto rounded-lg" />
                <p className="font-bold text-gray-900 line-clamp-2 leading-tight">GadgetBite Headphone Carrying Hard EVA Case Storage Bag (Black)</p>
                <p className="font-black text-gray-900">₹400.00</p>
              </div>
            </div>

            {/* Bundle Checkout Box */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 text-center space-y-3 shrink-0 w-full lg:w-72 shadow-2xs">
              <span className="text-xs text-gray-600 font-bold block">Total Price:</span>
              <span className="text-2xl font-black text-gray-900 block">₹{(product.price + 400).toLocaleString("en-IN")}.00</span>

              <button
                type="button"
                onClick={handleBuyCombo}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3.5 rounded-2xl transition shadow-md shadow-emerald-600/20 text-center block cursor-pointer uppercase tracking-wider"
              >
                ⚡ Buy Combo
              </button>
              <p className="text-[10px] text-gray-500">Includes Main Product + Hard Storage Case</p>
            </div>

          </div>
        </div>
      </div>


      {/* 📦 Sponsored Products Section */}
      <div className="max-w-[1536px] mx-auto px-4 lg:px-8 pt-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-gray-900">Sponsored Products Related to This Item</h3>
            <span className="text-xs font-bold text-gray-400">Page 1 of 27</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {(relatedProducts.length > 0 ? relatedProducts.slice(0, 7) : []).map((sp, sIdx) => {
              const spPrice = Number(sp.price || 0);
              const spCompare = Number(sp.compare_at_price || spPrice * 1.3);
              const discountPercent = spCompare > spPrice ? Math.round(((spCompare - spPrice) / spCompare) * 100) : 0;
              const spImg = sp.images && sp.images.length > 0 ? sp.images[0] : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";

              return (
                <Link
                  key={sIdx}
                  href={`/product/${sp.handle}`}
                  className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3 space-y-2 flex flex-col justify-between text-xs hover:shadow-md hover:border-emerald-400 transition group cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-square bg-white rounded-xl overflow-hidden p-2 border border-gray-100">
                      <img src={spImg} alt={sp.title} className="w-full h-full object-contain group-hover:scale-105 transition duration-300" />
                      {discountPercent > 0 && (
                        <span className="absolute top-1 left-1 bg-red-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-[11px] text-gray-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition">{sp.title}</h4>
                    <p className="text-[10px] text-amber-500 font-bold">★ 4.8 (Verified)</p>
                  </div>
                  <div>
                    <p className="font-black text-sm text-gray-900">₹{spPrice.toLocaleString("en-IN")}.00</p>
                    {spCompare > spPrice && (
                      <p className="text-[10px] text-gray-400 line-through">M.R.P.: ₹{spCompare.toLocaleString("en-IN")}.00</p>
                    )}
                    <p className="text-[9px] text-emerald-700 font-medium pt-0.5">FREE Fast Delivery</p>
                  </div>
                </Link>
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
            {(relatedProducts.length > 7 ? relatedProducts.slice(7, 14) : relatedProducts.slice(0, 7)).map((viewed, vIdx) => {
              const vPrice = Number(viewed.price || 0);
              const vCompare = Number(viewed.compare_at_price || vPrice * 1.25);
              const vDiscount = vCompare > vPrice ? Math.round(((vCompare - vPrice) / vCompare) * 100) : 0;
              const vImg = viewed.images && viewed.images.length > 0 ? viewed.images[0] : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";

              return (
                <Link
                  key={vIdx}
                  href={`/product/${viewed.handle}`}
                  className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3 space-y-2 flex flex-col justify-between text-xs hover:shadow-md hover:border-emerald-400 transition group cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-square bg-white rounded-xl overflow-hidden p-2 border border-gray-100">
                      <img src={vImg} alt={viewed.title} className="w-full h-full object-contain group-hover:scale-105 transition duration-300" />
                      {vDiscount > 0 && (
                        <span className="absolute top-1 left-1 bg-orange-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase">
                          -{vDiscount}%
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-[11px] text-gray-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition">{viewed.title}</h4>
                    <p className="text-[10px] text-amber-500 font-bold">★ 4.7 (Top Rated)</p>
                  </div>
                  <div>
                    <p className="font-black text-sm text-gray-900">₹{vPrice.toLocaleString("en-IN")}.00</p>
                    {vCompare > vPrice && (
                      <p className="text-[10px] text-gray-400 line-through">M.R.P.: ₹{vCompare.toLocaleString("en-IN")}.00</p>
                    )}
                    <p className="text-[9px] text-emerald-700 font-medium pt-0.5">In Stock - Shipped from DB</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
