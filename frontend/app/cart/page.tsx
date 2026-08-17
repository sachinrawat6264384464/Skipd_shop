"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "components/layout/footer";
import { BuyNowButton } from "components/auth/buy-now-button";
import { fetchProducts } from "lib/api";

const INITIAL_CART_ITEMS = [
  {
    id: 1,
    title: "OnePlus Nord 4 5G (Obsidian Midnight, 12GB RAM, 256GB Storage)",
    rating: "4.5",
    reviews: "2,356",
    seller: "SKIPD Official",
    specs: ["Snapdragon 7+ Gen 3", "50MP Sony Camera", "5500mAh Battery"],
    delivery: "Delivery by 28 May, 2026 | Free Delivery",
    originalPrice: 32999,
    price: 29999,
    savings: 3000,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
    selected: true
  },
  {
    id: 2,
    title: "boAt Rockerz 450 Pro Bluetooth Wireless Headphones",
    rating: "4.4",
    reviews: "1,892",
    seller: "SV Store",
    specs: ["Upto 70H Playtime", "Fast Charge", "Bluetooth 5.3"],
    delivery: "Delivery by 26 May, 2026 | Free Delivery",
    originalPrice: 2999,
    price: 1799,
    savings: 1200,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    selected: true
  }
];

import { getUserCartKey, getCartStore, saveCartStore, isUserLoggedIn } from "lib/utils";

