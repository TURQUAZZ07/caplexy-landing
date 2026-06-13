"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { languageOptions, useI18n, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const selectedLanguage =
    languageOptions.find((language) => language.code === locale) ??
    languageOptions[0];

  function selectLanguage(nextLocale: Locale) {
    setLocale(nextLocale);
    setIsOpen(false);
  }

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label={t("language.label")}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 min-w-[132px] items-center justify-between gap-2 rounded-lg border border-white/18 bg-white/12 px-3 text-sm font-semibold text-white outline-none backdrop-blur transition hover:bg-white/18 focus:border-signal focus:ring-2 focus:ring-signal/40"
      >
        <span className="whitespace-nowrap">🌐 {selectedLanguage.nativeName}</span>
        <ChevronDown
          className={`h-4 w-4 text-white/74 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-full overflow-hidden rounded-lg border border-white/18 bg-ink/95 p-1 shadow-soft backdrop-blur">
          {languageOptions.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => selectLanguage(language.code)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
                language.code === locale
                  ? "bg-white text-ink"
                  : "text-white hover:bg-white/12"
              }`}
            >
              {language.nativeName}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
