"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getApiBaseUrl } from "lib/api";

interface RecentPurchaseItem {
  id: number;
  customer_name: string;
  location: string;
  product_title: string;
  product_handle: string;
  product_image: string;
  price: number;
  formatted_price: string;
  time_ago: string;
}

export function SocialProofToast() {
  const [purchases, setPurchases] = useState<RecentPurchaseItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    fetchRecentPurchases();
  }, []);

  useEffect(() => {
    if (purchases.length === 0 || isDismissed) return;

    // Show toast for 5 seconds, hide for 7 seconds
    const interval = setInterval(() => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        setCurrentIndex((prev) => (prev + 1) % purchases.length);
      }, 5000);
    }, 12000);

    // Initial show after 3 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 5000);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, [purchases, isDismissed]);

  const fetchRecentPurchases = async () => {
    try {
      const apiBase = getApiBaseUrl().replace(/\/+$/, "");
      const res = await fetch(`${apiBase}/orders/recent-purchases`);
      if (res.ok) {
        const data = await res.json();
        if (data.recent_purchases && data.recent_purchases.length > 0) {
          setPurchases(data.recent_purchases);
        }
      }
    } catch (e) {
      console.error("Error fetching recent purchases for social proof:", e);
    }
  };

  const current = purchases[currentIndex];

  if (purchases.length === 0 || !isVisible || isDismissed || !current) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl text-white animate-in slide-in-from-bottom-5 duration-300 font-sans">
      <div className="flex items-center gap-3 relative">
        
        {/* Dismiss Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center justify-center font-bold transition cursor-pointer"
          title="Dismiss"
        >
          ✕
        </button>

        {/* Product Image */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0">
          <img
            src={current.product_image}
            alt={current.product_title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[10px] text-slate-400 font-bold leading-tight flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-white">{current.customer_name}</span> from {current.location}
          </p>

          <Link
            href={`/product/${current.product_handle}`}
            className="block text-xs font-extrabold text-white truncate hover:text-emerald-400 transition mt-0.5"
          >
            {current.product_title}
          </Link>

          <div className="flex items-center justify-between text-[10px] pt-1">
            <span className="font-black text-emerald-400">{current.formatted_price}</span>
            <span className="text-slate-400 font-medium">{current.time_ago}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
