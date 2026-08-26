"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LoginModal } from "components/auth/login-modal";
import { LanguagePicker } from "components/language/language-picker";

export default function MobileMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ user_name: string; email: string } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Portal mount check for SSR safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Re-check authentication state when drawer opens or path changes
  useEffect(() => {
    const token = localStorage.getItem("skipd_token");
    const stored = localStorage.getItem("skipd_user");
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [isOpen, pathname]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("skipd_token");
    localStorage.removeItem("skipd_user");
    setUser(null);
    setIsOpen(false);
    window.location.href = "/";
  };

  return (
    <div className="lg:hidden">
      {/* ☰ Mobile Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Store Menu"
        type="button"
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200/80 transition cursor-pointer shadow-2xs"
      >
        <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 📱 Slide-Over Mobile Navigation Drawer */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[999999] flex">
          
          {/* Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-[85%] max-w-xs bg-white h-full shadow-2xl overflow-y-auto flex flex-col z-50 text-gray-800 font-sans animate-in slide-in-from-left duration-200">
            
            {/* Header: Brand, Language Picker & Close Button */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 font-black text-lg text-gray-900">
                <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  E
                </span>
                <span>E-COM STORE</span>
              </Link>

              <div className="flex items-center gap-2">
                <LanguagePicker />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl bg-gray-100 text-gray-500 hover:text-gray-900 font-black text-sm flex items-center justify-center cursor-pointer hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 👤 DYNAMIC USER BANNER: Logged In vs Guest */}
            {user ? (
              <div className="p-4 bg-[#EAF8F2] border-b border-emerald-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#059669] text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                    {user.user_name ? user.user_name[0] : "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider">Hello &amp; Welcome</p>
                    <p className="font-black text-sm text-gray-900 truncate">{user.user_name}</p>
                    <p className="text-xs text-gray-500 font-medium truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[11px] font-black text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 shrink-0 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border-b border-gray-200/80 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Guest Account</p>
                  <p className="font-black text-sm text-gray-900">Welcome to E-COM</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="text-xs font-black bg-[#059669] hover:bg-[#047857] text-white px-3 py-1.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Sign In / Register
                </button>
              </div>
            )}

            {/* Menu Links & Services */}
            <div className="p-4 space-y-5 text-xs font-bold text-gray-700 divide-y divide-gray-100 flex-1">
              
              {/* STORE NAVIGATION */}
              <div className="space-y-1">
                <p className="font-extrabold text-gray-400 uppercase text-[10px] tracking-wider mb-2 px-1">
                  STORE NAVIGATION
                </p>

                <Link
                  href="/search"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 text-gray-900 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Explore Full Store</span>
                  </div>
                  <span className="text-xs text-gray-400">&rsaquo;</span>
                </Link>

                <Link
                  href="/deals"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-orange-50 text-orange-900 transition border border-orange-200/60"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                    <span className="font-extrabold">Hot Store Deals</span>
                  </div>
                  <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">HOT</span>
                </Link>

                {user && (
                  <Link
                    href="/gift-cards"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-amber-50 text-amber-900 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm0 13C10.832 21 2 20 2 12c0-3.5 1.5-6.5 4-8.5M12 21c1.168 0 10-1 10-9 0-3.5-1.5-6.5-4-8.5" />
                      </svg>
                      <span>Gift Cards &amp; Rewards</span>
                    </div>
                    <span className="text-xs text-gray-400">&rsaquo;</span>
                  </Link>
                )}
              </div>

              {/* POPULAR PRODUCT CATEGORIES */}
              <div className="pt-3 space-y-1">
                <p className="font-extrabold text-gray-400 uppercase text-[10px] tracking-wider mb-2 px-1">
                  PRODUCT CATEGORIES
                </p>

                <Link
                  href="/category/mobiles"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 text-gray-800 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📱</span>
                    <span>Smartphones &amp; Mobiles</span>
                  </div>
                  <span className="text-xs text-gray-400">&rsaquo;</span>
                </Link>

                <Link
                  href="/category/laptops"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 text-gray-800 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">💻</span>
                    <span>Laptops &amp; Computers</span>
                  </div>
                  <span className="text-xs text-gray-400">&rsaquo;</span>
                </Link>

                <Link
                  href="/category/electronics"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 text-gray-800 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🎧</span>
                    <span>Electronics &amp; Audio</span>
                  </div>
                  <span className="text-xs text-gray-400">&rsaquo;</span>
                </Link>

                <Link
                  href="/category/fashion"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 text-gray-800 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">👕</span>
                    <span>Fashion &amp; Apparel</span>
                  </div>
                  <span className="text-xs text-gray-400">&rsaquo;</span>
                </Link>

                <Link
                  href="/category/watches"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 text-gray-800 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">⌚</span>
                    <span>Smartwatches &amp; Chronos</span>
                  </div>
                  <span className="text-xs text-gray-400">&rsaquo;</span>
                </Link>
              </div>

              {/* DYNAMIC ACCOUNT SERVICES SECTION */}
              <div className="pt-3 space-y-1">
                <p className="font-extrabold text-gray-400 uppercase text-[10px] tracking-wider mb-2 px-1">
                  ACCOUNT SERVICES
                </p>

                {user ? (
                  <>
                    <Link
                      href="/account?tab=profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 text-gray-800 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>My Profile Information</span>
                      </div>
                      <span className="text-xs text-gray-400">&rsaquo;</span>
                    </Link>

                    <Link
                      href="/account?tab=track-order"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/60 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span>Track Shipment Live</span>
                      </div>
                      <span className="text-[9px] bg-[#059669] text-white px-2 py-0.5 rounded-full font-black">Live</span>
                    </Link>

                    <Link
                      href="/account?tab=returns"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/60 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>24h Return Products Policy</span>
                      </div>
                      <span className="text-[9px] bg-[#059669] text-white px-2 py-0.5 rounded-full font-black">24h Policy</span>
                    </Link>

                    <Link
                      href="/account?tab=wishlist"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 text-gray-800 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>My Wishlist</span>
                      </div>
                      <span className="text-xs text-gray-400">&rsaquo;</span>
                    </Link>
                  </>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-center space-y-2">
                    <p className="text-[11px] text-gray-500 font-medium">
                      Sign in to view active orders, shipment tracking, &amp; wishlist.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="w-full bg-[#059669] hover:bg-[#047857] text-white font-black text-[11px] py-2 rounded-lg transition"
                    >
                      Sign In Now
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Deliver To</span>
                <span className="font-extrabold text-gray-900">India (Pincode: 474001)</span>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Login Modal for Guest User Sign-In Trigger */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
