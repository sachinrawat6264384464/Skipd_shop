"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "components/layout/footer";
import { fetchActiveSales, fetchProducts } from "lib/api";
import { BuyNowButton } from "components/auth/buy-now-button";

export default function DealsPage() {
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [productsToDisplay, setProductsToDisplay] = useState<any[]>([]);

  useEffect(() => {
    async function loadDealsData() {
      setLoading(true);
      
      // 1. Check for admin-set featured offers in localStorage
      let offers: any[] = [];
      try {
        const stored = localStorage.getItem("ecom_featured_offers");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            offers = parsed;
          }
        }
      } catch {}

      // 2. Fetch active sale from backend DB
      const sales = await fetchActiveSales();
      let activeSaleObj = null;
      if (sales && sales.length > 0) {
        activeSaleObj = sales[0];
        setSale(activeSaleObj);
      }

      // 3. Priority: admin-set offers > active sale products > real DB products
      if (offers.length > 0) {
        setProductsToDisplay(offers);
      } else if (activeSaleObj?.products?.length > 0) {
        setProductsToDisplay(activeSaleObj.products);
      } else {
        const dbProducts = await fetchProducts();
        const dealsList = dbProducts.map((p) => ({
          id: p.id,
          title: p.title,
          handle: p.handle,
          price: p.price,
          image: p.images?.[0] || "",
          easyShip: true,
          weight: "<500gm",
          earlier: p.compare_at_price || Math.round(p.price * 1.25),
          now: p.price,
          save: (p.compare_at_price || Math.round(p.price * 1.25)) - p.price,
          stock_quantity: p.stock_quantity
        }));
        setProductsToDisplay(dealsList);
      }

      setLoading(false);
    }

    loadDealsData();
  }, []);

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
      <div className="w-full space-y-8 pb-12">

        {/* 🟠 Hero Sale Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white py-12 px-6 shadow-md relative overflow-hidden text-center md:text-left">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl z-10">
              <div className="inline-flex items-center gap-2 bg-white text-orange-600 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                <span>✦</span> {sale?.title || "Great Freedom Sale"}
                <span className="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full">{sale?.badge_text || "LIVE NOW"}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black leading-tight text-white drop-shadow-sm">
                Reach Every Home,<br />
                Join Every Celebration!
              </h1>
              <p className="text-orange-100 text-sm font-medium">
                {sale?.subtitle || "Get your products in front of millions of customers across 100% of India's serviceable pin codes."}
              </p>
              <div className="pt-2">
                <Link href="/search" className="inline-block bg-gray-900 hover:bg-black text-white font-black text-sm px-8 py-3.5 rounded-2xl transition shadow-lg shadow-black/20">
                  Start Shopping Now &rarr;
                </Link>
              </div>
            </div>
            <div className="relative z-10 w-full md:w-1/3 flex justify-center">
              <div className="w-64 h-64 bg-white/20 rounded-full blur-2xl absolute" />
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600"
                alt="Great Freedom Sale"
                className="relative w-72 h-auto object-contain rounded-2xl shadow-2xl border-4 border-white/20"
              />
            </div>
          </div>
        </div>

        {/* 📦 Feature Cards */}
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-black text-center text-gray-900 mb-6">Get Great Freedom Sale Ready</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-amber-50/60 border border-orange-200 rounded-3xl p-6 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-orange-500/20">📍</div>
              <h3 className="font-black text-base text-gray-900">Reach Every Corner of India</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Get your products in front of customers across 100% of India&apos;s serviceable pin codes with Shiprocket logistics.</p>
            </div>
            <div className="bg-amber-50/60 border border-orange-200 rounded-3xl p-6 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-orange-500/20">🧮</div>
              <h3 className="font-black text-base text-gray-900">Know Your Profit Upfront</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Fee explainer &amp; revenue calculator gives complete visibility into your fees, discounts, and net margins.</p>
            </div>
            <div className="bg-amber-50/60 border border-orange-200 rounded-3xl p-6 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-orange-500/20">⚙️</div>
              <h3 className="font-black text-base text-gray-900">AI Tools That Grow Your Business</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Create listings, generate A+ content, and get growth insights with E-COM Assistant AI listing creator.</p>
            </div>
          </div>
        </div>

        {/* 🛍️ Featured Freedom Sale Deals - Clickable Cards */}
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Featured Freedom Sale Offers</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Exclusive discounts with instant coupon savings &amp; doorstep express delivery</p>
            </div>
            <Link href="/search" className="text-xs font-bold text-orange-600 hover:underline">View All Offers &rarr;</Link>
          </div>

          {productsToDisplay.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-500 shadow-xs">
              <div className="text-5xl mb-4">🏷️</div>
              <p className="text-lg font-bold text-gray-900">No active sale products added yet</p>
              <p className="text-xs mt-1 text-gray-500">Products added to the database will automatically appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {productsToDisplay.map((item: any) => {
                const isOutOfStock = item.stock_quantity === 0;
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition duration-300 flex flex-col group relative"
                  >
                    {/* Clickable area — image + info → product page */}
                    <Link href={`/product/${item.handle || item.id}`} className="block p-4 space-y-3 flex-1 cursor-pointer">
                      {/* Product Image */}
                      <div className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 p-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className={`w-full h-full object-cover rounded-xl transition duration-300 ${
                            isOutOfStock ? "grayscale opacity-60" : "group-hover:scale-105"
                          }`}
                        />
                        <div className="absolute top-2 right-2 bg-orange-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                          ₹{item.price}
                        </div>

                        {/* 🚫 OUT OF STOCK STAMP IN CENTER */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center p-2">
                            <div className="border-4 border-red-600 text-red-600 font-black text-sm px-3 py-1.5 rounded-xl transform -rotate-12 uppercase tracking-widest bg-white/95 shadow-xl text-center">
                              OUT OF STOCK
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info & Badges */}
                      <div className="space-y-2">
                        <h3 className="font-black text-base text-gray-900 group-hover:text-orange-600 transition truncate">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          {isOutOfStock ? (
                            <span className="bg-red-100 text-red-700 border border-red-300 font-black px-2 py-0.5 rounded-md uppercase">
                              🚫 Out of Stock
                            </span>
                          ) : (
                            <>
                              <span className="bg-orange-100 text-orange-800 border border-orange-200 font-bold px-2 py-0.5 rounded-md">
                                {item.easyShip ? "🚚 Easy Ship" : "🏬 FC"}
                              </span>
                              <span className="bg-gray-100 text-gray-700 border border-gray-200 font-semibold px-2 py-0.5 rounded-md">
                                {item.weight}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="bg-gray-800 text-white font-bold px-2 py-0.5 rounded">Earlier ₹{item.earlier}</span>
                          <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">Now ₹{item.now}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Save Button — or Disabled Out of Stock Button */}
                    <div className="px-4 pb-4">
                      {isOutOfStock ? (
                        <button
                          disabled
                          className="w-full bg-red-50 border border-red-300 text-red-600 text-xs font-black py-2.5 rounded-2xl text-center cursor-not-allowed opacity-90 uppercase tracking-wider"
                        >
                          🚫 Out of Stock
                        </button>
                      ) : (
                        <BuyNowButton
                          productObj={{
                            id: item.id,
                            handle: item.handle,
                            title: item.title,
                            price: item.price,
                            image: item.image
                          }}
                          productHandle={item.handle}
                          productTitle={item.title}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 rounded-2xl text-center transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <span>🪙</span> Save ₹{item.save} / unit
                        </BuyNowButton>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}
