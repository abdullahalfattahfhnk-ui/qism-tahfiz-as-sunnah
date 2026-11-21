import { useTranslations } from "next-intl";

/** Marks any section that renders demo data instead of database data. */
export function DemoBadge() {
  const t = useTranslations("demo");
  return (
    <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800">
      {t("badge")}
    </span>
  );
}
