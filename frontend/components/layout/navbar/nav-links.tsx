"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function NavLinks() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("ecom_token") : null;
      const user = typeof window !== "undefined" ? localStorage.getItem("ecom_user") : null;
      setIsLoggedIn(!!(token || user));
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);
    window.addEventListener("ecom_auth_changed", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("ecom_auth_changed", checkAuth);
    };
  }, []);

  return (
    <ul className="hidden lg:flex items-center gap-2.5 xl:gap-4 text-xs font-bold text-gray-800 whitespace-nowrap">
      
      {/* 📁 Categories Hover Dropdown */}
      <li className="relative group cursor-pointer">
        <Link
          href="/search"
          className="px-3.5 py-2 rounded-xl hover:bg-gray-100/90 transition flex items-center gap-1.5 font-extrabold text-gray-900"
        >
          <span>Categories</span>
          <span className="text-[10px] text-emerald-600 transition group-hover:rotate-180 duration-200">▼</span>
        </Link>

        {/* Hover Categories Dropdown Card */}
        <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl border border-gray-200/90 rounded-2xl shadow-2xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-200 z-50 text-xs space-y-1.5">
          <div className="text-[10px] font-black uppercase text-gray-400 px-3 py-1 tracking-wider border-b border-gray-100">
            Shop By Category
          </div>
          <Link
            href="/search"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50/80 text-emerald-900 font-black hover:bg-emerald-100/80 transition"
          >
            <span>🛍️</span> All Categories &amp; Catalog
          </Link>
          <Link
            href="/search/tech"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-800 font-bold transition"
          >
            <span>🎧</span> Electronics &amp; Gadgets
          </Link>
          <Link
            href="/search/apparel"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-800 font-bold transition"
          >
            <span>👕</span> Fashion &amp; Clothing
          </Link>
          <Link
            href="/search/lifestyle"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-800 font-bold transition"
          >
            <span>⌚</span> Watches &amp; Accessories
          </Link>

          {/* 🎁 Gift Cards Dropdown Link - ONLY SHOW WHEN LOGGED IN */}
          {isLoggedIn && (
            <Link
              href="/gift-cards"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-900 font-extrabold transition border-t border-gray-100 mt-1 pt-2"
            >
              <span>🎁</span> Gift Cards &amp; Rewards
            </Link>
          )}
        </div>
      </li>

      {/* 🏬 Explore Store Link */}
      <li>
        <Link
          href="/search"
          className="px-3.5 py-2 rounded-xl hover:bg-gray-100/90 hover:text-black transition font-bold"
        >
          Explore Store
        </Link>
      </li>

      {/* 🔥 Deals Link */}
      <li>
        <Link
          href="/deals"
          className="px-3.5 py-2 rounded-xl text-emerald-700 font-black hover:bg-emerald-50 transition flex items-center gap-1.5"
        >
          <span>Deals</span>
          <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs animate-pulse">
            HOT
          </span>
        </Link>
      </li>

      {/* 🎁 GIFT CARDS LINK - ONLY SHOWN WHEN CUSTOMER IS LOGGED IN */}
      {isLoggedIn && (
        <li>
          <Link
            href="/gift-cards"
            className="px-3.5 py-2 rounded-xl text-amber-800 font-extrabold hover:bg-amber-50 transition flex items-center gap-1.5"
          >
            <span>🎁</span>
            <span>Gift Cards</span>
          </Link>
        </li>
      )}

      {/* ✨ New Arrivals Link */}
      <li>
        <Link
          href="/new-arrivals"
          className="px-3.5 py-2 rounded-xl text-gray-900 font-extrabold hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center gap-1.5"
        >
          <span>New Arrivals</span>
          <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
            NEW
          </span>
        </Link>
      </li>

    </ul>
  );
}
