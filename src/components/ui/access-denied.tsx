import { ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * DEMO preview of a blocked page. The real platform enforces access on the
 * server and in Supabase RLS (Step 4), never only in the interface.
 */
export function AccessDenied() {
  const t = useTranslations("shell.access");
  return (
    <div className="mx-auto mt-10 max-w-md rounded-xl border border-line bg-surface p-6 text-center">
      <ShieldAlert className="mx-auto size-8 text-brand-700" aria-hidden />
      <h1 className="mt-3 text-lg font-semibold">{t("title")}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t("body")}</p>
      <Link
        href="/dashboard"
        className="mt-4 inline-block text-sm font-medium text-brand-700 underline underline-offset-4"
      >
        {t("back")}
      </Link>
    </div>
  );
}
