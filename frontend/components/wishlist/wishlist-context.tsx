"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserWishlistKey } from "lib/utils";

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

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const loadWishlist = () => {
    const key = getUserWishlistKey();
    const token = localStorage.getItem("skipd_token");
    const user = localStorage.getItem("skipd_user");
    const loggedIn = !!(token || user);

    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        setWishlist(JSON.parse(saved));
        return;
      } catch (e) {}
    }

    // New logged-in user starts with 0 items, guest gets demo seed items
    const initial = loggedIn ? [] : [
      {
        id: 1,
        handle: "active-anc-headphones",
        title: "boAt Rockerz Plus 550 ANC Headphones",
        price: 1799,
        compare_at_price: 4990,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        category: "Tech Essentials",
        rating: 4.3
      }
    ];
    setWishlist(initial);
    localStorage.setItem(key, JSON.stringify(initial));
  };

  useEffect(() => {
    loadWishlist();

    window.addEventListener("skipd_auth_changed", loadWishlist);
    window.addEventListener("storage", loadWishlist);
    return () => {
      window.removeEventListener("skipd_auth_changed", loadWishlist);
      window.removeEventListener("storage", loadWishlist);
    };
  }, []);

  const saveWishlist = (items: WishlistItem[]) => {
    setWishlist(items);
    const key = getUserWishlistKey();
    localStorage.setItem(key, JSON.stringify(items));
  };

  const addToWishlist = (item: WishlistItem) => {
    if (!wishlist.some(w => w.id === item.id)) {
      saveWishlist([...wishlist, item]);
    }
  };

  const removeFromWishlist = (id: number) => {
    saveWishlist(wishlist.filter(w => w.id !== id));
  };

  const isInWishlist = (id: number) => {
    return wishlist.some(w => w.id === id);
  };

  const toggleWishlist = (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
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
