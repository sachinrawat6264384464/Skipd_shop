"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface WishlistItem {
  id: number | string;
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
  removeFromWishlist: (id: number | string) => void;
  isInWishlist: (id: number | string) => boolean;
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

  /** Load wishlist from PostgreSQL DB when logged in, or fallback to LocalStorage for guest users */
  const loadWishlistFromDB = useCallback(async () => {
    const token = getToken();
    if (!token) {
      if (typeof window !== "undefined") {
        try {
          const savedGuest = localStorage.getItem("skipd_guest_wishlist");
          if (savedGuest) {
            const parsed = JSON.parse(savedGuest);
            if (Array.isArray(parsed)) {
              setWishlist(parsed);
              return;
            }
          }
        } catch (e) {}
      }
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
  }, []);

  useEffect(() => {
    loadWishlistFromDB();
    const handleAuthChange = () => loadWishlistFromDB();
    const handleWishlistUpdated = () => loadWishlistFromDB();

    window.addEventListener("skipd_auth_changed", handleAuthChange);
    window.addEventListener("skipd_wishlist_updated", handleWishlistUpdated);

    return () => {
      window.removeEventListener("skipd_auth_changed", handleAuthChange);
      window.removeEventListener("skipd_wishlist_updated", handleWishlistUpdated);
    };
  }, [loadWishlistFromDB]);

  /** Loose string/number type-safe check */
  const isInWishlist = (id: number | string) => {
    if (!id) return false;
    return wishlist.some(w => String(w.id) === String(id));
  };

  /**
   * OPTIMISTIC toggle with String ID comparison & Guest local storage support
   */
  const toggleWishlist = (item: WishlistItem) => {
    const token = getToken();
    const itemIdStr = String(item.id);
    const alreadyIn = wishlist.some(w => String(w.id) === itemIdStr);

    let nextWishlist: WishlistItem[] = [];
    if (alreadyIn) {
      nextWishlist = wishlist.filter(w => String(w.id) !== itemIdStr);
    } else {
      nextWishlist = [...wishlist, item];
    }

    // Instantly update state
    setWishlist(nextWishlist);

    // Save to guest local storage if not logged in
    if (!token && typeof window !== "undefined") {
      try {
        localStorage.setItem("skipd_guest_wishlist", JSON.stringify(nextWishlist));
      } catch (e) {}
    }

    // Fire event for UI & navbar update
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("skipd_wishlist_changed"));
    }

    if (!token) return;

    // Fire PostgreSQL DB sync call in background
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
      .catch(err => {
        console.warn("[Wishlist] DB sync failed, reverting:", err);
        // Revert optimistic update on failure
        if (alreadyIn) {
          setWishlist(prev => (prev.some(w => String(w.id) === itemIdStr) ? prev : [...prev, item]));
        } else {
          setWishlist(prev => prev.filter(w => String(w.id) !== itemIdStr));
        }
      });
  };

  const addToWishlist = (item: WishlistItem) => {
    if (!isInWishlist(item.id)) toggleWishlist(item);
  };

  const removeFromWishlist = (id: number | string) => {
    const item = wishlist.find(w => String(w.id) === String(id));
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
