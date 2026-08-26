"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { getUserCartKey, getCartStore, saveCartStore } from "lib/utils";
import { toast } from "sonner";

interface BuyNowButtonProps {
  productHandle?: string;
  productTitle?: string;
  productObj?: any;
  className?: string;
  children?: React.ReactNode;
  mode?: "buy" | "cart";
  disabled?: boolean;
}

export function BuyNowButton({
  productHandle,
  productTitle,
  productObj,
  className = "bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-3 rounded-xl transition text-center flex items-center justify-center gap-1 shadow-xs cursor-pointer",
  children = "⚡ Buy Now",
  mode = "buy",
  disabled = false
}: BuyNowButtonProps) {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const [added, setAdded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    const handleStr = productObj?.handle || productHandle || (productObj?.title ? productObj.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "product");
    const titleStr = productObj?.title || productTitle || (productHandle ? productHandle.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Store Item");
    const idVal = productObj?.id !== undefined ? productObj.id : (productObj?.handle || productHandle || handleStr);

    const itemToAdd = {
      id: idVal,
      handle: handleStr,
      title: titleStr,
      price: Number(productObj?.price || 999),
      quantity: 1,
      image: (productObj?.images && productObj?.images[0]) || productObj?.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
    };

    if (mode === "buy") {
      requireAuth(() => {
        sessionStorage.setItem("ecom_buy_now_item", JSON.stringify([itemToAdd]));
        router.push("/checkout?buyNow=true");
      });
    } else {
      // Cart mode: allow guest browsing with auto-reset on page refresh
      const existing = getCartStore();
      const idx = existing.findIndex((i: any) => {
        if (i.id != null && itemToAdd.id != null && String(i.id) === String(itemToAdd.id)) return true;
        if (i.handle && itemToAdd.handle && i.handle !== "product" && i.handle === itemToAdd.handle) return true;
        if (i.title && itemToAdd.title && i.title !== "Store Item" && i.title !== "Product" && i.title === itemToAdd.title) return true;
        return false;
      });

      let updated;
      if (idx > -1) {
        existing[idx].quantity = (existing[idx].quantity || 1) + 1;
        updated = [...existing];
      } else {
        updated = [...existing, itemToAdd];
      }

      saveCartStore(updated);
      setAdded(true);

      try {
        toast.success(`🛒 Added ${itemToAdd.title} to your cart!`, {
          description: "Click cart icon in navbar to review or checkout.",
          duration: 3000
        });
      } catch (err) {}

      setTimeout(() => setAdded(false), 2500);
    }
  };

  return (
    <button disabled={disabled} onClick={disabled ? undefined : handleClick} className={className}>
      {added ? "✓ Added" : children}
    </button>
  );
}

