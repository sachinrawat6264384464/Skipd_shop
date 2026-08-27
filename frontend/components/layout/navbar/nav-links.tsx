"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export function NavLinks() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("ecom_token") : null;
      const user = typeof window !== "undefined" ? localStorage.getItem("ecom_user") : null;
      setIsLoggedIn(!!(token || user));
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);
    window.addEventListener("ecom_auth_changed", checkAuth);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("ecom_auth_changed", checkAuth);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <ul className="hidden lg:flex items-center gap-2.5 xl:gap-4 text-xs font-bold text-gray-800 whitespace-nowrap">
      
      {/* 📁 Categories Dropdown */}
      <li
        ref={dropdownRef}
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsCatOpen(true)}
        onMouseLeave={() => setIsCatOpen(false)}
      >
        <button
          type="button"
          onClick={() => setIsCatOpen((prev) => !prev)}
          className="px-3.5 py-2 rounded-xl hover:bg-gray-100/90 transition flex items-center gap-1.5 font-extrabold text-gray-900 cursor-pointer border-none bg-transparent"
        >
          <span>Categories</span>
          <span className={`text-[10px] text-emerald-600 transition-transform duration-200 ${isCatOpen ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>

        {/* Hover & Click Categories Dropdown Card (Invisible hover bridge + zero gap) */}
        <div
          className={`absolute top-full left-0 pt-1.5 w-64 z-50 transition-all duration-200 ${
            isCatOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <div className="bg-white/95 backdrop-blur-2xl border border-gray-200/90 rounded-2xl shadow-2xl p-3 text-xs space-y-1.5">
            <div className="text-[10px] font-black uppercase text-gray-400 px-3 py-1 tracking-wider border-b border-gray-100">
              Shop By Category
            </div>
            <Link
              href="/search"
              prefetch={false}
              onClick={() => setIsCatOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50/80 text-emerald-900 font-black hover:bg-emerald-100/80 transition"
            >
              <span>🛍️</span> All Categories &amp; Catalog
            </Link>
            <Link
              href="/search/tech"
              prefetch={false}
              onClick={() => setIsCatOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-800 font-bold transition"
            >
              <span>🎧</span> Electronics &amp; Gadgets
            </Link>
            <Link
              href="/search/apparel"
              prefetch={false}
              onClick={() => setIsCatOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-800 font-bold transition"
            >
              <span>👕</span> Fashion &amp; Clothing
            </Link>
            <Link
              href="/search/lifestyle"
              prefetch={false}
              onClick={() => setIsCatOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-800 font-bold transition"
            >
              <span>⌚</span> Watches &amp; Accessories
            </Link>

            {/* 🎁 Gift Cards Dropdown Link - ONLY SHOW WHEN LOGGED IN */}
            {isLoggedIn && (
              <Link
                href="/gift-cards"
                prefetch={false}
                onClick={() => setIsCatOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-900 font-extrabold transition border-t border-gray-100 mt-1 pt-2"
              >
                <span>🎁</span> Gift Cards &amp; Rewards
              </Link>
            )}
          </div>
        </div>
      </li>

      {/* 🔥 Deals Link */}
      <li>
        <Link
          href="/deals"
          prefetch={false}
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
            prefetch={false}
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
          prefetch={false}
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
