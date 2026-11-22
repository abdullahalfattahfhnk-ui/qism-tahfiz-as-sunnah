import { CheckCircle2, Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { DEMO_ASSIGNMENTS, type DemoAssignment } from "@/lib/demo/data";
import { requireViewer } from "@/lib/auth/session";
import { relativeDays } from "@/lib/demo/time";

export default async function AssignmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { role } = await requireViewer(locale);

  const isOverdue = (a: DemoAssignment) => a.status === "pending" && a.dueInDays < 0;
  const groups = [
    { key: "overdue", items: DEMO_ASSIGNMENTS.filter(isOverdue) },
    {
      key: "pending",
      items: DEMO_ASSIGNMENTS.filter((a) => a.status === "pending" && !isOverdue(a)),
    },
    { key: "submitted", items: DEMO_ASSIGNMENTS.filter((a) => a.status === "submitted") },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <SectionHeader
          level="h1"
          title={t("nav.assignments")}
          demo
          action={
            role !== "student" && (
              <Button variant="secondary" disabled>
                <Plus className="size-4" aria-hidden />
                {t("assignments.create")}
              </Button>
            )
          }
        />
        <p className="mt-2 text-ink-muted">{t("assignments.description")}</p>
        <p className="mt-1 text-xs text-ink-muted">{t("assignments.availableLater")}</p>
      </div>

      {groups.map(({ key, items }) => (
        <section key={key} className="space-y-2">
          <h2 className="text-base font-semibold">{t(`assignments.${key}`)}</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {items.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{t(`demo.assignments.${a.id}`)}</p>
                  <p className="mt-0.5 flex flex-wrap gap-x-4 text-sm text-ink-muted">
                    <span>{t(`demo.subjects.${a.subject}`)}</span>
                    <span className={key === "overdue" ? "font-medium text-ink" : undefined}>
                      {t("assignments.due", { when: relativeDays(locale, a.dueInDays) })}
                    </span>
                  </p>
                </div>
                {a.status === "submitted" ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-brand-700">
                    <CheckCircle2 className="size-4" aria-hidden />
                    {t("assignments.submittedLabel")}
                  </span>
                ) : (
                  role === "student" && (
                    <Button variant="secondary" disabled className="h-9 shrink-0 px-3">
                      {t("assignments.submit")}
                    </Button>
                  )
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
      }
