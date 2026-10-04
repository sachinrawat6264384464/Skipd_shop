import dynamic from "next/dynamic";
import Link from "next/link";
import { UserAccountDropdown } from "./user-dropdown";
import MobileMenu from "./mobile-menu";
import { WishlistNavButton } from "./wishlist-nav-button";
import { LanguagePicker } from "components/language/language-picker";
import { NavLinks } from "./nav-links";

// Dynamic imports for interactive modals in Server Component for strictly on-demand loading
const CartModal = dynamic(() => import("components/cart/modal"));
const InstantSearchModal = dynamic(() => import("components/search/search-modal").then(m => ({ default: m.InstantSearchModal })));

export async function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-gray-200/80 px-4 sm:px-8 lg:px-12 py-2.5 sm:py-3 shadow-2xs transition-all w-full">
      <div className="flex items-center justify-between w-full max-w-full gap-3 sm:gap-6">
        
        {/* Left Section: Mobile Hamburger Menu, Brand Logo & Top Category Links */}
        <div className="flex items-center gap-3 sm:gap-5 lg:gap-8 shrink-0 min-w-0">
          <MobileMenu />

          <Link href="/" prefetch={false} className="flex items-center shrink-0 group py-0.5">
            <img
              src="/2.png"
              alt="BOTCOM Logo"
              className="h-11 sm:h-13 md:h-15 lg:h-16 max-h-16 w-auto object-contain group-hover:scale-105 transition duration-200"
            />
          </Link>

          <NavLinks />
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
          <InstantSearchModal />
          <div className="hidden md:block">
            <LanguagePicker />
          </div>
          <div className="hidden sm:block">
            <WishlistNavButton />
          </div>
          <CartModal />
          <UserAccountDropdown />
        </div>

      </div>
    </header>
  );
}
