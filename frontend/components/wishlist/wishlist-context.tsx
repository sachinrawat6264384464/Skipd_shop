"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "lib/api";

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
  isInWishlist: (id: number | string, handle?: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function getApiBase(): string {
  return getApiBaseUrl();
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const directToken = localStorage.getItem("ecom_token") || localStorage.getItem("user_token") || localStorage.getItem("token");
  if (directToken) return directToken;

  try {
    const userStr = localStorage.getItem("ecom_user");
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u && u.email) return u.email;
    }
  } catch (e) {}
  return null;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const pendingTogglesRef = useRef<Set<string>>(new Set());
  const router = useRouter();

  // 1. Dynamic Load from PostgreSQL Database (Strictly per Logged-In User Account)
  const loadWishlist = useCallback(async () => {
    const token = getToken();

    // 🔒 LOGGED OUT / GUEST: Wishlist MUST be empty array []
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

    // 🔓 LOGGED IN: Fetch real dynamic user wishlist items from PostgreSQL DB
    try {
      const res = await fetch(`${getApiBase()}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        const dbItems: WishlistItem[] = (data.wishlist || []).map((w: any) => ({
          id: w.product_id || w.id,
          handle: w.handle || "",
          title: w.title || "",
          price: w.price || 0,
          compare_at_price: w.compare_at_price,
          image: w.image || w.images?.[0] || "",
          category: w.category || undefined
        }));
        setWishlist(dbItems);
      } else if (res.status === 401 || res.status === 403) {
        setWishlist([]);
      }
    } catch (e) {
      console.warn("[Wishlist] DB fetch error:", e);
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

  /** Type-safe & handle-safe check */
  const isInWishlist = (id: number | string, handle?: string) => {
    if (!id && !handle) return false;
    const searchIdStr = id ? String(id) : "";
    const searchHandle = handle ? String(handle).toLowerCase() : "";

    return wishlist.some(w => 
      (searchIdStr && String(w.id) === searchIdStr) || 
      (searchHandle && String(w.handle).toLowerCase() === searchHandle)
    );
  };

  /**
   * Toggle Wishlist Item (Strict Database Persistence)
   */
  const toggleWishlist = (item: WishlistItem) => {
    if (!item || (!item.id && !item.handle)) return;
    const token = getToken();

    // Require Login for Wishlist Action
    if (!token) {
      if (typeof window !== "undefined") {
        router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
      return;
    }

    const itemIdStr = String(item.id || item.handle);

    // Debounce rapid double-clicks (150ms)
    if (pendingTogglesRef.current.has(itemIdStr)) {
      return;
    }
    pendingTogglesRef.current.add(itemIdStr);
    setTimeout(() => {
      pendingTogglesRef.current.delete(itemIdStr);
    }, 150);

    // Optimistic UI update in memory
    setWishlist(prev => {
      const alreadyIn = prev.some(w => 
        (item.id && String(w.id) === String(item.id)) || 
        (item.handle && String(w.handle).toLowerCase() === String(item.handle).toLowerCase())
      );
      if (alreadyIn) {
        return prev.filter(w => 
          String(w.id) !== String(item.id) && 
          (!item.handle || String(w.handle).toLowerCase() !== String(item.handle).toLowerCase())
        );
      } else {
        return [...prev, item];
      }
    });

    // Notify header icons & wishlist views
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ecom_wishlist_changed"));
      window.dispatchEvent(new Event("ecom_wishlist_updated"));
    }

    // 💾 Save directly to PostgreSQL DB in background
    if (item.id) {
      const numericId = Number(item.id);
      fetch(`${getApiBase()}/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: numericId || item.id })
      })
      .then(res => {
        if (res.ok) {
          loadWishlist();
        }
      })
      .catch(err => {
        console.warn("[Wishlist] DB toggle error:", err);
      });
    }
  };

  const addToWishlist = (item: WishlistItem) => {
    if (!isInWishlist(item.id, item.handle)) toggleWishlist(item);
  };

  const removeFromWishlist = (id: number | string) => {
    const item = wishlist.find(w => String(w.id) === String(id));
    if (item) {
      toggleWishlist(item);
    } else {
      setWishlist(prev => prev.filter(w => String(w.id) !== String(id)));
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
