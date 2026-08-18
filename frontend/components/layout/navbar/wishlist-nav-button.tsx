"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LoginModal } from "components/auth/login-modal";
import { useWishlist } from "components/wishlist/wishlist-context";

export function WishlistNavButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { wishlist } = useWishlist();

  const checkLogin = () => {
    const token = localStorage.getItem("skipd_token");
    const user = localStorage.getItem("skipd_user");
    setIsLoggedIn(!!(token || user));
  };

  useEffect(() => {
    checkLogin();
    window.addEventListener("skipd_auth_changed", checkLogin);
    return () => {
      window.removeEventListener("skipd_auth_changed", checkLogin);
    };
  }, []);

  const wishlistCount = wishlist.length;

  if (!isLoggedIn) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition text-base relative cursor-pointer ${
            wishlistCount > 0
              ? "bg-red-50 border-red-200 text-red-500"
              : "bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-800"
          }`}
          title="Wishlist"
        >
          {wishlistCount > 0 ? "❤️" : "🖤"}
          {wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-extrabold text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in">
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
      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition text-base relative cursor-pointer ${
        wishlistCount > 0
          ? "bg-red-50 border-red-200 text-red-500"
          : "bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-800"
      }`}
      title={`My Wishlist (${wishlistCount} saved)`}
    >
      {wishlistCount > 0 ? "❤️" : "🖤"}
      {wishlistCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-extrabold text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in">
          {wishlistCount}
        </span>
      )}
    </Link>
  );
}
