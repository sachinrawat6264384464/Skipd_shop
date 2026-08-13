"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

interface BuyNowButtonProps {
  productHandle?: string;
  productTitle?: string;
  className?: string;
  children?: React.ReactNode;
  mode?: "buy" | "cart";
}

export function BuyNowButton({
  productHandle,
  productTitle,
  className = "bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-3 rounded-xl transition text-center flex items-center justify-center gap-1 shadow-xs cursor-pointer",
  children = "⚡ Buy Now",
  mode = "buy"
}: BuyNowButtonProps) {
  const router = useRouter();
  const { requireAuth } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    requireAuth(() => {
      if (mode === "buy") {
        const query = productHandle ? `?product=${encodeURIComponent(productHandle)}` : "";
        router.push(`/checkout${query}`);
      } else {
        router.push("/cart");
      }
    });
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
