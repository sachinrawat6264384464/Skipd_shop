"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LoginModal } from "components/auth/login-modal";

export function WishlistNavButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("skipd_token");
    const user = localStorage.getItem("skipd_user");
    setIsLoggedIn(!!(token || user));
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
        </button>

        <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <Link
      href="/account?tab=wishlist"
      className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition text-base relative"
      title="My Wishlist"
    >
      🖤
    </Link>
  );
}
