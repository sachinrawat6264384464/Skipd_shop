"use client";

import { useState } from "react";
import { Product } from "lib/api";
import { getCartStore, saveCartStore } from "lib/utils";
import { toast } from "sonner";

export function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const existing = getCartStore();
    const image = (product.images && product.images[0]) || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";
    const itemToAdd = {
      id: product.id,
      handle: product.handle || String(product.id),
      title: product.title,
      price: product.price,
      quantity: 1,
      image: image
    };

    const idx = existing.findIndex((i: any) => String(i.id) === String(product.id));
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
      toast.success(`🛒 Added ${product.title} to cart!`, {
        description: "Click cart icon in navbar to review or checkout.",
        duration: 2500
      });
    } catch (err) {}

    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
        added
          ? "bg-emerald-700 text-white"
          : "bg-emerald-600 hover:bg-emerald-700 text-white"
      }`}
    >
      <span>{added ? "✓ Added to Cart" : "🛒 Add to Cart"}</span>
    </button>
  );
}
