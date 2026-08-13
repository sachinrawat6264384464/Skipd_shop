"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BuyNowButton } from "components/auth/buy-now-button";

interface ProductDetailViewProps {
  product: {
    id: number;
    title: string;
    handle: string;
    description: string;
    price: number;
    compare_at_price?: number;
    category?: { name: string; slug: string };
    images: string[];
    tags?: string[];
  };
  relatedProducts: any[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState(
    product.images[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
  );
  const [exchangeOption, setExchangeOption] = useState<"without" | "with">("without");

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
    <div className="space-y-8">
      
      {/* 🏷️ Top Sub-Navigation Header Bar with Interactive Hover Dropdowns */}
      <div className="bg-white border-b border-gray-200 py-2.5 px-4 overflow-visible shadow-2xs z-30 relative">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-xs font-semibold text-gray-700 whitespace-nowrap">
          <Link href="/search" className="font-black text-gray-900 hover:text-orange-600">
            {product.category?.name || "Electronics"}
          </Link>
          <span className="text-gray-300">|</span>

          {/* 1. Mobiles & Accessories */}
          <div className="relative group py-1 cursor-pointer">
            <Link href="/search/tech" className="hover:text-orange-600 flex items-center gap-1 font-semibold">
              Mobiles &amp; Accessories <span className="text-[10px] text-gray-400">▾</span>
            </Link>
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-150 z-50 text-xs space-y-1">
              <p className="font-black text-gray-900 text-[11px] px-3 py-1 uppercase tracking-wider text-amber-700">Mobiles</p>
              <Link href="/search?search=phone" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Smartphones &amp; Basic Mobiles</Link>
              <Link href="/search?search=case" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Mobile Cases &amp; Covers</Link>
              <Link href="/search?search=charger" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Fast Chargers &amp; Cables</Link>
              <Link href="/search?search=power" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Power Banks &amp; Wireless Pads</Link>
            </div>
          </div>

          {/* 2. Laptops & Accessories */}
          <div className="relative group py-1 cursor-pointer">
            <Link href="/search/tech" className="hover:text-orange-600 flex items-center gap-1 font-semibold">
              Laptops &amp; Accessories <span className="text-[10px] text-gray-400">▾</span>
            </Link>
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-150 z-50 text-xs space-y-1">
              <p className="font-black text-gray-900 text-[11px] px-3 py-1 uppercase tracking-wider text-amber-700">Laptops</p>
              <Link href="/search?search=laptop" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Gaming &amp; Performance Laptops</Link>
              <Link href="/search?search=macbook" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Thin &amp; Light Ultrabooks</Link>
              <Link href="/search?search=bag" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Laptop Sleeves &amp; Backpacks</Link>
              <Link href="/search?search=mouse" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Wireless Mice &amp; Keyboards</Link>
            </div>
          </div>

          {/* 3. TV & Home Entertainment */}
          <div className="relative group py-1 cursor-pointer">
            <Link href="/search/tech" className="hover:text-orange-600 flex items-center gap-1 font-semibold">
              TV &amp; Home Entertainment <span className="text-[10px] text-gray-400">▾</span>
            </Link>
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-150 z-50 text-xs space-y-1">
              <p className="font-black text-gray-900 text-[11px] px-3 py-1 uppercase tracking-wider text-amber-700">Home Cinema</p>
              <Link href="/search?search=tv" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">4K Ultra HD Smart TVs</Link>
              <Link href="/search?search=speaker" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Home Theatre Soundbars</Link>
              <Link href="/search?search=streaming" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Streaming Sticks &amp; Boxes</Link>
            </div>
          </div>

          {/* 4. Audio */}
          <div className="relative group py-1 cursor-pointer">
            <Link href="/search/tech" className="hover:text-orange-600 flex items-center gap-1 font-semibold">
              Audio <span className="text-[10px] text-gray-400">▾</span>
            </Link>
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-150 z-50 text-xs space-y-1">
              <p className="font-black text-gray-900 text-[11px] px-3 py-1 uppercase tracking-wider text-amber-700">Audio Gear</p>
              <Link href="/search?search=headphones" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Active ANC Headphones</Link>
              <Link href="/search?search=earbuds" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">True Wireless Earbuds (TWS)</Link>
              <Link href="/search?search=speaker" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Portable Bluetooth Speakers</Link>
            </div>
          </div>

          {/* 5. Camera */}
          <div className="relative group py-1 cursor-pointer">
            <Link href="/search/tech" className="hover:text-orange-600 flex items-center gap-1 font-semibold">
              Camera <span className="text-[10px] text-gray-400">▾</span>
            </Link>
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-150 z-50 text-xs space-y-1">
              <p className="font-black text-gray-900 text-[11px] px-3 py-1 uppercase tracking-wider text-amber-700">Photography</p>
              <Link href="/search?search=drone" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">RC 4K Camera Pro Drones</Link>
              <Link href="/search?search=camera" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">DSLR &amp; Mirrorless Cameras</Link>
              <Link href="/search?search=gimbal" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Action Cameras &amp; Gimbals</Link>
            </div>
          </div>

          {/* 6. Computer Accessories */}
          <div className="relative group py-1 cursor-pointer">
            <Link href="/search/tech" className="hover:text-orange-600 flex items-center gap-1 font-semibold">
              Computer Accessories <span className="text-[10px] text-gray-400">▾</span>
            </Link>
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-150 z-50 text-xs space-y-1">
              <p className="font-black text-gray-900 text-[11px] px-3 py-1 uppercase tracking-wider text-amber-700">Peripherals</p>
              <Link href="/search?search=ssd" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">External SSDs &amp; Hard Drives</Link>
              <Link href="/search?search=hub" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">USB Type-C Hubs &amp; Adapters</Link>
              <Link href="/search?search=webcam" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Full HD Webcams &amp; Mics</Link>
            </div>
          </div>

          {/* 7. Smart Technology */}
          <div className="relative group py-1 cursor-pointer">
            <Link href="/search/lifestyle" className="hover:text-orange-600 flex items-center gap-1 font-semibold">
              Smart Technology <span className="text-[10px] text-gray-400">▾</span>
            </Link>
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-150 z-50 text-xs space-y-1">
              <p className="font-black text-gray-900 text-[11px] px-3 py-1 uppercase tracking-wider text-amber-700">Wearables &amp; Smart</p>
              <Link href="/search?search=watch" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Smartwatches &amp; Fitness Bands</Link>
              <Link href="/search?search=light" className="block px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-700">Smart Home Lighting &amp; Plugs</Link>
            </div>
          </div>

        </div>
      </div>

      {/* 📍 Breadcrumb Bar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5 flex-wrap">
          <Link href="/search" className="hover:underline">{product.category?.name || "Electronics"}</Link>
          <span>&rsaquo;</span>
          <Link href="/search/tech" className="hover:underline">Catalog &amp; Accessories</Link>
          <span>&rsaquo;</span>
          <span className="text-gray-800 font-bold">{product.title}</span>
        </div>
      </div>

      {/* 🛍️ Main Product Hero Details (Matching Screenshot 1) */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 5-COL: Image Gallery & Main Photo */}
          <div className="lg:col-span-5 flex gap-4">
            
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

            {/* Main Preview Image */}
            <div className="flex-1 relative aspect-square bg-white rounded-3xl border border-gray-200 overflow-hidden p-6 shadow-xs group">
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
              />
              <span className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl cursor-pointer">
                ↗
              </span>
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
            </div>

          </div>

          {/* RIGHT 3-COL: Buy Box Card (Matching Screenshot 1) */}
          <div className="lg:col-span-3 bg-white border border-gray-300 rounded-3xl p-5 shadow-md space-y-4">
            
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
                  <span className="font-bold text-gray-900 block">With the exchange</span>
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
              <p className="text-[11px] text-gray-500">📍 Deliver to Sachin - Gwalior 474001</p>
              <p className="text-emerald-600 font-extrabold text-sm pt-1">In Stock</p>
              <p className="text-[10px] text-gray-500">Ships from and sold by SKIPD Official Retail.</p>
            </div>

            {/* 🛒 Add to Cart (Yellow) & ⚡ Buy Now (Orange) with Auth Guard */}
            <div className="space-y-2 pt-2">
              <BuyNowButton
                mode="cart"
                className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-xs py-3 rounded-2xl transition shadow-xs text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                🛒 Add to Cart
              </BuyNowButton>

              <BuyNowButton
                productHandle={product.handle}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-3 rounded-2xl transition shadow-md shadow-orange-500/20 text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                ⚡ Buy Now
              </BuyNowButton>
            </div>

          </div>

        </div>
      </div>

      {/* 🧩 "Frequently Purchased Together" Section (Matching Screenshot 3) */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
          <h3 className="text-base font-black text-gray-900 uppercase tracking-wider">Frequently purchased together</h3>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Items Cards Bundle */}
            <div className="flex flex-wrap items-center gap-4">
              {bundleItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 w-44 space-y-2 text-xs relative">
                    <input
                      type="checkbox"
                      checked={bundleChecked[item.id as keyof typeof bundleChecked]}
                      onChange={(e) =>
                        setBundleChecked({ ...bundleChecked, [item.id]: e.target.checked })
                      }
                      className="absolute top-3 right-3 accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                    <img src={item.image} alt={item.title} className="w-24 h-24 object-contain mx-auto rounded-lg" />
                    <p className="font-semibold text-gray-800 line-clamp-2 leading-tight">{item.title}</p>
                    <p className="font-black text-gray-900">₹{item.price.toLocaleString("en-IN")}</p>
                  </div>

                  {index < bundleItems.length - 1 && (
                    <span className="text-2xl font-black text-gray-400">+</span>
                  )}
                </div>
              ))}
            </div>

