import { getTranslations, setRequestLocale } from "next-intl/server";
import { LibraryBrowser } from "@/components/library/library-browser";
import { SectionHeader } from "@/components/ui/section-header";
import { DEMO_RESOURCES } from "@/lib/demo/data";

export default async function LibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <SectionHeader level="h1" title={t("nav.library")} demo />
        <p className="mt-2 text-ink-muted">{t("library.description")}</p>
        <p className="mt-1 text-xs text-ink-muted">{t("library.downloadLater")}</p>
      </div>
      <LibraryBrowser resources={DEMO_RESOURCES} />
    </div>
  );
}
