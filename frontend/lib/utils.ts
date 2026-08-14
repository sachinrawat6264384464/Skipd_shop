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

// 🔒 1. User Cart Storage Key (Scoped per User Account)
export function getUserCartKey(): string {
  if (typeof window === "undefined") return "skipd_cart_guest";
  try {
    const userStr = localStorage.getItem("skipd_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const identifier = user.email || user.phone || user.user_name;
      if (identifier) {
        return `skipd_cart_${identifier.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      }
    }
  } catch (e) {}
  return "skipd_cart_guest";
}

// 🔒 2. User Wishlist Storage Key (Scoped per User Account)
export function getUserWishlistKey(): string {
  if (typeof window === "undefined") return "skipd_wishlist_guest";
  try {
    const userStr = localStorage.getItem("skipd_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const identifier = user.email || user.phone || user.user_name;
      if (identifier) {
        return `skipd_wishlist_${identifier.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      }
    }
  } catch (e) {}
  return "skipd_wishlist_guest";
}

// 🔒 3. User Orders Storage Key (Scoped per User Account)
export function getUserOrdersKey(): string {
  if (typeof window === "undefined") return "skipd_orders_guest";
  try {
    const userStr = localStorage.getItem("skipd_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const identifier = user.email || user.phone || user.user_name;
      if (identifier) {
        return `skipd_orders_${identifier.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      }
    }
  } catch (e) {}
  return "skipd_orders_guest";
}

// 🔒 4. User Addresses Storage Key (Scoped per User Account)
export function getUserAddressesKey(): string {
  if (typeof window === "undefined") return "skipd_addresses_guest";
  try {
    const userStr = localStorage.getItem("skipd_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const identifier = user.email || user.phone || user.user_name;
      if (identifier) {
        return `skipd_addresses_${identifier.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      }
    }
  } catch (e) {}
  return "skipd_addresses_guest";
}