export default function CartItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  const loadUserCart = () => {
    const loggedIn = isUserLoggedIn();
    setIsLoggedIn(loggedIn);

    const storedItems = getCartStore();
    setItems(storedItems);
  };

  useEffect(() => {
    loadUserCart();

    window.addEventListener("skipd_auth_changed", loadUserCart);
    window.addEventListener("skipd_cart_updated", loadUserCart);
    window.addEventListener("skipd_cart_changed", loadUserCart);
    return () => {
      window.removeEventListener("skipd_auth_changed", loadUserCart);
      window.removeEventListener("skipd_cart_updated", loadUserCart);
      window.removeEventListener("skipd_cart_changed", loadUserCart);
    };
  }, []);

  useEffect(() => {
    async function loadRealRecs() {
      try {
        const catalog = await fetchProducts();
        if (Array.isArray(catalog) && catalog.length > 0) {
          const cartIds = new Set(items.map(i => String(i.id)));
          const filtered = catalog.filter(p => !cartIds.has(String(p.id)));
          setRecommendedProducts(filtered.slice(0, 4));
        }
      } catch (e) {}
    }
    loadRealRecs();
  }, [items]);

  const saveCartState = (newItems: any[]) => {
    setItems(newItems);
    saveCartStore(newItems);
  };

  const updateQty = (id: number | string, delta: number) => {
    const updated = items.map(item => item.id === id ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) } : item);
    saveCartState(updated);
  };

  const removeItem = (id: number | string) => {
    const updated = items.filter(item => item.id !== id);
    saveCartState(updated);
  };

  const clearAll = () => {
    saveCartState([]);
  };

  const normalizedItems = items.map(item => ({
    ...item,
    handle: item.handle || (item.title ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : String(item.id)),
    selected: item.selected !== false,
    quantity: Number(item.quantity || 1),
    price: Number(item.price || 999),
    originalPrice: Number(item.originalPrice || item.compare_at_price || (item.price ? item.price * 1.3 : 1299)),
    savings: Math.max(0, Number(item.savings || ((item.originalPrice || item.compare_at_price || (item.price ? item.price * 1.3 : 1299)) - Number(item.price || 999)))),
    rating: item.rating || "4.5",
    reviews: item.reviews || "1,240",
    seller: item.seller || "SKIPD Official",
    delivery: item.delivery || "Delivery in 2 days | Free Delivery",
    image: item.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
  }));

  const selectedItems = normalizedItems.filter(i => i.selected);
  const subtotal = selectedItems.reduce((acc, item) => acc + (item.originalPrice * item.quantity), 0);
  const totalDiscount = selectedItems.reduce((acc, item) => acc + (item.savings * item.quantity), 0);
  const finalTotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 w-full">
        
        {/* 🚀 CART UPPER HERO BANNER & SHOWCASE SECTION */}
        <div className="space-y-4">
          {/* Breadcrumb Navigation */}
          <div className="text-xs text-gray-500 font-semibold flex items-center gap-2">
            <Link href="/" className="hover:underline text-gray-600">Home</Link>
            <span>&rsaquo;</span>
            <Link href="/search" className="hover:underline text-gray-600">Store Catalog</Link>
            <span>&rsaquo;</span>
            <span className="text-gray-900 font-bold">Shopping Cart &amp; Order Summary</span>
          </div>

          {/* Premium Hero Banner */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#047857] text-white p-6 sm:p-8 border border-gray-800">
            {/* Background Decorative Blur Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              
              {/* Left Column: Title & Cart Status Badges */}
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-emerald-500/90 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-300/40 shadow-sm">
                    🛒 SHOPPING CART SHOWCASE
                  </span>
                  {selectedItems.length > 0 && (
                    <span className="bg-amber-500/90 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-amber-300/40 shadow-sm">
                      ⚡ {selectedItems.length} ITEMS SELECTED
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  Your Cart &amp; Saved Order Summary
                </h1>

                <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed">
                  Review your items, apply promotional discount coupons, and enjoy express doorstep delivery with 100% buyer protection.
                </p>

                {/* Free Shipping Progress Indicator */}
                {selectedItems.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 max-w-md space-y-1.5 shadow-sm">
                    <div className="flex justify-between items-center text-xs font-extrabold">
                      <span className="text-emerald-300 flex items-center gap-1">
                        <span>🚚</span> Free Express Delivery Status
                      </span>
                      <span className="text-white">UNLOCKED 🎉</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full w-full rounded-full transition-all duration-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Visual Mini Carousel of Cart Item Thumbnails */}
              {normalizedItems.length > 0 && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 sm:p-5 w-full lg:w-auto shrink-0 space-y-3 shadow-lg">
                  <div className="flex justify-between items-center text-xs border-b border-white/15 pb-2">
                    <span className="font-extrabold text-gray-200 uppercase tracking-wider text-[11px]">
                      Items in Cart ({normalizedItems.length})
                    </span>
                    {isLoggedIn && (
                      <button
                        onClick={clearAll}
                        className="text-[11px] font-bold text-red-300 hover:text-red-100 underline transition cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Horizontal Scroll Mini Gallery of Cart Product Images */}
                  <div className="flex items-center gap-2.5 overflow-x-auto max-w-xs sm:max-w-sm pb-1 no-scrollbar">
                    {normalizedItems.map((cartImgItem, idx) => (
                      <div
                        key={idx}
                        className="relative w-14 h-14 bg-white/90 rounded-2xl p-1 shrink-0 shadow-md border border-white/40 group/thumb cursor-pointer transition hover:scale-105"
                        title={cartImgItem.title}
                      >
                        <img
                          src={cartImgItem.image}
                          alt={cartImgItem.title}
                          className="w-full h-full object-contain rounded-xl"
                        />
                        <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-sm">
                          {cartImgItem.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Quick Totals Ribbon */}
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-white/15">
                    <span className="text-gray-300 font-medium">Subtotal Payable:</span>
                    <span className="text-base font-black text-emerald-300">₹{finalTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Perks Banner Row */}
            <div className="mt-6 pt-4 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-300 font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span>Express 2-Day Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🛡️</span>
                <span>100% Authentic &amp; Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🏷️</span>
                <span>Best Price Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🔄</span>
                <span>7-Day Easy Returns</span>
              </div>
            </div>

          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4">
            <div className="text-5xl">🛒</div>
            <h3 className="text-xl font-black text-gray-900">Your cart is currently empty</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Explore our best-selling electronics, fashion, and accessories to add items to your cart!
            </p>
            <Link
              href="/search"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-xs"
            >
              Explore Store &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {normalizedItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4 relative">
                  
                  <div className="flex gap-4 items-start">
                    
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, selected: e.target.checked } : i))}
                      className="mt-2 w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                    />

                    {/* Product Image - Clickable Link */}
                    <Link href={`/product/${item.handle || item.id}`} className="relative w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shrink-0 hover:border-emerald-400 transition group cursor-pointer">
                      <Image src={item.image} alt={item.title} fill className="object-contain p-2 group-hover:scale-105 transition duration-200" />
                    </Link>

                    {/* Product Info - Clickable Title */}
                    <div className="flex-1 space-y-2 text-xs">
                      <div>
                        <h3 className="font-bold text-sm text-gray-900 leading-snug hover:text-emerald-700 transition">
                          <Link href={`/product/${item.handle || item.id}`}>{item.title}</Link>
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          <span className="text-amber-500 font-bold">★ {item.rating}</span> ({item.reviews} reviews) | Sold by <span className="font-bold text-gray-800">{item.seller}</span>
                        </p>
                      </div>

                      {/* Specs Badges */}
                      {item.specs && item.specs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.specs.map((spec: string, sIdx: number) => (
                            <span key={sIdx} className="bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-lg">
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Delivery */}
                      <p className="text-[11px] text-emerald-700 font-medium pt-1">
                        🚚 {item.delivery}
                      </p>
                    </div>

                    {/* Right Price Column */}
                    <div className="text-right shrink-0 text-xs">
                      <span className="text-gray-400 line-through block text-[11px]">₹{item.originalPrice.toLocaleString("en-IN")}.00</span>
                      <span className="text-lg font-black text-gray-900 block">₹{item.price.toLocaleString("en-IN")}.00</span>
                      <span className="text-[11px] text-emerald-600 font-bold block">You save ₹{item.savings.toLocaleString("en-IN")}.00</span>
                    </div>

                  </div>

                  {/* Footer Action Bar: Quantity & Actions */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 font-black text-gray-700 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 font-black text-gray-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Save For Later & Remove Links */}
                    <div className="flex items-center gap-4 font-bold text-[11px]">
                      <button className="text-gray-600 hover:text-black cursor-pointer">
                        Save for later
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4 sticky top-24">
                <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">Order Summary</h2>

                <div className="space-y-3 text-xs text-gray-600">
                  <div className="flex justify-between font-medium">
                    <span>Subtotal ({selectedItems.length} items)</span>
                    <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString("en-IN")}.00</span>
                  </div>

                  <div className="flex justify-between font-medium">
                    <span>Discount</span>
                    <span className="text-emerald-600 font-bold">-₹{totalDiscount.toLocaleString("en-IN")}.00</span>
                  </div>

                  <div className="flex justify-between font-medium">
                    <span>Delivery Charges</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-900">Total (Incl. of all taxes)</span>
                    <span className="text-2xl font-black text-gray-900">₹{finalTotal.toLocaleString("en-IN")}.00</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-[11px] font-bold flex items-center gap-2">
                      <span>🏷️</span>
                      <span>You will save ₹{totalDiscount.toLocaleString("en-IN")}.00 on this order</span>
                    </div>
                  )}
                </div>

                <BuyNowButton
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-4 rounded-2xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  Proceed to Checkout &rarr;
                </BuyNowButton>

                <p className="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1.5 pt-1 font-medium">
                  <span>🛡️</span> 100% Safe &amp; Secure Payments
                </p>
              </div>
            </div>

          </div>
        )}

        {/* 🛍️ Recommended Products Section (You Might Also Like) */}
        <div className="pt-8 border-t border-gray-200 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
                <span>You Might Also Like</span>
                <span className="text-emerald-600">🛍️</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1">Handpicked recommendations based on your cart items</p>
            </div>
            <Link href="/search" className="text-xs text-emerald-700 font-extrabold hover:underline">
              View All Products &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(recommendedProducts.length > 0 ? recommendedProducts : [
              {
                id: 1,
                title: "OnePlus Nord 6 5G (12GB+256GB)",
                price: 44499,
                compare_at_price: 52999,
                rating: "4.8",
                reviews: "1,732",
                image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
                handle: "oneplus-nord-6",
                tag: "Bestseller"
              },
              {
                id: 2,
                title: "Active ANC Wireless Headphones",
                price: 4999,
                compare_at_price: 7999,
                rating: "4.9",
                reviews: "2,100",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                handle: "active-anc-headphones",
                tag: "Hot Deal"
              },
              {
                id: 3,
                title: "Apple Watch Series 9 GPS 45mm Midnight",
                price: 41900,
                compare_at_price: 44900,
                rating: "4.9",
                reviews: "890",
                image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500",
                handle: "apple-watch-series-9",
                tag: "Trending"
              },
              {
                id: 5,
                title: "Apple MacBook Air M2 13.6-inch",
                price: 99990,
                compare_at_price: 114900,
                rating: "4.9",
                reviews: "1,450",
                image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
                handle: "apple-macbook-air-m2",
                tag: "Premium"
              }
            ]).map((rec) => {
              const recHandle = rec.handle || (rec.title ? rec.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : String(rec.id));
              const recImg = (rec.images && rec.images.length > 0) ? rec.images[0] : (rec.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500");
              const recPrice = Number(rec.price || 999);
              const recCompare = Number(rec.compare_at_price || rec.originalPrice || Math.round(recPrice * 1.25));

              return (
                <div key={rec.id} className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition group">
                  
                  {/* 🔗 Clickable Image & Product Info */}
                  <Link href={`/product/${recHandle}`} className="space-y-3 block">
                    <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2">
                      <img
                        src={recImg}
                        alt={rec.title}
                        className="h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-md shadow-xs">
                        {rec.tag || "Top Rated"}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-xs text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition">
                        {rec.title}
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        <span className="text-amber-500 font-bold">★ {rec.rating || "4.8"}</span> ({rec.reviews || "1,240"})
                      </p>
                    </div>
                  </Link>

                  {/* 💰 Price & Action Buttons (+ Add & Buy Now) */}
                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-black text-sm text-gray-900">₹{recPrice.toLocaleString("en-IN")}</p>
                      {recCompare > recPrice && (
                        <p className="text-[10px] text-gray-400 line-through">₹{recCompare.toLocaleString("en-IN")}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newItem = {
                            id: rec.id,
                            title: rec.title,
                            handle: recHandle,
                            rating: rec.rating || "4.8",
                            reviews: rec.reviews || "1,240",
                            seller: "SKIPD Official",
                            specs: ["Official Warranty", "Verified Quality"],
                            delivery: "Delivery in 2 days | Free Delivery",
                            originalPrice: recCompare,
                            price: recPrice,
                            savings: recCompare - recPrice,
                            quantity: 1,
                            image: recImg,
                            selected: true
                          };
                          saveCartState([...items, newItem]);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-[11px] px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                        title="Add to Cart"
                      >
                        + Add
                      </button>

                      <BuyNowButton
                        productHandle={recHandle}
                        productObj={rec}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-xl transition shadow-xs cursor-pointer"
                      >
                        Buy Now
                      </BuyNowButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
