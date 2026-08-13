"use client";

import { useState, useEffect } from "react";

export interface LanguageOption {
  code: string; // "en" | "fr" | "es" | "nl" | "hi"
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

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export function LanguagePicker() {
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Read saved language from cookie / localStorage
    const saved = localStorage.getItem("skipd_lang_code") || "en";
    setSelectedLang(saved);

    // Initialize Google Translate Element Script once
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,fr,es,nl,hi",
              autoDisplay: false,
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
            },
            "google_translate_element"
          );
        }
      };
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    setSelectedLang(langCode);
    localStorage.setItem("skipd_lang_code", langCode);

    // Set Google Translate cookie format: /auto/langCode
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/en/${langCode}; path=/`;

    // Attempt to update the Google Translate select dropdown if rendered
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
    }

    // Force page translation refresh if needed
    window.location.reload();
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === selectedLang) ?? LANGUAGES[0]!;

  return (
    <div className="relative inline-block text-left z-40">
      {/* Hidden Google Translate Element Container */}
      <div id="google_translate_element" className="hidden" />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
        title="Select Platform Language (Real-time Translator)"
      >
        <span className="text-sm">{currentLangObj.flag}</span>
        <span className="font-extrabold text-[11px] uppercase tracking-wider">{currentLangObj.code}</span>
        <span className="text-[10px] text-gray-400 font-bold">▼</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <p className="px-3 py-1 text-[10px] font-black text-gray-400 uppercase tracking-wider">
              🌐 Real-Time Translator
            </p>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                  selectedLang === lang.code
                    ? "bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200"
                    : "text-gray-700 hover:bg-gray-100 font-semibold"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {selectedLang === lang.code && <span className="text-emerald-600 font-black">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
