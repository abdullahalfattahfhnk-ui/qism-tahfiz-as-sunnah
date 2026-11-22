import { getTranslations, setRequestLocale } from "next-intl/server";
import { ScheduleRow } from "@/components/schedule/schedule-row";
import { SectionHeader } from "@/components/ui/section-header";
import { classState, entriesForDay, SCHOOL_DAYS } from "@/lib/demo/data";
import { getNow, weekdayName } from "@/lib/demo/time";

// Highlights today, so it must not be prerendered at build time.
export const dynamic = "force-dynamic";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const now = getNow();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <SectionHeader level="h1" title={t("nav.schedule")} demo />
        <p className="mt-2 text-ink-muted">{t("schedule.description")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {SCHOOL_DAYS.map((day) => {
          const isToday = day === now.day;
          return (
            <section key={day} className="space-y-2">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                {weekdayName(locale, day)}
                {isToday && (
                  <span className="rounded-full bg-brand-700 px-2 py-0.5 text-xs font-medium text-white">
                    {t("schedule.today")}
                  </span>
                )}
              </h2>
              <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                {entriesForDay(day).map((entry) => (
                  <ScheduleRow
                    key={entry.start}
                    entry={entry}
                    state={isToday ? classState(entry, now.minutes) : undefined}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
