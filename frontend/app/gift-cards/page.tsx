"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "components/layout/footer";
import { BuyNowButton } from "components/auth/buy-now-button";

export default function GiftCardsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const giftProducts = [
    {
      id: 1,
      title: "Winter Heavy Trench Wool Jacket",
      handle: "winter-trench-jacket",
      price: 3999,
      compare_at_price: 6999,
      discount: "43% OFF",
      rating: "4.5 (2,356)",
      image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400",
      category: "Fashion & Apparel",
    },
    {
      id: 2,
      title: "RC 4K Camera Pro Toy Drone",
      handle: "rc-4k-toy-drone",
      price: 2499,
      compare_at_price: 4999,
      discount: "50% OFF",
      rating: "4.6 (1,245)",
      image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400",
      category: "Electronics",
    },
    {
      id: 3,
      title: "Matte Black Leather Chrono Watch",
      handle: "matte-black-chrono-watch",
      price: 3499,
      compare_at_price: 5499,
      discount: "36% OFF",
      rating: "4.4 (985)",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      category: "Lifestyle",
    },
    {
      id: 4,
      title: "Nike Air Force 1 '07 Sneakers",
      handle: "nike-air-force-1",
      price: 7495,
      compare_at_price: 8995,
      discount: "17% OFF",
      rating: "4.8 (1,876)",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",
      category: "Fashion & Apparel",
    },
    {
      id: 5,
      title: "OnePlus Nord 6 | 8GB+256GB Pitch Black",
      handle: "oneplus-nord-6",
      price: 44499,
      compare_at_price: 52999,
      discount: "16% OFF",
      rating: "4.8 (3,215)",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
      category: "Electronics",
    },
  ];

  const filteredProducts =
    selectedCategory === "All Categories"
      ? giftProducts
      : giftProducts.filter((p) => p.category === selectedCategory);

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 w-full">
        
        {/* 🎁 Page Header Title (Matching Screenshot 1) */}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Gift Cards for Every Occasion</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">Easy to buy, easy to send. Let them choose what they love.</p>
        </div>

        {/* 🃏 4 Gift Card Type Cards (Matching Screenshot 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* E-Gift Card */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-xl shadow-xs">
                📱
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">E-Gift Card</h3>
                <p className="text-[10px] text-gray-500">Instant delivery on email or SMS</p>
              </div>
            </div>
            <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-emerald-600">
              &rarr;
            </span>
          </div>

          {/* Physical Gift Card */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-xs">
                💳
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">Physical Gift Card</h3>
                <p className="text-[10px] text-gray-500">Beautifully packed &amp; delivered</p>
              </div>
            </div>
            <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-indigo-600">
              &rarr;
            </span>
          </div>

          {/* Brand Gift Card */}
          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-xl shadow-xs">
                🛍️
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">Brand Gift Card</h3>
                <p className="text-[10px] text-gray-500">Top brands, endless choices</p>
              </div>
            </div>
            <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-amber-600">
              &rarr;
            </span>
          </div>

          {/* Corporate / Bulk */}
          <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center text-xl shadow-xs">
                💼
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">Corporate / Bulk</h3>
                <p className="text-[10px] text-gray-500">Bulk gifting for employees</p>
              </div>
            </div>
            <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-purple-600">
              &rarr;
            </span>
          </div>

        </div>

        {/* 💊 4 Value Prop Pill Icons Bar (Matching Screenshot 1) */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-3 shadow-2xs grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium text-gray-700">
          <div className="flex items-center gap-2.5 px-2">
            <span className="text-xl">💳</span>
            <div>
              <span className="font-bold text-gray-900 block text-[11px]">Add to Account</span>
              <span className="text-[10px] text-gray-500">Store &amp; use anytime</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-2 border-l border-gray-100">
            <span className="text-xl">📅</span>
            <div>
              <span className="font-bold text-gray-900 block text-[11px]">Schedule Delivery</span>
              <span className="text-[10px] text-gray-500">Pick a date that matters</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-2 border-l border-gray-100">
            <span className="text-xl">✏️</span>
            <div>
              <span className="font-bold text-gray-900 block text-[11px]">Personalize</span>
              <span className="text-[10px] text-gray-500">Add message &amp; make special</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-2 border-l border-gray-100">
            <span className="text-xl">🛡️</span>
            <div>
              <span className="font-bold text-gray-900 block text-[11px]">Secure &amp; Reliable</span>
              <span className="text-[10px] text-gray-500">100% safe transactions</span>
            </div>
          </div>
        </div>

        {/* 🎁 Offer Banners Row (Matching Screenshot 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Banner 1: Contest Points */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3 flex flex-col justify-between shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase">Send a Gift Card &amp; Get</p>
              <h3 className="text-base font-black text-gray-900">₹3,000 Gift Points 🎁</h3>
            </div>
            <button className="bg-emerald-600 text-white font-bold text-[11px] px-4 py-1.5 rounded-xl hover:bg-emerald-700 transition w-fit cursor-pointer">
              Explore Now
            </button>
          </div>

          {/* Banner 2: Up to 50% Off */}
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 space-y-3 flex flex-col justify-between shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-teal-700 uppercase">Up to</p>
              <h3 className="text-lg font-black text-gray-900">50% OFF</h3>
              <p className="text-[10px] text-gray-600 font-semibold">on Brand Gift Cards</p>
            </div>
            <button className="bg-white border border-teal-300 text-teal-800 font-bold text-[11px] px-4 py-1.5 rounded-xl hover:bg-teal-100 transition w-fit cursor-pointer">
              View Brands
            </button>
          </div>

          {/* Banner 3: Central 12% Off */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex justify-between items-center shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Flat</p>
              <h3 className="text-base font-black text-gray-900">12% OFF</h3>
              <p className="text-[10px] text-gray-500 font-medium">Central Brand New</p>
              <button className="mt-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-[10px] px-3.5 py-1 rounded-xl transition cursor-pointer">
                Buy Now
              </button>
            </div>
            <div className="w-14 h-14 bg-white rounded-xl border border-amber-200 flex flex-col items-center justify-center p-1 shadow-2xs">
              <span className="text-[9px] font-black text-red-600">CENTRAL</span>
            </div>
          </div>

          {/* Banner 4: Big Bazaar 5% Off */}
          <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 flex justify-between items-center shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Flat</p>
              <h3 className="text-base font-black text-gray-900">5% OFF</h3>
              <p className="text-[10px] text-gray-500 font-medium">Big Bazaar</p>
              <button className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-3.5 py-1 rounded-xl transition cursor-pointer">
                Buy Now
              </button>
            </div>
            <div className="w-14 h-14 bg-white rounded-xl border border-purple-200 flex flex-col items-center justify-center p-1 shadow-2xs">
              <span className="text-[9px] font-black text-orange-600">BIG BAZAAR</span>
            </div>
          </div>

        </div>

        {/* 🛍️ Bestsellers Section with Left Category Sidebar & Cards Grid (Matching Screenshot 1) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-xl font-black text-gray-900">Bestsellers</h2>
              <p className="text-xs text-gray-500">Most loved gifts, chosen by thousands.</p>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Sort by:</span>
              <select className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 font-bold text-gray-800 text-xs focus:outline-none">
                <option value="bestselling">Best Selling</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 3-Col Sidebar: Category Filter */}
            <div className="lg:col-span-3 bg-white border border-gray-200/80 rounded-2xl p-4 space-y-4 shadow-2xs">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Categories</h3>
              
              <ul className="space-y-1 text-xs font-semibold text-gray-700">
                {[
                  "All Categories",
                  "Fashion & Apparel",
                  "Electronics",
                  "Lifestyle",
                  "Home & Living",
                  "Gift Cards"
                ].map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <h4 className="text-xs font-bold text-gray-900">Price Range</h4>
                <input type="range" min="0" max="20000" className="w-full accent-emerald-600 cursor-pointer" />
                <div className="flex justify-between text-[11px] font-bold text-gray-500">
                  <span>₹0</span>
                  <span>₹20,000+</span>
                </div>
              </div>
            </div>

            {/* Right 9-Col Product Grid (Matching Screenshot 1) */}
            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden p-3 shadow-2xs space-y-2 flex flex-col justify-between hover:shadow-md transition relative group"
                >
                  <span className="absolute top-4 left-4 z-10 bg-red-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase">
                    {p.discount}
                  </span>

                  <button className="absolute top-4 right-4 z-10 text-gray-400 hover:text-red-500 text-xs">
                    🖤
                  </button>

                  <Link href={`/product/${p.handle}`} className="block relative aspect-square bg-gray-50 rounded-xl overflow-hidden p-2">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </Link>

                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-gray-900 line-clamp-2 leading-snug">
                      <Link href={`/product/${p.handle}`}>{p.title}</Link>
                    </h4>
                    <p className="text-[10px] text-amber-500 font-bold">★ {p.rating}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-gray-900">₹{p.price.toLocaleString("en-IN")}</span>
                      <span className="text-[10px] text-gray-400 line-through">₹{p.compare_at_price.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-100">
                    <BuyNowButton
                      mode="cart"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-[10px] py-2 rounded-xl text-center cursor-pointer"
                    >
                      🛒 Add to Cart
                    </BuyNowButton>

                    <BuyNowButton
                      productHandle={p.handle}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-2 rounded-xl text-center cursor-pointer shadow-2xs"
                    >
                      ⚡ Buy Now
                    </BuyNowButton>
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
      <Footer />
    </div>
  );
}
