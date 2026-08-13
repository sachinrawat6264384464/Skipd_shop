"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BuyNowButton } from "components/auth/buy-now-button";
import { ProductZoomMagnifier } from "./product-zoom-magnifier";

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

            {/* Main Preview Image with Amazon-Style Interactive Magnifier */}
            <div className="flex-1">
              <ProductZoomMagnifier imageSrc={selectedImage} altText={product.title} />
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

            {/* 🎨 Color Swatches Selector */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-bold text-gray-900">Color: <span className="font-extrabold text-emerald-700">Black Manas</span></p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { name: "Black Manas", price: "₹1,799", mrp: "₹4,990", active: true },
                  { name: "Blue Psyche", price: "₹1,799", mrp: "₹4,990", active: false },
                  { name: "Solid Black", price: "₹2,499", mrp: "₹7,990", active: false },
                  { name: "Army Green", price: "₹2,499", mrp: "₹7,990", active: false },
                  { name: "Camo Green", price: "₹1,798", mrp: "₹4,999", active: false },
                  { name: "Olive Green", price: "₹1,799", mrp: "₹4,990", active: false }
                ].map((sw, idx) => (
                  <button
                    key={idx}
                    className={`shrink-0 border-2 rounded-2xl p-2 text-center text-[10px] transition cursor-pointer ${
                      sw.active ? "border-amber-500 bg-amber-50/50 text-gray-900 font-extrabold" : "border-gray-200 bg-white hover:border-gray-400 text-gray-700 font-medium"
                    }`}
                  >
                    <p className="font-bold line-clamp-1">{sw.name}</p>
                    <p className="text-emerald-700 font-black">{sw.price}</p>
                    <p className="text-gray-400 line-through text-[9px]">{sw.mrp}</p>
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

            {/* 🏆 Brand Trust Card (boAt Official Brand Card) */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-gray-900 text-sm">boAt Official Retail</span>
                <span className="bg-emerald-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded">Verified</span>
              </div>
              <p className="text-[11px] text-gray-700 font-medium">⭐ 85% Positive Ratings (from 100K+ customers)</p>
              <p className="text-[10px] text-gray-500">100K+ orders from this brand recently | 11+ years experience</p>
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

      {/* 🧩 "Frequently Bought Together" Section */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
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

              <BuyNowButton
                productHandle={product.handle}
                className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-xs py-3.5 rounded-2xl transition shadow-xs text-center block cursor-pointer"
              >
                Add Both to Cart
              </BuyNowButton>
              <p className="text-[10px] text-gray-500">Sponsored Products Related to This Item</p>
            </div>

          </div>
        </div>
      </div>

      {/* 📦 Sponsored Products Section */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-gray-900">Sponsored Products Related to This Item</h3>
            <span className="text-xs font-bold text-gray-400">Page 1 of 27</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { title: "boAt Rockerz 421, 60H Battery", price: 1099, mrp: 2490, off: "-56%", rating: "2,400", del: "FREE Delivery Sat, Aug 15", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
              { title: "boAt Rockerz 480, RGB LED", price: 1599, mrp: 3790, off: "-58%", rating: "4,695", del: "FREE Delivery Sat, Aug 15", image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400" },
              { title: "boAt Rockerz 650 Pro, Dolby Audio", price: 2499, mrp: 8990, off: "-72%", rating: "4,423", del: "FREE Delivery Sat, Aug 15", image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400" },
              { title: "Noise Airwave Max 3 Bluetooth", price: 1999, mrp: 5499, off: "-64%", rating: "4,204", del: "FREE Delivery Sat, Aug 15", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400" },
              { title: "boAt Rockerz 512 ANC, 80H Playback", price: 2599, mrp: 7990, off: "-67%", rating: "31,438", del: "FREE Delivery Sat, Aug 15", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400" },
              { title: "GOBOULT Mustang Torque 60H", price: 1799, mrp: 5999, off: "-70%", rating: "14,517", del: "FREE Delivery Sat, Aug 15", image: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400" },
              { title: "pTron Studio Classic 75H", price: 799, mrp: 2899, off: "-72%", rating: "207", del: "FREE Delivery Sat, Aug 15", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400" }
            ].map((sp, sIdx) => (
              <div key={sIdx} className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3 space-y-2 flex flex-col justify-between text-xs hover:shadow-md transition group">
                <div className="space-y-2">
                  <div className="relative aspect-square bg-white rounded-xl overflow-hidden p-2 border border-gray-100">
                    <img src={sp.image} alt={sp.title} className="w-full h-full object-contain group-hover:scale-105 transition duration-300" />
                    <span className="absolute top-1 left-1 bg-red-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase">
                      {sp.off}
                    </span>
                  </div>
                  <h4 className="font-bold text-[11px] text-gray-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition">{sp.title}</h4>
                  <p className="text-[10px] text-amber-500 font-bold">★ 4.1 ({sp.rating})</p>
                </div>
                <div>
                  <p className="font-black text-sm text-gray-900">₹{sp.price.toLocaleString("en-IN")}.00</p>
                  <p className="text-[10px] text-gray-400 line-through">M.R.P.: ₹{sp.mrp.toLocaleString("en-IN")}.00</p>
                  <p className="text-[9px] text-emerald-700 font-medium pt-0.5">{sp.del}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📱 Customers Also Viewed Section */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-gray-900">Customers Who Viewed This Item Also Viewed (Page 1 of 3)</h3>
            <span className="text-xs font-bold text-gray-400">Next set of slides &rarr;</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { name: "boAt Rockerz 480 RGB", price: 1499, mrp: 3790, off: "-60%", star: "4.1", reviews: "4,695", image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400" },
              { name: "boAt Rockerz Prime 415", price: 1799, mrp: 3999, off: "-55%", star: "4.1", reviews: "299", image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400" },
              { name: "boAt Rockerz 512 ANC", price: 2599, mrp: 7990, off: "-67%", star: "4.2", reviews: "31,438", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400" },
              { name: "boAt Rockerz Plus 550", price: 1799, mrp: 4990, off: "-64%", star: "4.0", reviews: "39", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
              { name: "boAt Rockerz 650 Pro", price: 2499, mrp: 8990, off: "-72%", star: "4.2", reviews: "4,423", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400" },
              { name: "boAt Rockerz 421 60H", price: 1099, mrp: 2490, off: "-56%", star: "4.0", reviews: "2,400", image: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400" },
              { name: "boAt Rockerz 411 40H", price: 1199, mrp: 2999, off: "-60%", star: "4.2", reviews: "28,965", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400" }
            ].map((viewed, vIdx) => (
              <div key={vIdx} className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3 space-y-2 flex flex-col justify-between text-xs hover:shadow-md transition group">
                <div className="space-y-2">
                  <div className="relative aspect-square bg-white rounded-xl overflow-hidden p-2 border border-gray-100">
                    <img src={viewed.image} alt={viewed.name} className="w-full h-full object-contain group-hover:scale-105 transition duration-300" />
                    <span className="absolute top-1 left-1 bg-orange-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase">
                      {viewed.off}
                    </span>
                  </div>
                  <h4 className="font-bold text-[11px] text-gray-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition">{viewed.name}</h4>
                  <p className="text-[10px] text-amber-500 font-bold">★ {viewed.star} ({viewed.reviews})</p>
                </div>
                <div>
                  <p className="font-black text-sm text-gray-900">₹{viewed.price.toLocaleString("en-IN")}.00</p>
                  <p className="text-[10px] text-gray-400 line-through">M.R.P.: ₹{viewed.mrp.toLocaleString("en-IN")}.00</p>
                  <p className="text-[9px] text-emerald-700 font-medium pt-0.5">FREE Delivery by Amazon</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
