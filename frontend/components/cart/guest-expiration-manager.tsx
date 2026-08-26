"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function GuestExpirationManager() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkGuestExpirations = () => {
      try {
        const token = localStorage.getItem("ecom_token");
        const user = localStorage.getItem("ecom_user");
        const loggedIn = !!(token || user);

        // Only run expiry cleaner for unauthenticated guest users
        if (loggedIn) return;

        const now = Date.now();

        // 1. Clean Guest Cart (2-Minute Expiration)
        const guestCartStr = localStorage.getItem("ecom_cart_guest");
        if (guestCartStr) {
          try {
            const items = JSON.parse(guestCartStr);
            if (Array.isArray(items) && items.length > 0) {
              const validCartItems = items.filter((item: any) => {
                if (!item.expiresAt) return true; // keep permanent items if any
                return now < item.expiresAt;
              });

              if (validCartItems.length < items.length) {
                const expiredCount = items.length - validCartItems.length;
                localStorage.setItem("ecom_cart_guest", JSON.stringify(validCartItems));
                window.dispatchEvent(new Event("ecom_cart_updated"));
                window.dispatchEvent(new Event("ecom_cart_changed"));

                toast.info(`⏰ ${expiredCount} Guest Cart item(s) expired (2-min limit)`, {
                  description: "Please log in to save items to your cart permanently!",
                  duration: 4000
                });
              }
            }
          } catch (e) {}
        }

        // 2. Clean Guest Wishlist (2-Minute Expiration)
        const guestWishlistStr = localStorage.getItem("ecom_wishlist_guest");
        if (guestWishlistStr) {
          try {
            const items = JSON.parse(guestWishlistStr);
            if (Array.isArray(items) && items.length > 0) {
              const validWishlistItems = items.filter((item: any) => {
                if (!item.expiresAt) return true;
                return now < item.expiresAt;
              });

              if (validWishlistItems.length < items.length) {
                const expiredCount = items.length - validWishlistItems.length;
                localStorage.setItem("ecom_wishlist_guest", JSON.stringify(validWishlistItems));
                window.dispatchEvent(new Event("ecom_auth_changed"));

                toast.info(`⏰ ${expiredCount} Guest Wishlist item(s) expired (2-min limit)`, {
                  description: "Please log in to save items to your wishlist permanently!",
                  duration: 4000
                });
              }
            }
          } catch (e) {}
        }
      } catch (err) {
        console.error("Guest expiration check error:", err);
      }
    };

    // Initial check on mount
    checkGuestExpirations();

    // Polling interval every 3 seconds to check for 2-minute expiration
    const intervalId = setInterval(checkGuestExpirations, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
