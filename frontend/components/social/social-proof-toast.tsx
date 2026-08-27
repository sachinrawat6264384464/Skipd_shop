"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getApiBaseUrl } from "lib/api";
import { isUserLoggedIn, getCartStore, getUserWishlistKey } from "lib/utils";

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
  source?: "wishlist" | "cart";
}

export function SocialProofToast() {
  const pathname = usePathname();
  const [purchases, setPurchases] = useState<RecentPurchaseItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);

  // Check login state on navigation and event changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = isUserLoggedIn();
      setIsCustomerLoggedIn(loggedIn);
    }
  }, [pathname]);

  useEffect(() => {
    // 🛑 STRICT RULE 1: If not logged in or on admin route, DO NOT load or show notifications
    if (pathname?.startsWith("/admin") || !isCustomerLoggedIn) {
      setPurchases([]);
      return;
    }

    loadUserWishlistAndCartNotifications();

    const handleSync = () => {
      const loggedIn = isUserLoggedIn();
      setIsCustomerLoggedIn(loggedIn);
      if (loggedIn) {
        loadUserWishlistAndCartNotifications();
      } else {
        setPurchases([]);
      }
    };

    window.addEventListener("ecom_auth_changed", handleSync);
    window.addEventListener("ecom_cart_updated", handleSync);
    window.addEventListener("ecom_cart_changed", handleSync);
    window.addEventListener("ecom_wishlist_updated", handleSync);
    window.addEventListener("ecom_wishlist_changed", handleSync);

    return () => {
      window.removeEventListener("ecom_auth_changed", handleSync);
      window.removeEventListener("ecom_cart_updated", handleSync);
      window.removeEventListener("ecom_cart_changed", handleSync);
      window.removeEventListener("ecom_wishlist_updated", handleSync);
      window.removeEventListener("ecom_wishlist_changed", handleSync);
    };
  }, [pathname, isCustomerLoggedIn]);

  useEffect(() => {
    if (purchases.length === 0 || isDismissed || !isCustomerLoggedIn) return;

    // ⏱️ Cycle toast visibility: repeat every 5 minutes (300,000 ms) instead of 1 minute
    const interval = setInterval(() => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        setCurrentIndex((prev) => (prev + 1) % purchases.length);
      }, 10000); // Display toast for 10 seconds
    }, 300000); // 5 Minutes Interval

    // Initial show after 2 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 10000);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, [purchases.length, isDismissed, isCustomerLoggedIn]);

  const loadUserWishlistAndCartNotifications = async () => {
    if (typeof window === "undefined" || !isUserLoggedIn()) {
      setPurchases([]);
      return;
    }

    try {
      // 🛒 Read Logged-In Customer's Cart Items
      const cartItems = getCartStore() || [];

      // 💖 Read Logged-In Customer's Wishlist Items
      let wishlistItems: any[] = [];
      const wishlistKey = getUserWishlistKey();
      const savedWishlist = localStorage.getItem(wishlistKey) || localStorage.getItem("ecom_wishlist");
      if (savedWishlist) {
        try {
          const parsed = JSON.parse(savedWishlist);
          if (Array.isArray(parsed)) wishlistItems = parsed;
        } catch (e) {}
      }

      // Collect user's targeted items from Cart & Wishlist
      const userTargetMap = new Map<string, { title: string; handle: string; image: string; price: number; source: "wishlist" | "cart" }>();

      wishlistItems.forEach((item) => {
        const title = item.title || item.name;
        const handle = item.handle || item.id;
        const image = item.image || item.featuredImage?.url || item.images?.[0] || "/placeholder.png";
        const price = item.price?.amount ? parseFloat(item.price.amount) : (typeof item.price === "number" ? item.price : 999);
        if (title && handle) {
          userTargetMap.set(String(handle).toLowerCase(), { title, handle: String(handle), image, price, source: "wishlist" });
        }
      });

      cartItems.forEach((item) => {
        const title = item.title || item.name || item.merchandise?.product?.title;
        const handle = item.handle || item.merchandise?.product?.handle || item.id;
        const image = item.image || item.merchandise?.product?.featuredImage?.url || item.images?.[0] || "/placeholder.png";
        const price = typeof item.price === "number" ? item.price : (item.cost?.totalAmount?.amount ? parseFloat(item.cost.totalAmount.amount) : 999);
        if (title && handle) {
          userTargetMap.set(String(handle).toLowerCase(), { title, handle: String(handle), image, price, source: "cart" });
        }
      });

      const userTargetList = Array.from(userTargetMap.values());

      // 🛑 STRICT RULE 2: If customer has NO items in Wishlist or Cart, DO NOT show any notifications!
      if (userTargetList.length === 0) {
        setPurchases([]);
        return;
      }

      // Fetch recent purchases from API
      const apiBase = getApiBaseUrl().replace(/\/+$/, "");
      const res = await fetch(`${apiBase}/orders/recent-purchases`);

      let backendPurchases: any[] = [];
      if (res.ok) {
        const data = await res.json();
        if (data.recent_purchases && Array.isArray(data.recent_purchases)) {
          backendPurchases = data.recent_purchases;
        }
      }

      const indianCities = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Indore", "Pune", "Jaipur", "Ahmedabad", "Chennai", "Kolkata"];
      const customerNames = ["Ananya", "Rohan", "Priya", "Vikram", "Neha", "Aarav", "Simran", "Kabir", "Divya", "Siddharth"];
      const timesAgo = ["2 minutes ago", "5 minutes ago", "8 minutes ago", "12 minutes ago", "15 minutes ago", "20 minutes ago"];

      // 🎯 Create notifications ONLY for items in the customer's Wishlist or Cart
      const matchedNotifications: RecentPurchaseItem[] = userTargetList.map((targetItem, idx) => {
        const backendMatch = backendPurchases.find(bp =>
          bp.product_title?.toLowerCase().includes(targetItem.title.toLowerCase()) ||
          bp.product_handle === targetItem.handle
        );

        return {
          id: backendMatch?.id || (Date.now() + idx),
          customer_name: backendMatch?.customer_name || customerNames[idx % customerNames.length],
          location: backendMatch?.location || indianCities[idx % indianCities.length],
          product_title: targetItem.title,
          product_handle: targetItem.handle,
          product_image: targetItem.image,
          price: targetItem.price,
          formatted_price: `₹${Number(targetItem.price).toLocaleString("en-IN")}`,
          time_ago: backendMatch?.time_ago || timesAgo[idx % timesAgo.length],
          source: targetItem.source
        };
      });

      setPurchases(matchedNotifications);

    } catch (e) {
      console.error("Error loading wishlist/cart notifications:", e);
      setPurchases([]);
    }
  };

  const current = purchases[currentIndex];

  if (pathname?.startsWith("/admin") || !isCustomerLoggedIn || purchases.length === 0 || !isVisible || isDismissed || !current) {
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
          {/* Wishlist / Cart Badge Header */}
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider mb-0.5">
            {current.source === "wishlist" ? (
              <span className="bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                💖 In Your Wishlist
              </span>
            ) : (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                🛒 In Your Cart
              </span>
            )}
          </div>

          <p className="text-[10px] text-slate-400 font-bold leading-tight flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-white">{current.customer_name}</span> from {current.location} bought this
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
