import CartModal from "components/cart/modal";
import Link from "next/link";
import { UserAccountDropdown } from "./user-dropdown";
import MobileMenu from "./mobile-menu";
import { WishlistNavButton } from "./wishlist-nav-button";
import { LanguagePicker } from "components/language/language-picker";
import { InstantSearchModal } from "components/search/search-modal";
import { NavLinks } from "./nav-links";

export async function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between shadow-xs transition-all">
      <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto gap-3 sm:gap-6">
        
        {/* Left Section: Mobile Menu, Brand Logo & Dynamic Top Links */}
        <div className="flex items-center gap-3 sm:gap-5 lg:gap-8 shrink-0 min-w-0">
          <MobileMenu />

          <Link href="/" className="flex items-center gap-2.5 text-gray-900 font-black text-xl sm:text-2xl tracking-tight shrink-0 group">
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-md shadow-emerald-500/25 group-hover:scale-105 transition duration-200">
              E
            </span>
            <span className="truncate tracking-tight font-black group-hover:text-emerald-700 transition">E-COM</span>
          </Link>

          <NavLinks />
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
