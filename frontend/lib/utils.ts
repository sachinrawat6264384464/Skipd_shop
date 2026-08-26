import { ReadonlyURLSearchParams } from "next/navigation";

export const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const createUrl = (
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams,
) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const ensureStartsWith = (stringToCheck: string, startsWith: string) =>
  stringToCheck.startsWith(startsWith)
    ? stringToCheck
    : `${startsWith}${stringToCheck}`;

export const validateEnvironmentVariables = () => {
  const requiredEnvironmentVariables = [
    "SHOPIFY_STORE_DOMAIN",
    "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
  ];
  const missingEnvironmentVariables = [] as string[];

  requiredEnvironmentVariables.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingEnvironmentVariables.push(envVar);
    }
  });

  if (missingEnvironmentVariables.length) {
    throw new Error(
      `The following environment variables are missing. Your site will not work without them. Read more: https://vercel.com/docs/integrations/shopify#configure-environment-variables\n\n${missingEnvironmentVariables.join(
        "\n",
      )}\n`,
    );
  }

  if (
    process.env.SHOPIFY_STORE_DOMAIN?.includes("[") ||
    process.env.SHOPIFY_STORE_DOMAIN?.includes("]")
  ) {
    throw new Error(
      "Your `SHOPIFY_STORE_DOMAIN` environment variable includes brackets (ie. `[` and / or `]`). Your site will not work with them there. Please remove them.",
    );
  }
};

// 🔒 Check if user is currently logged in
export function isUserLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const userStr = localStorage.getItem("ecom_user");
    const tokenStr = localStorage.getItem("ecom_token");
    return !!(userStr || tokenStr);
  } catch {
    return false;
  }
}

// 🔒 1. User Cart Storage Key (Scoped per User Account)
export function getUserCartKey(): string {
  if (typeof window === "undefined") return "ecom_cart_guest";
  try {
    const userStr = localStorage.getItem("ecom_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const identifier = user.email || user.phone || user.user_name;
      if (identifier) {
        return `ecom_cart_${identifier.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      }
    }
  } catch (e) {}
  return "ecom_cart_guest";
}

// 🛒 Get Cart Store: Persistent cart with seamless Guest-to-User Merge on Login
export function getCartStore(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const loggedIn = isUserLoggedIn();
    const guestCartKey = "ecom_cart_guest";

    if (!loggedIn) {
      const savedGuest = localStorage.getItem(guestCartKey) || sessionStorage.getItem("ecom_guest_session_cart");
      return savedGuest ? JSON.parse(savedGuest) : [];
    }

    // Logged-in Customer: Read persistent cart from localStorage
    const cartKey = getUserCartKey();
    let userCart: any[] = [];
    const savedUserCart = localStorage.getItem(cartKey);
    if (savedUserCart) {
      try {
        userCart = JSON.parse(savedUserCart);
      } catch {}
    }

    // Check if there is an unmerged guest cart in storage
    const savedGuest = localStorage.getItem(guestCartKey) || sessionStorage.getItem("ecom_guest_session_cart");
    if (savedGuest) {
      try {
        const guestItems = JSON.parse(savedGuest);
        if (Array.isArray(guestItems) && guestItems.length > 0) {
          // Merge guest items into user cart
          const mergedMap = new Map<string, any>();
          userCart.forEach(item => {
            const key = item.id || item.handle || item.title;
            mergedMap.set(String(key), item);
          });

          guestItems.forEach(gItem => {
            const key = gItem.id || gItem.handle || gItem.title;
            const keyStr = String(key);
            if (mergedMap.has(keyStr)) {
              const existing = mergedMap.get(keyStr);
              existing.quantity = (existing.quantity || 1) + (gItem.quantity || 1);
            } else {
              mergedMap.set(keyStr, gItem);
            }
          });

          userCart = Array.from(mergedMap.values());
          localStorage.setItem(cartKey, JSON.stringify(userCart));

          // Clear guest cart after successful merge
          localStorage.removeItem(guestCartKey);
          sessionStorage.removeItem("ecom_guest_session_cart");
        }
      } catch (e) {}
    }

    return userCart;
  } catch (e) {
    return [];
  }
}

// 🛒 Save Cart Store: Persists cart for both guest and logged in users
export function saveCartStore(items: any[]): void {
  if (typeof window === "undefined") return;
  try {
    const loggedIn = isUserLoggedIn();
    if (!loggedIn) {
      localStorage.setItem("ecom_cart_guest", JSON.stringify(items));
      sessionStorage.setItem("ecom_guest_session_cart", JSON.stringify(items));
    } else {
      const cartKey = getUserCartKey();
      localStorage.setItem(cartKey, JSON.stringify(items));
    }
  } catch (e) {}

  window.dispatchEvent(new Event("ecom_cart_updated"));
  window.dispatchEvent(new Event("ecom_cart_changed"));
}

// 🔒 2. User Wishlist Storage Key (Scoped per User Account)
export function getUserWishlistKey(): string {
  if (typeof window === "undefined") return "ecom_wishlist_guest";
  try {
    const userStr = localStorage.getItem("ecom_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const identifier = user.email || user.phone || user.user_name;
      if (identifier) {
        return `ecom_wishlist_${identifier.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      }
    }
  } catch (e) {}
  return "ecom_wishlist_guest";
}

// 🔒 3. User Orders Storage Key (Scoped per User Account)
export function getUserOrdersKey(): string {
  if (typeof window === "undefined") return "ecom_orders_guest";
  try {
    const userStr = localStorage.getItem("ecom_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const identifier = user.email || user.phone || user.user_name;
      if (identifier) {
        return `ecom_orders_${identifier.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      }
    }
  } catch (e) {}
  return "ecom_orders_guest";
}

// 🔒 4. User Addresses Storage Key (Scoped per User Account)
export function getUserAddressesKey(): string {
  if (typeof window === "undefined") return "ecom_addresses_guest";
  try {
    const userStr = localStorage.getItem("ecom_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const identifier = user.email || user.phone || user.user_name;
      if (identifier) {
        return `ecom_addresses_${identifier.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      }
    }
  } catch (e) {}
  return "ecom_addresses_guest";
}

// 🔒 5. User Gift Card Balance Storage Key (Scoped per User Account)
export function getUserGiftBalanceKey(): string {
  if (typeof window === "undefined") return "ecom_gift_balance_guest";
  try {
    const userStr = localStorage.getItem("ecom_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const identifier = user.email || user.phone || user.user_name;
      if (identifier) {
        return `ecom_gift_balance_${identifier.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      }
    }
  } catch (e) {}
  return "ecom_gift_balance_guest";
}

// 🔒 6. User Wallet Balance Storage Key (Scoped per User Account)
export function getUserWalletBalanceKey(): string {
  if (typeof window === "undefined") return "ecom_wallet_balance_guest";
  try {
    const userStr = localStorage.getItem("ecom_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const identifier = user.email || user.phone || user.user_name;
      if (identifier) {
        return `ecom_wallet_balance_${identifier.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      }
    }
  } catch (e) {}
  return "ecom_wallet_balance_guest";
}

// 🔒 7. User Saved Cards Storage Key (Scoped per User Account)
export function getUserSavedCardsKey(): string {
  if (typeof window === "undefined") return "ecom_saved_cards_guest";
  try {
    const userStr = localStorage.getItem("ecom_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const identifier = user.email || user.phone || user.user_name;
      if (identifier) {
        return `ecom_saved_cards_${identifier.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      }
    }
  } catch (e) {}
  return "ecom_saved_cards_guest";
}
