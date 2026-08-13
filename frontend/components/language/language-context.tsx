"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type SupportedLanguage = "en" | "fr" | "es" | "nl" | "hi";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français (French)", flag: "🇫🇷" },
  { code: "es", name: "Español (Spanish)", flag: "🇪🇸" },
  { code: "nl", name: "Nederlands (Dutch)", flag: "🇳🇱" },
  { code: "hi", name: "हिंदी (Hindi)", flag: "🇮🇳" }
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    categories: "Categories",
    all_categories: "All Categories",
    explore_store: "Explore Store",
    track_order: "Track Order",
    deals: "Deals",
    gift_cards: "Gift Cards",
    new_arrivals: "New Arrivals",
    search_placeholder: "Search for products, brands & more...",
    sign_in: "Sign In / Register",
    hello: "Hello",
    my_account: "My Profile & Account",
    my_orders: "My Orders & Tracking",
    my_wishlist: "My Wishlist",
    supercoins: "SuperCoins & Rewards",
    logout: "Sign Out / Logout",
    cart_items: "Cart Items",
    in_your_cart: "Items in your cart",
    subtotal: "Subtotal",
    view_cart: "View Full Cart Page",
    proceed_checkout: "Proceed to Checkout",
    add_to_cart: "Add to Cart",
    buy_now: "Buy Now",
    remove_all: "Remove all",
    order_summary: "Order Summary",
    free_delivery: "Free Delivery",
    deliver_to: "Deliver to",
    sign_in_required: "Sign In Required",
    sign_in_msg: "Please sign in to access your profile, order history, and wishlist.",
  },
  fr: {
    categories: "Catégories",
    all_categories: "Toutes les catégories",
    explore_store: "Explorer la boutique",
    track_order: "Suivre la commande",
    deals: "Offres",
    gift_cards: "Cartes cadeaux",
    new_arrivals: "Nouveautés",
    search_placeholder: "Rechercher des produits, marques...",
    sign_in: "Se connecter / S'inscrire",
    hello: "Bonjour",
    my_account: "Mon profil et compte",
    my_orders: "Mes commandes et suivi",
    my_wishlist: "Ma liste d'envies",
    supercoins: "SuperCoins et récompenses",
    logout: "Se déconnecter",
    cart_items: "Articles du panier",
    in_your_cart: "Articles dans votre panier",
    subtotal: "Sous-total",
    view_cart: "Voir le panier complet",
    proceed_checkout: "Passer à la caisse",
    add_to_cart: "Ajouter au panier",
    buy_now: "Acheter maintenant",
    remove_all: "Tout supprimer",
    order_summary: "Récapitulatif de la commande",
    free_delivery: "Livraison gratuite",
    deliver_to: "Librer à",
    sign_in_required: "Connexion requise",
    sign_in_msg: "Veuillez vous connecter pour accéder à votre profil, vos commandes et votre liste d'envies.",
  },
  es: {
    categories: "Categorías",
    all_categories: "Todas las categorías",
    explore_store: "Explorar tienda",
    track_order: "Rastrear pedido",
    deals: "Ofertas",
    gift_cards: "Tarjetas de regalo",
    new_arrivals: "Novedades",
    search_placeholder: "Buscar productos, marcas...",
    sign_in: "Iniciar sesión / Registrarse",
    hello: "Hola",
    my_account: "Mi perfil y cuenta",
    my_orders: "Mis pedidos y seguimiento",
    my_wishlist: "Mi lista de deseos",
    supercoins: "SuperCoins y recompensas",
    logout: "Cerrar sesión",
    cart_items: "Artículos del carrito",
    in_your_cart: "Artículos en tu carrito",
    subtotal: "Subtotal",
    view_cart: "Ver carrito completo",
    proceed_checkout: "Proceder al pago",
    add_to_cart: "Añadir al carrito",
    buy_now: "Comprar ahora",
    remove_all: "Eliminar todo",
    order_summary: "Resumen del pedido",
    free_delivery: "Envío gratis",
    deliver_to: "Enviar a",
    sign_in_required: "Inicio de sesión requerido",
    sign_in_msg: "Inicia sesión para acceder a tu perfil, pedidos y lista de deseos.",
  },
  nl: {
    categories: "Categorieën",
    all_categories: "Alle categorieën",
    explore_store: "Winkel verkennen",
    track_order: "Bestelling volgen",
    deals: "Aanbiedingen",
    gift_cards: "Cadeaubonnen",
    new_arrivals: "Nieuwe artikelen",
    search_placeholder: "Zoek naar producten, merken...",
    sign_in: "Inloggen / Registreren",
    hello: "Hallo",
    my_account: "Mijn profiel & account",
    my_orders: "Mijn bestellingen & tracking",
    my_wishlist: "Mijn verlangenlijst",
    supercoins: "SuperCoins & beloningen",
    logout: "Uitloggen",
    cart_items: "Winkelwagen artikelen",
    in_your_cart: "Artikelen in uw winkelwagen",
    subtotal: "Subtotaal",
    view_cart: "Bekijk volledige winkelwagen",
    proceed_checkout: "Ga naar afrekenen",
    add_to_cart: "Toevoegen aan winkelwagen",
    buy_now: "Nu kopen",
    remove_all: "Alles verwijderen",
    order_summary: "Besteloverzicht",
    free_delivery: "Gratis verzending",
    deliver_to: "Bezorgen in",
    sign_in_required: "Inloggen vereist",
    sign_in_msg: "Meld u aan om toegang te krijgen tot uw profiel, bestellingen en verlangenlijst.",
  },
  hi: {
    categories: "श्रेणियां (Categories)",
    all_categories: "सभी श्रेणियां",
    explore_store: "स्टोर देखें",
    track_order: "ऑर्डर ट्रैक करें",
    deals: "विशेष ऑफर्स",
    gift_cards: "गिफ़्ट कार्ड्स",
    new_arrivals: "नए उत्पाद",
    search_placeholder: "उत्पाद, ब्रांड और श्रेणी खोजें...",
    sign_in: "साइन इन / रजिस्टर",
    hello: "नमस्ते",
    my_account: "मेरी प्रोफ़ाइल और खाता",
    my_orders: "मेरे ऑर्डर और ट्रैकिंग",
    my_wishlist: "मेरी विशलिस्ट",
    supercoins: "सुपरकॉइन्स और रिवॉर्ड्स",
    logout: "साइन आउट / लॉगआउट",
    cart_items: "कार्ट उत्पाद",
    in_your_cart: "आपके कार्ट में उत्पाद",
    subtotal: "कुल राशि",
    view_cart: "पूरा कार्ट देखें",
    proceed_checkout: "चेकआउट के लिए आगे बढ़ें",
    add_to_cart: "कार्ट में जोड़ें",
    buy_now: "अभी खरीदें",
    remove_all: "सभी हटाएं",
    order_summary: "ऑर्डर सारांश",
    free_delivery: "मुफ़्त डिलीवरी",
    deliver_to: "डिलीवरी स्थान",
    sign_in_required: "साइन इन आवश्यक है",
    sign_in_msg: "अपनी प्रोफ़ाइल, ऑर्डर इतिहास और विशलिस्ट देखने के लिए कृपया साइन इन करें।",
  }
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    const saved = localStorage.getItem("skipd_lang") as SupportedLanguage;
    if (saved && TRANSLATIONS[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("skipd_lang", lang);
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: "en" as SupportedLanguage,
      setLanguage: () => {},
      t: (key: string) => TRANSLATIONS["en"]?.[key] || key,
    };
  }
  return context;
}
