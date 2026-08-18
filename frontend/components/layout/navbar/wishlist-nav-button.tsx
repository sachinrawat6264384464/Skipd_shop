"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWishlist } from "components/wishlist/wishlist-context";

export function WishlistNavButton() {
  const [wishlistCount, setWishlistCount] = useState(0);
  const { wishlist } = useWishlist();

  useEffect(() => {
    setWishlistCount(wishlist.length);
  }, [wishlist]);

  return (
    <Link
      href="/account?tab=wishlist"
      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition text-base relative cursor-pointer ${
        wishlistCount > 0
          ? "bg-red-50 border-red-200 text-red-500 shadow-xs"
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
