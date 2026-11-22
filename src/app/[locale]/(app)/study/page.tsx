import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeader } from "@/components/ui/section-header";
import { DEMO_STUDY } from "@/lib/demo/data";

export default async function StudyPage({
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
        <SectionHeader level="h1" title={t("nav.study")} demo />
        <p className="mt-2 text-ink-muted">{t("study.description")}</p>
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {DEMO_STUDY.map(({ subject, teacher, total, done }) => {
          const percent = Math.round((done / total) * 100);
          const label = t(`demo.subjects.${subject}`);
          return (
            <li key={subject} className="px-4 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="font-semibold">{label}</h2>
                <p className="text-sm text-ink-muted">
                  {t(`demo.people.${teacher}`)}
                </p>
              </div>
              <div
                role="progressbar"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-100"
              >
                <div
                  className="h-full rounded-full bg-brand-600"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 flex flex-wrap gap-x-4 text-sm text-ink-muted">
                <span>{t("study.progress", { done, total })}</span>
                <span>
                  {done === total
                    ? t("study.allDone")
                    : t("study.nextLesson", { n: done + 1 })}
                </span>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
  }
