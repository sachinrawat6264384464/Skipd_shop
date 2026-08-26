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

// Active guest memory cache (cleared automatically on page refresh)
let activeGuestMemoryCart: any[] = [];
let isGuestInitialLoadDone = false;

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

// 🛒 Get Cart Store: Logged-in users get persistent cart; Guests get transient session cart that resets on F5 refresh
export function getCartStore(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const loggedIn = isUserLoggedIn();
    if (!loggedIn) {
      // 🛑 Guest User Rule: On initial page reload/refresh, guest cart resets to 0 items!
      if (!isGuestInitialLoadDone) {
        isGuestInitialLoadDone = true;
        activeGuestMemoryCart = [];
        try {
          sessionStorage.removeItem("ecom_guest_session_cart");
          localStorage.removeItem("ecom_cart_guest");
        } catch {}
        return [];
      }
      return activeGuestMemoryCart;
    }

    // Logged-in Customer: Read persistent cart from localStorage
    const cartKey = getUserCartKey();
    const saved = localStorage.getItem(cartKey);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

// 🛒 Save Cart Store: Logged-in users save to localStorage; Guests save only in active memory (erased on refresh)
export function saveCartStore(items: any[]): void {
  if (typeof window === "undefined") return;
  try {
    const loggedIn = isUserLoggedIn();
    if (!loggedIn) {
      activeGuestMemoryCart = items;
      isGuestInitialLoadDone = true;
      try {
        sessionStorage.setItem("ecom_guest_session_cart", JSON.stringify(items));
      } catch {}
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
