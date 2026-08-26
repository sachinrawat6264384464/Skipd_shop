"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface FlashSaleItem {
  id: number;
  title: string;
  handle: string;
  price: number;
  compare_at_price: number;
  discount_percent: number;
  image: string;
  sold_percent: number;
}

export function FlashSaleBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });

  const [flashItems, setFlashItems] = useState<FlashSaleItem[]>([
    {
      id: 101,
      title: "boAt Rockerz 450 Pro Bluetooth Headphones",
      handle: "boat-rockerz-450-pro",
      price: 1499,
      compare_at_price: 3990,
      discount_percent: 62,
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400",
      sold_percent: 84
    },
    {
      id: 104,
      title: "Nike Air Force 1 07 Triple White Sneakers",
      handle: "nike-air-force-1",
      price: 7495,
      compare_at_price: 8995,
      discount_percent: 17,
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",
      sold_percent: 71
    },
    {
      id: 106,
      title: "Noise ColorFit Pro 5 Smartwatch Jet Black",
      handle: "noise-colorfit-pro-5",
      price: 3499,
      compare_at_price: 5999,
      discount_percent: 41,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      sold_percent: 92
    },
    {
      id: 108,
      title: "Minimalist Heavyweight Graphic Tee 240 GSM",
      handle: "minimalist-graphic-tee",
      price: 1299,
      compare_at_price: 1999,
      discount_percent: 35,
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400",
      sold_percent: 65
    }
  ]);

  useEffect(() => {
    // Fetch live sales/products from PostgreSQL Database
    async function loadDbDeals() {
      try {
        const { getApiBaseUrl } = await import("lib/api");
        const apiBase = getApiBaseUrl().replace(/\/+$/, "");
        
        // 1. Try fetching active sales events with 2.5s timeout
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2500);

        const salesRes = await fetch(`${apiBase}/sales`, { signal: controller.signal });
        clearTimeout(timer);

        if (salesRes.ok) {
          const salesData = await salesRes.json();
          if (Array.isArray(salesData) && salesData.length > 0 && salesData[0].products?.length > 0) {
            const dbDealItems: FlashSaleItem[] = salesData[0].products.slice(0, 4).map((sp: any, idx: number) => ({
              id: sp.product_id || idx + 1,
              title: sp.title,
              handle: sp.handle || `product-${sp.product_id}`,
              price: sp.sale_price || 999,
              compare_at_price: sp.original_price || sp.sale_price * 1.4,
              discount_percent: Math.round(((sp.original_price - sp.sale_price) / (sp.original_price || 1)) * 100) || 30,
              image: sp.image,
              sold_percent: 75 + (idx * 5)
            }));
            setFlashItems(dbDealItems);
            return;
          }
        }
      } catch (e) {
        console.warn("Using fallback flash sale deals:", e);
      }
    }

    loadDbDeals();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 45, seconds: 12 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDigit = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 border border-red-900/40 rounded-3xl p-6 shadow-2xl text-white my-8 overflow-hidden relative font-sans">
      
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/40 px-3 py-1 rounded-full text-red-400 font-black text-xs uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>⚡ Live Flash Deal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Lightning Deals — Up to 70% OFF
          </h2>
          <p className="text-xs text-slate-400 font-medium">Limited stock available at promotional price points.</p>
        </div>

        {/* Countdown Ticking Timer */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-2xl">
          <span className="text-xs text-slate-400 font-extrabold uppercase mr-1">Ends In:</span>
          <div className="flex items-center gap-1.5 font-mono text-sm font-black text-amber-400">
            <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-500/30">
              {formatDigit(timeLeft.hours)}
            </span>
            <span>:</span>
            <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-500/30">
              {formatDigit(timeLeft.minutes)}
            </span>
            <span>:</span>
            <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-500/30 text-red-400">
              {formatDigit(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Deal Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-6">
        {flashItems.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-red-500/50 rounded-2xl p-4 transition duration-200 flex flex-col justify-between space-y-3 group"
          >
            <div>
              {/* Product Image + Discount Pill */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2 left-2 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-md uppercase">
                  -{item.discount_percent}% OFF
                </span>
              </div>

              <h3 className="font-extrabold text-white text-xs truncate group-hover:text-amber-400 transition">
                {item.title}
              </h3>

              {/* Price Row */}
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-base font-black text-amber-400">
                  ₹{item.price.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-slate-500 line-through font-bold">
                  ₹{item.compare_at_price.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Stock Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>Stock Claimed</span>
                <span className="text-amber-400">{item.sold_percent}% Sold</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${item.sold_percent}%` }}
                />
              </div>

              <Link
                href={`/product/${item.handle}`}
                className="block w-full py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs text-center uppercase tracking-wider rounded-xl transition shadow-md"
              >
                Claim Deal &rsaquo;
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
