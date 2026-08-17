"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "components/layout/footer";
import { BuyNowButton } from "components/auth/buy-now-button";
import { useAuth } from "components/auth/auth-provider";
import { getUserCartKey } from "lib/utils";
import { useWishlist } from "components/wishlist/wishlist-context";

export default function GiftCardsPage() {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const { isInWishlist, toggleWishlist: ctxToggleWishlist } = useWishlist();
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("bestselling");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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

  // 1. Filter by Category & Price
  let processedProducts = giftProducts.filter((p) => {
    const matchesCat = selectedCategory === "All Categories" || p.category === selectedCategory;
    const matchesPrice = p.price <= maxPrice;
    return matchesCat && matchesPrice;
  });

  // 2. Sort Products
  if (sortBy === "price-low") {
    processedProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    processedProducts.sort((a, b) => b.price - a.price);
  }

  const toggleWishlistProduct = (p: any) => {
    const wasLiked = isInWishlist(p.id);
    ctxToggleWishlist({
      id: p.id,
      handle: p.handle,
      title: p.title,
      price: p.price,
      compare_at_price: p.compare_at_price,
      image: p.image,
      category: p.category,
      rating: 4.5
    });
    if (wasLiked) {
      showToast(`🖤 Removed "${p.title}" from Wishlist`);
    } else {
      showToast(`❤️ Added "${p.title}" to Wishlist!`);
    }
  };

  const handleBuyBrandVoucher = (brandName: string, amount: number) => {
    requireAuth(() => {
      const voucherItem = {
        id: Date.now(),
        handle: `skipd-voucher-${brandName.toLowerCase().replace(/\s+/g, "-")}`,
        title: `SKIPD ${brandName} Digital Store Voucher (₹${amount.toLocaleString("en-IN")})`,
        price: amount,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400",
        isGiftCard: true,
        giftAmount: amount
      };

      sessionStorage.setItem("skipd_buy_now_item", JSON.stringify([voucherItem]));

      showToast(`🎉 ${brandName} Voucher ₹${amount} selected! Redirecting to Checkout...`);
      setTimeout(() => {
        router.push("/checkout?buyNow=true");
      }, 600);
    });
  };

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between" suppressHydrationWarning>
      
      {/* In-Page Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-gray-900 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 animate-bounce">
          {toastMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 w-full">
        
        {/* 🎁 STUNNING HERO SECTION BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950 to-teal-900 text-white p-8 md:p-12 shadow-2xl border border-emerald-500/20">
          
          {/* Ambient Background Glow Orbs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] md:text-xs font-black uppercase px-3.5 py-1.5 rounded-full tracking-wider shadow-inner">
                <span>🎁</span>
                <span>INSTANT DIGITAL GIFT CARDS &amp; STORE CREDIT</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Give the Gift of <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">Endless Choice</span> &amp; Joy
              </h1>

              <p className="text-xs md:text-sm text-gray-300 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Send instant e-gift cards via Email or SMS. Let your loved ones choose from over 10,000+ top brands, sarees, electronics &amp; artisan items with instant redemption &amp; zero expiry fees.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedCategory("Electronics");
                    showToast("🎁 Selected E-Gift Voucher options below!");
                  }}
                  className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs md:text-sm px-6 py-3.5 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 cursor-pointer flex items-center gap-2"
                >
                  <span>✨</span>
                  <span>Send a Gift Voucher Now</span>
                </button>

                <button
                  onClick={() => router.push("/account?tab=gift-cards")}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black text-xs md:text-sm px-6 py-3.5 rounded-2xl transition-all duration-200 backdrop-blur-md cursor-pointer flex items-center gap-2"
                >
                  <span>💳</span>
                  <span>Redeem / Check Balance</span>
                </button>
              </div>

              {/* Trust Badge Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[11px] font-bold text-gray-300 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span>⚡</span>
                  <span className="text-gray-200">100% Instant Delivery</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span>🛡️</span>
                  <span className="text-gray-200">Zero Expiry Fees</span>
                </div>
                <div className="flex items-center gap-1.5 text-teal-400">
                  <span>🌟</span>
                  <span className="text-gray-200">50,000+ Happy Gifters</span>
                </div>
              </div>
            </div>

            {/* Right Card Graphic Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm aspect-[1.58/1] bg-gradient-to-tr from-slate-900 via-emerald-950 to-teal-900 rounded-3xl p-6 border border-emerald-400/30 shadow-2xl flex flex-col justify-between overflow-hidden group hover:scale-105 transition-all duration-500 cursor-pointer">
                
                {/* Metallic Shine Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -rotate-45 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>

                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">SKIPD VIP GIFT VAULT</span>
                    <h3 className="text-lg font-black text-white tracking-wider font-mono">₹5,000 STORE VOUCHER</h3>
                  </div>
                  <div className="w-10 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center font-bold text-amber-300 text-xs shadow-inner">
                    VIP
                  </div>
                </div>

                {/* EMV Chip Graphic */}
                <div className="w-11 h-8 rounded-md bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 border border-amber-500/50 shadow-md relative z-10 my-2"></div>

                <div className="flex justify-between items-end relative z-10 font-mono">
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">GIFT CODE</p>
                    <p className="text-xs font-black text-emerald-300 tracking-wider">SKIPD-GIFT-8942-2026</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">VALID FOR</p>
                    <p className="text-xs font-black text-white">ALL PRODUCTS</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* 🃏 4 Gift Card Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* E-Gift Card */}
          <div
            onClick={() => {
              setSelectedCategory("Electronics");
              showToast("📱 Showing Electronics E-Gift Cards!");
            }}
            className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition">
                📱
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">E-Gift Card</h3>
                <p className="text-[10px] text-gray-500">Instant delivery on email or SMS</p>
              </div>
            </div>
            <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              &rarr;
            </span>
          </div>

          {/* Physical Gift Card */}
          <div
            onClick={() => {
              setSelectedCategory("Fashion & Apparel");
              showToast("💳 Showing Fashion Physical Gift Cards!");
            }}
            className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition">
                💳
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">Physical Gift Card</h3>
                <p className="text-[10px] text-gray-500">Beautifully packed &amp; delivered</p>
              </div>
            </div>
            <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              &rarr;
            </span>
          </div>

          {/* Brand Gift Card */}
          <div
            onClick={() => {
              setSelectedCategory("Lifestyle");
              showToast("🛍️ Showing Lifestyle Brand Gift Cards!");
            }}
            className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition">
                🛍️
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">Brand Gift Card</h3>
                <p className="text-[10px] text-gray-500">Top brands, endless choices</p>
              </div>
            </div>
            <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
              &rarr;
            </span>
          </div>

          {/* Corporate / Bulk */}
          <div
            onClick={() => {
              setSelectedCategory("All Categories");
              showToast("💼 Showing All Corporate Bulk Gifting Options!");
            }}
            className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition">
                💼
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">Corporate / Bulk</h3>
                <p className="text-[10px] text-gray-500">Bulk gifting for employees</p>
              </div>
            </div>
            <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              &rarr;
            </span>
          </div>

        </div>

        {/* 💊 4 Value Prop Pill Icons Bar */}
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

        {/* 🎁 Offer Banners Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Banner 1: Contest Points */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3 flex flex-col justify-between shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase">Send a Gift Card &amp; Get</p>
              <h3 className="text-base font-black text-gray-900">₹3,000 Gift Points 🎁</h3>
            </div>
            <button
              onClick={() => router.push("/account?tab=gift-cards")}
              className="bg-emerald-600 text-white font-bold text-[11px] px-4 py-1.5 rounded-xl hover:bg-emerald-700 transition w-fit cursor-pointer shadow-xs"
            >
              Explore Now &rsaquo;
            </button>
          </div>

          {/* Banner 2: Up to 50% Off */}
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 space-y-3 flex flex-col justify-between shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-teal-700 uppercase">Up to</p>
              <h3 className="text-lg font-black text-gray-900">50% OFF</h3>
              <p className="text-[10px] text-gray-600 font-semibold">on Brand Gift Cards</p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory("Fashion & Apparel");
                showToast("🛍️ Filtered 50% OFF Brand Gift Cards!");
              }}
              className="bg-white border border-teal-300 text-teal-800 font-bold text-[11px] px-4 py-1.5 rounded-xl hover:bg-teal-100 transition w-fit cursor-pointer shadow-xs"
            >
              View Brands &rsaquo;
            </button>
          </div>

          {/* Banner 3: Central 12% Off */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex justify-between items-center shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Flat</p>
              <h3 className="text-base font-black text-gray-900">12% OFF</h3>
              <p className="text-[10px] text-gray-500 font-medium">Central Brand New</p>
              <button
                onClick={() => handleBuyBrandVoucher("Central Brand", 1000)}
                className="mt-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-[10px] px-3.5 py-1 rounded-xl transition cursor-pointer shadow-xs"
              >
                Buy Now &rsaquo;
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
              <button
                onClick={() => handleBuyBrandVoucher("Big Bazaar", 2000)}
                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-3.5 py-1 rounded-xl transition cursor-pointer shadow-xs"
              >
                Buy Now &rsaquo;
              </button>
            </div>
            <div className="w-14 h-14 bg-white rounded-xl border border-purple-200 flex flex-col items-center justify-center p-1 shadow-2xs">
              <span className="text-[9px] font-black text-orange-600">BIG BAZAAR</span>
            </div>
          </div>

        </div>

        {/* 🛍️ Bestsellers Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-xl font-black text-gray-900">Bestsellers ({processedProducts.length})</h2>
              <p className="text-xs text-gray-500">Most loved gifts, chosen by thousands.</p>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 font-bold text-gray-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value="bestselling">Best Selling</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 3-Col Sidebar: Category & Price Filter */}
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
                <h4 className="text-xs font-bold text-gray-900">Price Range (Under ₹{maxPrice.toLocaleString("en-IN")})</h4>
                <input
                  type="range"
                  min="2000"
                  max="50000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-bold text-gray-500">
                  <span>₹2,000</span>
                  <span>₹50,000+</span>
                </div>
              </div>
            </div>

            {/* Right 9-Col Product Grid */}
            <div className="lg:col-span-9">
              {processedProducts.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-xs text-gray-500 font-bold space-y-2">
                  <p className="text-3xl">🛍️</p>
                  <p>No products found under ₹{maxPrice.toLocaleString("en-IN")} in "{selectedCategory}".</p>
                  <button
                    onClick={() => {
                      setSelectedCategory("All Categories");
                      setMaxPrice(50000);
                    }}
                    className="mt-2 text-emerald-700 hover:underline"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {processedProducts.map((p) => {
                    const isWishlisted = isInWishlist(p.id);

                    return (
                      <div
                        key={p.id}
                        className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden p-3 shadow-2xs space-y-2 flex flex-col justify-between hover:shadow-md transition relative group"
                      >
                        <span className="absolute top-4 left-4 z-10 bg-red-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase">
                          {p.discount}
                        </span>

                        <button
                          onClick={() => toggleWishlistProduct(p)}
                          className="absolute top-4 right-4 z-10 text-xs transition transform hover:scale-125 cursor-pointer"
                        >
                          {isWishlisted ? "❤️" : "🖤"}
                        </button>

                        <Link href={`/product/${p.handle}`} className="block relative aspect-square bg-gray-50 rounded-xl overflow-hidden p-2">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        </Link>

                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-gray-900 line-clamp-2 leading-snug">
                            <Link href={`/product/${p.handle}`} className="hover:text-emerald-700 transition">{p.title}</Link>
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
                            productObj={{
                              id: p.id,
                              handle: p.handle,
                              title: p.title,
                              price: p.price,
                              originalPrice: p.compare_at_price,
                              savings: p.compare_at_price - p.price,
                              image: p.image,
                              rating: p.rating,
                              seller: "SKIPD Official",
                              delivery: "Delivery in 2 days | Free Delivery",
                              selected: true
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-[10px] py-2 rounded-xl text-center cursor-pointer transition"
                          >
                            🛒 Add to Cart
                          </BuyNowButton>

                          <BuyNowButton
                            mode="buy"
                            productHandle={p.handle}
                            productObj={{
                              id: p.id,
                              handle: p.handle,
                              title: p.title,
                              price: p.price,
                              originalPrice: p.compare_at_price,
                              savings: p.compare_at_price - p.price,
                              image: p.image,
                              rating: p.rating,
                              seller: "SKIPD Official",
                              delivery: "Delivery in 2 days | Free Delivery",
                              selected: true
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-2 rounded-xl text-center cursor-pointer shadow-2xs transition"
                          >
                            ⚡ Buy Now
                          </BuyNowButton>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
      <Footer />
    </div>
  );
}
