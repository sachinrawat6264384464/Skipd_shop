"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface WishlistItem {
  id: number;
  handle: string;
  title: string;
  price: number;
  compare_at_price?: number;
  image: string;
  category?: string;
  rating?: number;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function getApiBase(): string {
  if (typeof window === "undefined") return "https://skipd-ecom.onrender.com/api/v1";
  const h = window.location.hostname;
  if (h === "localhost" || h === "127.0.0.1") {
    return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
  }
  return "https://skipd-ecom.onrender.com/api/v1";
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("skipd_token") || null;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  /** Load wishlist from PostgreSQL DB when logged in */
  const loadWishlistFromDB = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setWishlist([]);
      return;
    }
    try {
      const res = await fetch(`${getApiBase()}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        const items: WishlistItem[] = (data.wishlist || []).map((w: any) => ({
          id: w.product_id,
          handle: w.handle || "",
          title: w.title || "",
          price: w.price || 0,
          compare_at_price: w.compare_at_price,
          image: w.image || "",
          category: w.category || undefined
        }));
        setWishlist(items);
        return;
      }
    } catch (e) {
      console.warn("[Wishlist] Failed to load from DB:", e);
    }
    setWishlist([]);
  }, []);

  useEffect(() => {
    loadWishlistFromDB();
    window.addEventListener("skipd_auth_changed", loadWishlistFromDB);
    return () => {
      window.removeEventListener("skipd_auth_changed", loadWishlistFromDB);
    };
  }, [loadWishlistFromDB]);

  const isInWishlist = (id: number) => wishlist.some(w => w.id === id);

  /**
   * OPTIMISTIC toggle:
   * 1. Update local state immediately so UI flips instantly
   * 2. Fire DB call in background
   * 3. If DB call fails → revert the optimistic state
   */
  const toggleWishlist = (item: WishlistItem) => {
    const token = getToken();
    const alreadyIn = wishlist.some(w => w.id === item.id);

    // ✅ Optimistic update — instant UI feedback
    if (alreadyIn) {
      setWishlist(prev => prev.filter(w => w.id !== item.id));
    } else {
      setWishlist(prev => [...prev, item]);
    }

    // Fire event so navbar count updates immediately
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("skipd_wishlist_updated"));
    }

    // If not logged in → just show optimistic state (will be cleared on next load)
    if (!token) return;

    // DB sync in background
    fetch(`${getApiBase()}/wishlist/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: item.id })
    })
      .then(res => {
        if (!res.ok) throw new Error("DB toggle failed");
        return res.json();
      })
      .then(data => {
        // DB confirmed — if response doesn't match optimistic state, sync
        if (data.status === "added" && alreadyIn) {
          // Was in wishlist locally but DB says added → revert
          setWishlist(prev => prev.filter(w => w.id !== item.id));
        } else if (data.status === "removed" && !alreadyIn) {
          // Was not in wishlist locally but DB says removed → add back
          setWishlist(prev => (prev.some(w => w.id === item.id) ? prev : [...prev, item]));
        }
      })
      .catch(err => {
        console.warn("[Wishlist] DB sync failed, reverting:", err);
        // Revert optimistic update on failure
        if (alreadyIn) {
          setWishlist(prev => (prev.some(w => w.id === item.id) ? prev : [...prev, item]));
        } else {
          setWishlist(prev => prev.filter(w => w.id !== item.id));
        }
      });
  };

  const addToWishlist = (item: WishlistItem) => {
    if (!isInWishlist(item.id)) toggleWishlist(item);
  };

  const removeFromWishlist = (id: number) => {
    const item = wishlist.find(w => w.id === id);
    if (item) toggleWishlist(item);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
