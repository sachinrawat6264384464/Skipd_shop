"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

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
  if (typeof window === "undefined") return "https://e-com-ecom.onrender.com/api/v1";
  const h = window.location.hostname;
  if (h === "localhost" || h === "127.0.0.1") {
    return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
  }
  return "https://e-com-ecom.onrender.com/api/v1";
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ecom_token") || null;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const pendingTogglesRef = useRef<Set<string>>(new Set());

  // 1. Initial Load from LocalStorage + DB Sync
  const loadWishlist = useCallback(async () => {
    const token = getToken();

    // 🔒 UNAUTHENTICATED / LOGGED OUT: Reset Wishlist to empty array []
    if (!token) {
      setWishlist([]);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("ecom_wishlist_items");
          localStorage.removeItem("ecom_guest_wishlist");
        } catch (e) {}
      }
      return;
    }

    // 🔓 LOGGED IN: Fetch real user wishlist items from PostgreSQL DB
    try {
      const res = await fetch(`${getApiBase()}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        const dbItems: WishlistItem[] = (data.wishlist || []).map((w: any) => ({
          id: w.product_id,
          handle: w.handle || "",
          title: w.title || "",
          price: w.price || 0,
          compare_at_price: w.compare_at_price,
          image: w.image || "",
          category: w.category || undefined
        }));

        setWishlist(dbItems);
        if (typeof window !== "undefined") {
          localStorage.setItem(`ecom_wishlist_${token.slice(0, 15)}`, JSON.stringify(dbItems));
        }
      } else {
        setWishlist([]);
      }
    } catch (e) {
      console.warn("[Wishlist] DB load error:", e);
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
    const handleAuthChange = () => loadWishlist();
    const handleWishlistUpdated = () => loadWishlist();

    window.addEventListener("ecom_auth_changed", handleAuthChange);
    window.addEventListener("ecom_wishlist_updated", handleWishlistUpdated);
    window.addEventListener("ecom_wishlist_changed", handleWishlistUpdated);

    return () => {
      window.removeEventListener("ecom_auth_changed", handleAuthChange);
      window.removeEventListener("ecom_wishlist_updated", handleWishlistUpdated);
      window.removeEventListener("ecom_wishlist_changed", handleWishlistUpdated);
    };
  }, [loadWishlist]);

  /** Loose string/number type-safe check */
  const isInWishlist = (id: number | string) => {
    if (!id) return false;
    const searchIdStr = String(id);
    return wishlist.some(w => String(w.id) === searchIdStr);
  };

  /**
   * Toggle Wishlist Item (Optimistic & Persistent)
   */
  const toggleWishlist = (item: WishlistItem) => {
    if (!item || !item.id) return;
    const itemIdStr = String(item.id);

    // Debounce rapid double-clicks (150ms)
    if (pendingTogglesRef.current.has(itemIdStr)) {
      return;
    }
    pendingTogglesRef.current.add(itemIdStr);
    setTimeout(() => {
      pendingTogglesRef.current.delete(itemIdStr);
    }, 150);

    setWishlist(prev => {
      const alreadyIn = prev.some(w => String(w.id) === itemIdStr);
      let updated: WishlistItem[] = [];

      if (alreadyIn) {
        updated = prev.filter(w => String(w.id) !== itemIdStr);
      } else {
        updated = [...prev, item];
      }

      // Persist in LocalStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("ecom_wishlist_items", JSON.stringify(updated));
          localStorage.setItem("ecom_guest_wishlist", JSON.stringify(updated));
        } catch (e) {}
      }

      return updated;
    });

    // Notify header icons & wishlist views
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ecom_wishlist_changed"));
      window.dispatchEvent(new Event("ecom_wishlist_updated"));
    }

    // Sync to PostgreSQL DB in background if logged in
    const token = getToken();
    if (token) {
      const numericId = Number(item.id);
      fetch(`${getApiBase()}/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: numericId || item.id })
      }).catch(err => {
        console.warn("[Wishlist] DB sync background warning:", err);
      });
    }
  };

  const addToWishlist = (item: WishlistItem) => {
    if (!isInWishlist(item.id)) toggleWishlist(item);
  };

  const removeFromWishlist = (id: number | string) => {
    const item = wishlist.find(w => String(w.id) === String(id));
    if (item) {
      toggleWishlist(item);
    } else {
      setWishlist(prev => {
        const updated = prev.filter(w => String(w.id) !== String(id));
        if (typeof window !== "undefined") {
          localStorage.setItem("ecom_wishlist_items", JSON.stringify(updated));
        }
        return updated;
      });
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
