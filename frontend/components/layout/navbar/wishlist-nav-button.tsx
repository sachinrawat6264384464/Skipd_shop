"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LoginModal } from "components/auth/login-modal";
import { getUserWishlistKey } from "lib/utils";

export function WishlistNavButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const updateCount = () => {
    const token = localStorage.getItem("skipd_token");
    const user = localStorage.getItem("skipd_user");
    setIsLoggedIn(!!(token || user));

    try {
      const key = getUserWishlistKey();
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setWishlistCount(parsed.length);
          return;
        }
      }
      setWishlistCount(0);
    } catch (e) {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    updateCount();

    window.addEventListener("skipd_auth_changed", updateCount);
    window.addEventListener("skipd_wishlist_updated", updateCount);
    window.addEventListener("skipd_wishlist_changed", updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener("skipd_auth_changed", updateCount);
      window.removeEventListener("skipd_wishlist_updated", updateCount);
      window.removeEventListener("skipd_wishlist_changed", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  if (!isLoggedIn) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition text-base relative cursor-pointer"
          title="Wishlist (Sign In Required)"
        >
          🖤
          {wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white font-extrabold text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in">
              {wishlistCount}
            </span>
          )}
        </button>

        <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <Link
      href="/account?tab=wishlist"
      className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition text-base relative cursor-pointer"
      title={`My Wishlist (${wishlistCount} saved)`}
    >
      🖤
      {wishlistCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white font-extrabold text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in">
          {wishlistCount}
        </span>
      )}
    </Link>
  );
}
