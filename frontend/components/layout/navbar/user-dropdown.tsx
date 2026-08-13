"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LoginModal } from "components/auth/login-modal";

export function UserAccountDropdown() {
  const [user, setUser] = useState<{ user_name: string; email: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("skipd_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("skipd_token");
    localStorage.removeItem("skipd_user");
    setUser(null);
    setIsOpen(false);
    window.location.href = "/";
  };

  if (!user) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
        >
          Sign In / Register
        </button>

        <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  const initials = user.user_name
    ? user.user_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SR";

  return (
    <div className="relative">
      
      {/* 👤 User Avatar + Full Name Dropdown Button (Matching Screenshot 2) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-bold text-gray-900 bg-gray-100/90 border border-gray-200/80 hover:bg-gray-200/90 px-3 py-1.5 rounded-2xl transition cursor-pointer shadow-2xs"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
          {initials}
        </div>
        <span className="font-bold text-xs text-gray-900 leading-none">
          {user.user_name}
        </span>
        <span className="text-[10px] text-gray-500 font-black">▾</span>
      </button>

      {/*  dropdown Menu Card */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden z-50 text-xs text-gray-800 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header info */}
            <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 space-y-1">
              <p className="font-extrabold text-sm text-gray-900">{user.user_name}</p>
              <p className="text-[11px] text-gray-500 truncate">{user.email || "customer@skipd.in"}</p>
            </div>

            {/* Menu Links */}
            <div className="p-3 space-y-1 font-medium">
              <Link
                href="/account?tab=profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-100 text-gray-800 transition"
              >
                <span>👤</span>
                <span className="font-semibold">My Profile &amp; Account</span>
              </Link>

              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-emerald-800 font-bold transition"
              >
                <span>📦</span>
                <span>My Orders &amp; Tracking</span>
              </Link>

              <Link
                href="/gift-cards"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-amber-900 font-bold transition"
              >
                <span>🎁</span>
                <span>My Gift Cards</span>
              </Link>

              <Link
                href="/account?tab=wishlist"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-100 text-gray-800 transition"
              >
                <span>🖤</span>
                <span>My Wishlist</span>
              </Link>

              <Link
                href="/account?tab=supercoin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-100 text-gray-800 transition"
              >
                <span>🪙</span>
                <span>SuperCoins &amp; Rewards</span>
              </Link>

              <div className="border-t border-gray-100 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 font-bold transition cursor-pointer text-left"
                >
                  <span>🚪</span>
                  <span>Sign Out / Logout</span>
                </button>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
