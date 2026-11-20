import { defineRouting } from "next-intl/routing";

export const locales = ["bn", "ar", "en"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "bn",
  // Remembers the chosen language in a cookie.
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
});

/** Arabic is the only right-to-left language for now. */
export const rtlLocales: readonly Locale[] = ["ar"];
export const getDirection = (locale: string): "rtl" | "ltr" =>
  (rtlLocales as readonly string[]).includes(locale) ? "rtl" : "ltr";

/** Names shown in the language switcher, always in their own script. */
export const localeLabels: Record<Locale, string> = {
  bn: "বাংলা",
  ar: "العربية",
  en: "English",
};
