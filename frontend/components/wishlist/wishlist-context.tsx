"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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

  useEffect(() => {
    // Load stored wishlist from localStorage on mount
    const saved = localStorage.getItem("skipd_wishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
        return;
      } catch (e) {}
    }

    // Default Seed Items
    const defaultSeed: WishlistItem[] = [
      {
        id: 1,
        handle: "active-anc-headphones",
        title: "boAt Rockerz Plus 550 ANC Headphones",
        price: 1799,
        compare_at_price: 4990,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        category: "Tech Essentials",
        rating: 4.3
      },
      {
        id: 3,
        handle: "matte-black-chrono-watch",
        title: "Matte Black Genuine Leather Chrono Watch",
        price: 3499,
        compare_at_price: 5499,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        category: "Lifestyle Accessories",
        rating: 4.6
      }
    ];
    setWishlist(defaultSeed);
    localStorage.setItem("skipd_wishlist", JSON.stringify(defaultSeed));
  }, []);

  const saveWishlist = (items: WishlistItem[]) => {
    setWishlist(items);
    localStorage.setItem("skipd_wishlist", JSON.stringify(items));
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
