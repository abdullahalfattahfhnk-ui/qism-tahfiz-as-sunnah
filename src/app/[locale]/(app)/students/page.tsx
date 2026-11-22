import { UserPlus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccessDenied } from "@/components/ui/access-denied";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { DEMO_STUDENTS } from "@/lib/demo/data";
import { requireViewer } from "@/lib/auth/session";

export default async function StudentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { role } = await requireViewer(locale);
  if (role === "student") return <AccessDenied />;
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <SectionHeader
          level="h1"
          title={t("nav.students")}
          demo
          action={
            <Button variant="secondary" disabled>
              <UserPlus className="size-4" aria-hidden />
              {t("students.add")}
            </Button>
          }
        />
        <p className="mt-2 text-ink-muted">{t("students.description")}</p>
        <p className="mt-1 text-xs text-ink-muted">{t("students.availableLater")}</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[420px] text-sm">
          <thead className="border-b border-line bg-canvas text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-3 text-start font-medium">{t("students.name")}</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">{t("students.id")}</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">{t("students.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {DEMO_STUDENTS.map((s) => (
              <tr key={s.key}>
                <td className="px-4 py-3 font-medium">{t(`demo.students.${s.key}`)}</td>
                <td className="px-4 py-3 tabular-nums text-ink-muted" dir="ltr">
                  <span className="inline-block text-start">{s.studentId}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800">
                    {t("students.active")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-ink-muted">{t("students.count", { n: DEMO_STUDENTS.length })}</p>
    </div>
  );
}