            {/* Bundle Checkout Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-center space-y-3 shrink-0 w-full lg:w-64">
              <span className="text-xs text-gray-600 font-semibold block">Total Price:</span>
              <span className="text-2xl font-black text-gray-900 block">₹{bundleTotal.toLocaleString("en-IN")}.00</span>

              <BuyNowButton
                productHandle={product.handle}
                className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-xs py-3 rounded-2xl transition shadow-xs text-center block cursor-pointer"
              >
                Add All 3 to Cart
              </BuyNowButton>
              <p className="text-[10px] text-gray-500">Shipped from and sold by different verified sellers.</p>
            </div>

          </div>
        </div>
      </div>

      {/* 📱 "Customers who viewed this item also viewed" Horizontal Carousel (Matching Screenshot 3 & 4) */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-gray-900">Customers who viewed this item also viewed</h3>
            <span className="text-xs font-bold text-gray-400">Page 1 of 3</span>
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {relatedProducts.map((rel) => (
              <div key={rel.id} className="shrink-0 w-44 bg-gray-50 border border-gray-200/80 rounded-2xl p-3 space-y-2 group hover:shadow-md transition">
                <Link href={`/product/${rel.handle}`} className="block relative aspect-square bg-white rounded-xl overflow-hidden p-2 border border-gray-100">
                  <img src={rel.images[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300"} alt={rel.title} className="w-full h-full object-contain group-hover:scale-105 transition" />
                </Link>
                <Link href={`/product/${rel.handle}`} className="block font-bold text-xs text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
                  {rel.title}
                </Link>
                <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                  ★★★★☆ <span className="text-gray-500 font-normal">(2,208)</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-gray-900">₹{rel.price.toLocaleString("en-IN")}</span>
                  {rel.compare_at_price && <span className="text-[10px] text-gray-400 line-through">₹{rel.compare_at_price.toLocaleString("en-IN")}</span>}
                </div>
                <span className="inline-block bg-red-600 text-white font-extrabold text-[9px] uppercase px-2 py-0.5 rounded">
                  Lightning Deals
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📦 "Related products with free delivery on eligible orders" (Matching Screenshot 4) */}
      <div className="max-w-7xl mx-auto px-4 pt-2">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-gray-900">Related products with free delivery on eligible orders</h3>
            <span className="text-xs font-bold text-gray-400">Page 1 of 52</span>
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {relatedProducts.map((rel) => (
              <div key={rel.id + "_rel"} className="shrink-0 w-44 bg-gray-50 border border-gray-200/80 rounded-2xl p-3 space-y-2 group hover:shadow-md transition">
                <Link href={`/product/${rel.handle}`} className="block relative aspect-square bg-white rounded-xl overflow-hidden p-2 border border-gray-100">
                  <img src={rel.images[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300"} alt={rel.title} className="w-full h-full object-contain group-hover:scale-105 transition" />
                </Link>
                <Link href={`/product/${rel.handle}`} className="block font-bold text-xs text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
                  {rel.title}
                </Link>
                <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                  ★★★★☆ <span className="text-gray-500 font-normal">(1,835)</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-gray-900">₹{rel.price.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
