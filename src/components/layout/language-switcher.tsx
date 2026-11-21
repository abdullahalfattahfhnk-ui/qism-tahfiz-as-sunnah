"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("language");
  const current = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function change(locale: Locale) {
    if (locale === current) return;
    startTransition(() => router.replace(pathname, { locale }));
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "flex items-center gap-1 rounded-lg border border-line bg-surface p-1",
        pending && "opacity-70",
      )}
    >
      {!compact && (
        <Languages className="mx-1.5 size-4 text-ink-muted" aria-hidden />
      )}
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          onClick={() => change(locale)}
          aria-pressed={locale === current}
          className={cn(
            "rounded-md px-2.5 py-1 text-sm transition-colors",
            compact && "px-2",
            locale === current
              ? "bg-brand-700 text-white"
              : "text-ink-muted hover:bg-brand-50 hover:text-brand-800",
          )}
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  );
}
