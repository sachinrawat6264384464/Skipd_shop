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

const API_BASE = typeof window !== "undefined"
  ? (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "https://skipd-ecom.onrender.com/api/v1"
    : (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"))
  : "https://skipd-ecom.onrender.com/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("skipd_token") || null;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  /** Load wishlist from PostgreSQL DB if logged in */
  const loadWishlistFromDB = useCallback(async () => {
    const token = getToken();
    if (!token) {
      // Guest user: empty wishlist, no localStorage fallback
      setWishlist([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/wishlist`, {
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

  /** Toggle wishlist item — writes directly to PostgreSQL DB via API */
  const toggleWishlistDB = async (productId: number): Promise<"added" | "removed" | null> => {
    const token = getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId })
      });
      if (res.ok) {
        const data = await res.json();
        return data.status as "added" | "removed";
      }
    } catch (e) {
      console.warn("[Wishlist] Toggle DB failed:", e);
    }
    return null;
  };

  const addToWishlist = async (item: WishlistItem) => {
    if (wishlist.some(w => w.id === item.id)) return;
    const status = await toggleWishlistDB(item.id);
    if (status === "added") {
      setWishlist(prev => [...prev, item]);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("skipd_wishlist_updated"));
      }
    }
  };

  const removeFromWishlist = async (id: number) => {
    const status = await toggleWishlistDB(id);
    if (status === "removed") {
      setWishlist(prev => prev.filter(w => w.id !== id));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("skipd_wishlist_updated"));
      }
    }
  };

  const isInWishlist = (id: number) => {
    return wishlist.some(w => w.id === id);
  };

  const toggleWishlist = async (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      await removeFromWishlist(item.id);
    } else {
      await addToWishlist(item);
    }
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
