"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import en from "@/locales/en/common.json";
import tr from "@/locales/tr/common.json";

export const supportedLocales = ["tr", "en"] as const;

export type Locale = (typeof supportedLocales)[number];

type Dictionary = typeof en;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  list: <T = unknown>(key: string) => T;
  dictionary: Dictionary;
};

const dictionaries: Record<Locale, Dictionary> = {
  tr,
  en
};

const localeStorageKey = "caplexy.interfaceLocale";

export const languageOptions = [
  { code: "tr", nativeName: "Türkçe" },
  { code: "en", nativeName: "English" }
] satisfies Array<{ code: Locale; nativeName: string }>;

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");
  const [isReady, setIsReady] = useState(false);
  const dictionary = dictionaries[locale];

  useEffect(() => {
    const savedLocale = getSavedLocale();
    const detectedLocale = savedLocale ?? detectBrowserLocale();
    setLocaleState(detectedLocale);
    setIsReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = dictionary.meta.title;

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );

    if (description) {
      description.content = dictionary.meta.description;
    }
  }, [dictionary.meta.description, dictionary.meta.title, locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(localeStorageKey, nextLocale);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      dictionary,
      t: (key) => readTranslation(dictionary, key, ""),
      list: <T,>(key: string) => readTranslation<T>(dictionary, key, [] as T)
    }),
    [dictionary, locale, setLocale]
  );

  return (
    <I18nContext.Provider value={value}>
      <div
        className={`transition-opacity duration-300 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}

function getSavedLocale(): Locale | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(localeStorageKey);
  return isSupportedLocale(stored) ? stored : null;
}

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") {
    return "tr";
  }

  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const browserLanguage of browserLanguages) {
    const baseLanguage = browserLanguage.toLowerCase().split("-")[0];

    if (isSupportedLocale(baseLanguage)) {
      return baseLanguage;
    }
  }

  return "tr";
}

function isSupportedLocale(value: string | null | undefined): value is Locale {
  return supportedLocales.includes(value as Locale);
}

function readTranslation<T>(dictionary: Dictionary, key: string, fallback: T): T {
  const value = key
    .split(".")
    .reduce<unknown>((current, segment) => {
      if (current && typeof current === "object" && segment in current) {
        return (current as Record<string, unknown>)[segment];
      }

      return undefined;
    }, dictionary);

  return (value ?? fallback) as T;
}
