"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { getUserCartKey } from "lib/utils";
import { toast } from "sonner";

interface BuyNowButtonProps {
  productHandle?: string;
  productTitle?: string;
  productObj?: any;
  className?: string;
  children?: React.ReactNode;
  mode?: "buy" | "cart";
}

export function BuyNowButton({
  productHandle,
  productTitle,
  productObj,
  className = "bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-3 rounded-xl transition text-center flex items-center justify-center gap-1 shadow-xs cursor-pointer",
  children = "⚡ Buy Now",
  mode = "buy"
}: BuyNowButtonProps) {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const [added, setAdded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    requireAuth(() => {
      const cartKey = getUserCartKey();
      const existing = JSON.parse(localStorage.getItem(cartKey) || "[]");

      const itemToAdd = productObj ? {
        id: productObj.id || Date.now(),
        handle: productObj.handle || productHandle || "product",
        title: productObj.title || productTitle || "Product",
        price: Number(productObj.price || 999),
        quantity: 1,
        image: (productObj.images && productObj.images[0]) || productObj.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
      } : {
        id: Date.now(),
        handle: productHandle || "product",
        title: productTitle || "Product",
        price: 999,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
      };

      if (mode === "buy") {
        sessionStorage.setItem("skipd_buy_now_item", JSON.stringify([itemToAdd]));
        router.push("/checkout?buyNow=true");
      } else {
        const idx = existing.findIndex((i: any) => i.id === itemToAdd.id || (i.handle && i.handle === itemToAdd.handle));
        let updated;
        if (idx > -1) {
          existing[idx].quantity += 1;
          updated = [...existing];
        } else {
          updated = [...existing, itemToAdd];
        }

        localStorage.setItem(cartKey, JSON.stringify(updated));
        window.dispatchEvent(new Event("skipd_cart_updated"));
        window.dispatchEvent(new Event("skipd_cart_changed"));
        setAdded(true);

        try {
          toast.success(`🛒 Added ${itemToAdd.title} to your cart!`, {
            description: "Click cart icon in navbar to review or checkout.",
            duration: 3000
          });
        } catch (err) {}

        setTimeout(() => setAdded(false), 2500);
      }
    });
  };

  return (
    <button onClick={handleClick} className={className}>
      {added ? "✓ Added" : children}
    </button>
  );
}

