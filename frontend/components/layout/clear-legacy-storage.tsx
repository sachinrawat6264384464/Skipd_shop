"use client";

import { useEffect } from "react";

export function ClearLegacyStorage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("ecom_custom_products");
        localStorage.removeItem("ecom_updated_products");
        localStorage.removeItem("ecom_deleted_product_ids");
      } catch (e) {}
    }
  }, []);

  return null;
}
