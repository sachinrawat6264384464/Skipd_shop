import CartModal from "components/cart/modal";
import Link from "next/link";
import { Suspense } from "react";
import Search, { SearchSkeleton } from "./search";
import { UserAccountDropdown } from "./user-dropdown";
import { DeliveryLocationPicker } from "./delivery-location";
import MobileMenu from "./mobile-menu";

import { WishlistNavButton } from "./wishlist-nav-button";
import { LanguagePicker } from "components/language/language-picker";
import { InstantSearchModal } from "components/search/search-modal";

export async function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/80 px-3 sm:px-4 lg:px-6 py-2.5 flex items-center justify-between shadow-xs transition-all">
      <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto gap-2 sm:gap-4">
        
        {/* Left Section: Mobile Menu, Brand Logo, Top Links & Location */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0 min-w-0">
          <MobileMenu />

          <Link href="/" className="flex items-center gap-2 text-gray-900 font-black text-xl sm:text-2xl tracking-tight shrink-0 group">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center font-black text-sm sm:text-base shadow-md shadow-emerald-500/20 group-hover:scale-105 transition duration-200">
              S
            </span>
            <span className="truncate tracking-tight font-black group-hover:text-emerald-700 transition">SKIPD</span>
          </Link>

          <ul className="hidden lg:flex items-center gap-2 xl:gap-3 text-xs font-bold text-gray-700 whitespace-nowrap">
            <li className="relative group cursor-pointer">
              <Link href="/search" className="px-3 py-1.5 rounded-xl hover:bg-gray-100/80 transition flex items-center gap-1.5 font-extrabold text-gray-900">
                <span>Categories</span>
                <span className="text-[10px] text-emerald-600 transition group-hover:rotate-180 duration-200">▼</span>
              </Link>

              {/* Hover Categories Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl border border-gray-200/90 rounded-2xl shadow-2xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-200 z-50 text-xs space-y-1.5">
                <div className="text-[10px] font-black uppercase text-gray-400 px-3 py-1 tracking-wider border-b border-gray-100">
                  Shop By Category
                </div>
                <Link href="/search" className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50/80 text-emerald-900 font-black hover:bg-emerald-100/80 transition">
                  <span>🛍️</span> All Categories &amp; Catalog
                </Link>
                <Link href="/search/tech" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-800 font-bold transition">
                  <span>🎧</span> Electronics &amp; Gadgets
                </Link>
                <Link href="/search/apparel" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-800 font-bold transition">
                  <span>👕</span> Fashion &amp; Clothing
                </Link>
                <Link href="/search/lifestyle" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-800 font-bold transition">
                  <span>⌚</span> Watches &amp; Accessories
                </Link>
                <Link href="/gift-cards" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-900 font-extrabold transition border-t border-gray-100 mt-1 pt-2">
                  <span>🎁</span> Gift Cards &amp; Rewards
                </Link>
              </div>
            </li>

            <li>
              <Link href="/search" className="px-3 py-1.5 rounded-xl hover:bg-gray-100/80 hover:text-black transition">
                Explore Store
              </Link>
            </li>

            <li>
              <Link href="/deals" className="px-3 py-1.5 rounded-xl text-emerald-700 font-black hover:bg-emerald-50 transition flex items-center gap-1.5">
                <span>Deals</span>
                <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs animate-pulse">
                  HOT
                </span>
              </Link>
            </li>

            <li>
              <Link href="/gift-cards" className="px-3 py-1.5 rounded-xl hover:bg-gray-100/80 hover:text-black transition flex items-center gap-1">
                <span>🎁</span> Gift Cards
              </Link>
            </li>

            <li>
              <Link href="/search" className="px-3 py-1.5 rounded-xl hover:bg-gray-100/80 hover:text-black transition">
                New Arrivals
              </Link>
            </li>
          </ul>

          {/* 📍 Delivery Location Picker */}
          <DeliveryLocationPicker />
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <InstantSearchModal />
          <LanguagePicker />
          <UserAccountDropdown />
          <div className="hidden sm:block">
            <WishlistNavButton />
          </div>
          <CartModal />
        </div>

      </div>
    </nav>
  );
}
