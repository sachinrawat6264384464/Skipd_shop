"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "components/layout/footer";
import { fetchActiveSales } from "lib/api";
import { BuyNowButton } from "components/auth/buy-now-button";

export default function DealsPage() {
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [featuredOffers, setFeaturedOffers] = useState<any[]>([]);

  useEffect(() => {
    // Load admin-set featured offer products from localStorage
    try {
      const stored = localStorage.getItem("skipd_featured_offers");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFeaturedOffers(parsed);
        }
      }
    } catch {}

    async function loadSale() {
      const sales = await fetchActiveSales();
      if (sales && sales.length > 0) {
        setSale(sales[0]);
      }
      setLoading(false);
    }
    loadSale();
  }, []);

  const sampleDealProducts = [
    { id: 1, title: "Saree Premium Silk", handle: "saree-premium-silk", price: 299, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500", easyShip: true, weight: "<500gm", earlier: 90, now: 30, save: 300 },
    { id: 2, title: "Cold Pressed Oil 1L", handle: "cold-pressed-oil-1l", price: 249, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500", easyShip: true, weight: "1kg-2kg", earlier: 75, now: 25, save: 250 },
    { id: 3, title: "Velvet Cushion Cover", handle: "velvet-cushion-cover", price: 800, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500", easyShip: false, weight: "<500gm", earlier: 225, now: 80, save: 700 },
    { id: 4, title: "20000mAh Power Bank", handle: "20000mah-power-bank", price: 999, image: "https://images.unsplash.com/photo-1609592424089-a2e4b3c4342d?w=500", easyShip: true, weight: "500gm-1kg", earlier: 300, now: 100, save: 1000 },
    { id: 5, title: "Nike Running Shoe", handle: "nike-running-shoe", price: 700, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", easyShip: true, weight: "500gm-1kg", earlier: 228, now: 120, save: 108 },
    { id: 6, title: "Leather Jacket", handle: "leather-jacket", price: 999, image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=500", easyShip: false, weight: "1kg-2kg", earlier: 313, now: 134, save: 179 },
    { id: 7, title: "FPV Toy Drone", handle: "fpv-toy-drone", price: 999, image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=500", easyShip: true, weight: "500gm-1kg", earlier: 417, now: 118, save: 299 },
    { id: 8, title: "Pro Headphones", handle: "pro-headphones", price: 950, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", easyShip: false, weight: "500gm-1kg", earlier: 263, now: 98, save: 165 },
  ];

  // Priority: admin-set featured offers > sale products > sample fallback
  let productsToDisplay: any[] = [];
  if (featuredOffers.length > 0) {
    productsToDisplay = featuredOffers;
  } else if (sale?.products?.length > 0) {
    productsToDisplay = sale.products.map((p: any, i: number) => {
      const fallback = sampleDealProducts[i % sampleDealProducts.length];
      return {
        id: p.id || i + 1,
        title: p.title,
        handle: p.handle || fallback.handle,
        price: p.sale_price || 299,
        image: p.image || fallback.image,
        easyShip: p.shipping_type === "Easy Ship",
        weight: p.weight_range || "<500gm",
        earlier: Math.round(p.original_price * 0.15) || fallback.earlier,
        now: Math.round(p.sale_price * 0.1) || fallback.now,
        save: Math.round(p.savings) || fallback.save
      };
    });
  } else {
    productsToDisplay = sampleDealProducts;
  }

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
              <p className="text-xs text-gray-600 leading-relaxed">Get your products in front of customers across 100% of India's serviceable pin codes with Shiprocket logistics.</p>
            </div>
            <div className="bg-amber-50/60 border border-orange-200 rounded-3xl p-6 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-orange-500/20">🧮</div>
              <h3 className="font-black text-base text-gray-900">Know Your Profit Upfront</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Fee explainer &amp; revenue calculator gives complete visibility into your fees, discounts, and net margins.</p>
            </div>
            <div className="bg-amber-50/60 border border-orange-200 rounded-3xl p-6 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-orange-500/20">⚙️</div>
              <h3 className="font-black text-base text-gray-900">AI Tools That Grow Your Business</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Create listings, generate A+ content, and get growth insights with SKIPD Assistant AI listing creator.</p>
            </div>
          </div>
        </div>

        {/* 🖤 Zero Referral Fees */}
        <div className="bg-[#0f172a] text-white py-12 px-6 shadow-lg">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">With Zero Referral Fees, Every Sale Event Order Delivers More</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 text-xs">
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-orange-500/30">Zero</div>
                <h4 className="font-extrabold text-orange-400 text-sm">Zero Referral Fee</h4>
                <p className="text-gray-400 text-[11px]">(Under ₹1000 Products)</p>
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-amber-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/30">📦</div>
                <h4 className="font-extrabold text-amber-400 text-sm">Save ₹15 per order</h4>
                <p className="text-gray-400 text-[11px]">(Easy Ship under ₹300 Products)</p>
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">📉</div>
                <h4 className="font-extrabold text-emerald-400 text-sm">4%–9.5% Lower Fees</h4>
                <p className="text-gray-400 text-[11px]">(Products above ₹1,000)</p>
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-blue-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-500/30">🚚</div>
                <h4 className="font-extrabold text-blue-400 text-sm">Lower Closing Fees</h4>
                <p className="text-gray-400 text-[11px]">(₹20–₹26 per order Self Ship)</p>
              </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {productsToDisplay.map((item: any) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition duration-300 flex flex-col group"
              >
                {/* Clickable area — image + info → product page */}
                <Link href={`/product/${item.handle || item.id}`} className="block p-4 space-y-3 flex-1 cursor-pointer">
                  {/* Product Image */}
                  <div className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 p-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-orange-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                      ₹{item.price}
                    </div>
                  </div>

                  {/* Info & Badges */}
                  <div className="space-y-2">
                    <h3 className="font-black text-base text-gray-900 group-hover:text-orange-600 transition truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="bg-orange-100 text-orange-800 border border-orange-200 font-bold px-2 py-0.5 rounded-md">
                        {item.easyShip ? "🚚 Easy Ship" : "🏬 FC"}
                      </span>
                      <span className="bg-gray-100 text-gray-700 border border-gray-200 font-semibold px-2 py-0.5 rounded-md">
                        {item.weight}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="bg-gray-800 text-white font-bold px-2 py-0.5 rounded">Earlier ₹{item.earlier}</span>
                      <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">Now ₹{item.now}</span>
                    </div>
                  </div>
                </Link>

                {/* Save Button — kept separate from navigation Link */}
                <div className="px-4 pb-4">
                  <BuyNowButton
                    productTitle={item.title}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 rounded-2xl text-center transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>🪙</span> Save ₹{item.save} / unit
                  </BuyNowButton>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
