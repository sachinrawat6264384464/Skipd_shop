"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getCartStore, saveCartStore, isUserLoggedIn } from "lib/utils";

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
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });
  const [flashItems, setFlashItems] = useState<FlashSaleItem[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Fetch live sales/products from localStorage & PostgreSQL Database
    async function loadDbDeals() {
      try {
        if (typeof window !== "undefined") {
          const customFlashSales = localStorage.getItem("ecom_flash_sale_products");
          if (customFlashSales) {
            const parsed = JSON.parse(customFlashSales);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setFlashItems(parsed);
              return;
            }
          }
        }

        const { fetchProducts, getApiBaseUrl } = await import("lib/api");
        const apiBase = getApiBaseUrl().replace(/\/+$/, "");
        
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2500);

        const salesRes = await fetch(`${apiBase}/sales`, { signal: controller.signal }).catch(() => null);
        clearTimeout(timer);

        if (salesRes && salesRes.ok) {
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

        // Fallback: Populate Flash Sale with real DB products (top discounted items)
        const realProducts = await fetchProducts().catch(() => []);
        if (Array.isArray(realProducts) && realProducts.length > 0) {
          const dealItems: FlashSaleItem[] = realProducts.slice(0, 4).map((p: any, idx: number) => {
            const sellingPrice = p.price || 999;
            const comparePrice = p.compare_at_price || Math.round(sellingPrice * 1.3);
            const discountPct = comparePrice > sellingPrice ? Math.round(((comparePrice - sellingPrice) / comparePrice) * 100) : 20;
            return {
              id: p.id,
              title: p.title,
              handle: p.handle || `product-${p.id}`,
              price: sellingPrice,
              compare_at_price: comparePrice,
              discount_percent: discountPct,
              image: p.images?.[0] || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
              sold_percent: 68 + (idx * 7)
            };
          });
          setFlashItems(dealItems);
        }
      } catch (e) {}
    }

    loadDbDeals();

    const handleSync = () => loadDbDeals();
    window.addEventListener("ecom_flash_sale_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("ecom_flash_sale_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
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

  const handleClaimDeal = (e: React.MouseEvent, item: FlashSaleItem) => {
    e.preventDefault();
    e.stopPropagation();

    // 🔒 REQUIRE LOGIN FOR CLAIMING DEALS — Direct Redirect without Toast Message
    if (!isUserLoggedIn()) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const existing = getCartStore();
      const itemToAdd = {
        id: item.id,
        handle: item.handle,
        title: item.title,
        price: item.price,
        compare_at_price: item.compare_at_price,
        quantity: 1,
        image: item.image
      };

      const idx = existing.findIndex((i: any) => String(i.id) === String(item.id) || i.handle === item.handle);
      let updated;
      if (idx > -1) {
        existing[idx].quantity = (existing[idx].quantity || 1) + 1;
        updated = [...existing];
      } else {
        updated = [...existing, itemToAdd];
      }

      saveCartStore(updated);

      // Dispatch real cart sync events
      window.dispatchEvent(new Event("ecom_cart_updated"));
      window.dispatchEvent(new Event("ecom_cart_changed"));

      toast.success(`⚡ Flash Deal Claimed!`, {
        description: `Added ${item.title} to cart at ₹${item.price.toLocaleString("en-IN")}. Opening product...`,
        duration: 3000
      });

      setTimeout(() => {
        router.push(`/product/${item.handle}`);
      }, 500);
    } catch (err) {
      router.push(`/product/${item.handle}`);
    }
  };

  const formatDigit = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl text-white my-8 overflow-hidden relative font-sans">
      
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-400/40 px-3 py-1 rounded-full text-cyan-300 font-black text-xs uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
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
            <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-blue-500/30">
              {formatDigit(timeLeft.hours)}
            </span>
            <span>:</span>
            <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-blue-500/30">
              {formatDigit(timeLeft.minutes)}
            </span>
            <span>:</span>
            <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-cyan-500/40 text-cyan-300">
              {formatDigit(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Deal Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-6" suppressHydrationWarning>
        {mounted && flashItems.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/60 rounded-2xl p-4 transition duration-200 flex flex-col justify-between space-y-3 group"
          >
            <div>
              {/* Product Image + Discount Pill */}
              <Link href={`/product/${item.handle}`} className="block relative aspect-square rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-800 cursor-pointer">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2 left-2 bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-md uppercase">
                  -{item.discount_percent}% OFF
                </span>
              </Link>

              <h3 className="font-extrabold text-white text-xs truncate group-hover:text-cyan-300 transition">
                <Link href={`/product/${item.handle}`}>{item.title}</Link>
              </h3>

              {/* Price Row */}
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-base font-black text-cyan-300">
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
                <span className="text-cyan-300">{item.sold_percent}% Sold</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${item.sold_percent}%` }}
                />
              </div>

              <button
                onClick={(e) => handleClaimDeal(e, item)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs text-center uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-1 active:scale-95"
              >
                ⚡ Claim Deal &rsaquo;
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
