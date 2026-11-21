import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("home");

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold text-brand-900">{t("title")}</h1>
      <p className="mt-2 text-ink-muted">{t("body")}</p>
    </main>
  );
}
