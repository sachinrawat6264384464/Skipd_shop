"use client";

import { useEffect } from "react";

export function ClearLegacyStorage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("skipd_custom_products");
        localStorage.removeItem("skipd_updated_products");
        localStorage.removeItem("skipd_deleted_product_ids");
      } catch (e) {}
    }
  }, []);

  return null;
}
