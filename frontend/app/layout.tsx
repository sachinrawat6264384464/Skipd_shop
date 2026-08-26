import { CartProvider } from "components/cart/cart-context";
import { Navbar } from "components/layout/navbar";
import { WelcomeToast } from "components/welcome-toast";
import { GeistSans } from "geist/font/sans";
import { getCart } from "lib/shopify";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import { baseUrl } from "lib/utils";

const { SITE_NAME } = process.env;

const siteBaseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://skipd-shop.vercel.app";

export const metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: {
    default: "E-COM Commerce | Next-Gen E-Commerce & Personal Tech",
    template: "%s | E-COM Commerce",
  },
  description: "Upgrade your daily setup with 165FPS gaming phones, studio ANC headphones, 4K Smart TVs & smart wearables on E-COM Commerce.",
  robots: {
    follow: true,
    index: true,
  },
  openGraph: {
    title: "E-COM Commerce | Next-Gen E-Commerce & Personal Tech",
    description: "Upgrade your daily setup with 165FPS gaming phones, studio ANC headphones & smart wearables with 24-hour express delivery.",
    url: "https://skipd-shop.vercel.app",
    siteName: "E-COM Commerce",
    images: [
      {
        url: "https://skipd-shop.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "E-COM Commerce Storefront Preview"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "E-COM Commerce | Next-Gen E-Commerce & Personal Tech",
    description: "Upgrade your daily setup with studio ANC headphones, gaming phones & smart wearables on E-COM Commerce.",
    images: ["https://skipd-shop.vercel.app/og-image.png"]
  }
};

import { AuthProvider } from "components/auth/auth-provider";
import { LanguageProvider } from "components/language/language-context";
import { WishlistProvider } from "components/wishlist/wishlist-context";

import { NavbarWrapper } from "components/layout/navbar/navbar-wrapper";
import { ClearLegacyStorage } from "components/layout/clear-legacy-storage";
import { EmailToastListener } from "components/email/email-toast-listener";
import FloatingChatbot from "components/chatbot/FloatingChatbot";
import { AbandonedReminderModal } from "components/modals/AbandonedReminderModal";
import { SocialProofToast } from "components/social/social-proof-toast";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Don't await the fetch, pass the Promise to the context provider
  const cart = getCart();

  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white" suppressHydrationWarning>
        <ClearLegacyStorage />
        <LanguageProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider cartPromise={cart}>
                <NavbarWrapper>
                  <Navbar />
                </NavbarWrapper>
                <main>
                  {children}
                  <Toaster closeButton />
                  <WelcomeToast />
                  <EmailToastListener />
                  <FloatingChatbot />
                  <AbandonedReminderModal />
                  <SocialProofToast />
                </main>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
