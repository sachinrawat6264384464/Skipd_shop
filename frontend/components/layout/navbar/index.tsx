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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-2 flex items-center justify-between shadow-2xs">
      <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto gap-2 sm:gap-4">
        
        {/* Left Section: Mobile Drawer Toggle, Brand Logo, Top Links & Delivery Location */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0 min-w-0">
          <MobileMenu />

          <Link href="/" className="flex items-center gap-2 text-gray-900 font-black text-xl sm:text-2xl tracking-tight shrink-0">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm sm:text-base shadow-sm">
              S
            </span>
            <span className="truncate">SKIPD</span>
          </Link>

          <ul className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-semibold text-gray-700 whitespace-nowrap">
            <li className="relative group cursor-pointer">
              <Link href="/search" className="hover:text-black transition flex items-center gap-1 font-bold text-gray-900">
                Categories <span className="text-[10px] text-gray-400">▼</span>
              </Link>

              {/* Hover Categories Dropdown Menu */}
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-150 z-50 text-xs space-y-1">
                <Link href="/search" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-emerald-50 text-emerald-800 font-extrabold">
                  All Categories
                </Link>
                <Link href="/search/tech" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-800 font-semibold">
                  Electronics &amp; Tech
                </Link>
                <Link href="/search/apparel" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-800 font-semibold">
                  Fashion &amp; Apparel
                </Link>
                <Link href="/search/lifestyle" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-800 font-semibold">
                  Lifestyle &amp; Watches
                </Link>
                <Link href="/gift-cards" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-800 font-semibold">
                  Gift Cards &amp; Points
                </Link>
              </div>
            </li>
            <li>
              <Link href="/search" className="hover:text-black transition">
                Explore Store
              </Link>
            </li>

            <li>
              <Link href="/deals" className="text-orange-600 font-extrabold hover:text-orange-700 transition flex items-center gap-1">
                Deals <span className="bg-red-500 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full uppercase">Hot</span>
              </Link>
            </li>
            <li>
              <Link href="/gift-cards" className="hover:text-black transition flex items-center gap-1">
                Gift Cards
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-black transition">
                New Arrivals
              </Link>
            </li>
          </ul>

          {/* 📍 Delivery Location Picker */}
          <DeliveryLocationPicker />
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
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
