"use client";

import { useState, useEffect } from "react";
import { useTranslation, SupportedLanguage } from "./language-context";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag: string;
  region: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", flag: "🇬🇧", region: "GB" },
  { code: "hi", name: "हिंदी (Hindi)", flag: "🇮🇳", region: "IN" },
  { code: "fr", name: "Français (French)", flag: "🇫🇷", region: "FR" },
  { code: "es", name: "Español (Spanish)", flag: "🇪🇸", region: "ES" },
  { code: "nl", name: "Nederlands (Dutch)", flag: "🇳🇱", region: "NL" }
];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

function getDomainVariants() {
  if (typeof window === "undefined") return [""];
  const host = window.location.hostname;
  const list = [host, `.${host}`, ""];
  const parts = host.split(".");
  if (parts.length > 2) {
    const root = parts.slice(-2).join(".");
    list.push(root, `.${root}`);
  }
  return Array.from(new Set(list));
}

function clearGoogleTranslateCookies() {
  if (typeof window === "undefined") return;
  const domains = getDomainVariants();
  domains.forEach((d) => {
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${d ? `domain=${d};` : ""}`;
    document.cookie = `googtrans=/en/en; path=/; ${d ? `domain=${d};` : ""}`;
  });
}

function setGoogleTranslateCookies(langCode: string) {
  if (typeof window === "undefined") return;
  if (langCode === "en") {
    clearGoogleTranslateCookies();
    return;
  }
  const domains = getDomainVariants();
  domains.forEach((d) => {
    document.cookie = `googtrans=/en/${langCode}; path=/; ${d ? `domain=${d};` : ""}`;
    document.cookie = `googtrans=/auto/${langCode}; path=/; ${d ? `domain=${d};` : ""}`;
  });
}

export function LanguagePicker() {
  const { setLanguage: setContextLang } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("ecom_lang_code") || localStorage.getItem("ecom_lang") || "en") as SupportedLanguage;
    setSelectedLang(saved);
    setContextLang(saved);

    if (saved === "en") {
      clearGoogleTranslateCookies();
    } else {
      setGoogleTranslateCookies(saved);
    }

    // Initialize Google Translate Element Script once
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          try {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: "en",
                includedLanguages: "en,hi,fr,es,nl",
                autoDisplay: false,
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
              },
              "google_translate_element"
            );
          } catch (e) {}
        }
      };
    }
  }, [setContextLang]);

  const changeLanguage = (langCode: SupportedLanguage) => {
    setSelectedLang(langCode);
    setContextLang(langCode);
    localStorage.setItem("ecom_lang_code", langCode);
    localStorage.setItem("ecom_lang", langCode);

    if (langCode === "en") {
      clearGoogleTranslateCookies();
    } else {
      setGoogleTranslateCookies(langCode);
    }

    // Trigger select change event on Google Translate combo element if rendered
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
    }

    // Force refresh to apply Google Translate DOM modifications & cookie sync
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === selectedLang) ?? LANGUAGES[0]!;

  return (
    <div className="relative inline-block text-left z-40">
      {/* Hidden Google Translate Element Container */}
      <div id="google_translate_element" className="hidden" />

      {/* 🌐 Ultra-Professional Language Selector Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-bold text-gray-800 bg-gray-100/90 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200/80 hover:border-emerald-300 px-3.5 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer shadow-2xs group"
        title="Select Store Language"
      >
        <span className="text-sm shrink-0">{currentLangObj.flag}</span>
        <span className="font-black text-[11px] uppercase tracking-wider text-gray-900 group-hover:text-emerald-700">
          {currentLangObj.region} &nbsp;{currentLangObj.code}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 🪟 Sleek Floating Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-2xl border border-gray-200/90 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 flex items-center justify-between border-b border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                🌐 STORE LANGUAGE
              </span>
              <span className="text-[10px] font-bold text-emerald-600">Auto-Sync</span>
            </div>

            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                  selectedLang === lang.code
                    ? "bg-emerald-50 text-emerald-900 font-black border border-emerald-200/80 shadow-2xs"
                    : "text-gray-700 hover:bg-gray-100 font-semibold"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <div>
                    <p className="leading-none">{lang.name}</p>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">{lang.region} • {lang.code}</span>
                  </div>
                </div>
                {selectedLang === lang.code && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
