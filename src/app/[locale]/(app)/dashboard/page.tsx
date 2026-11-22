import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnnouncementItem } from "@/components/announcements/announcement-item";
import { ScheduleRow } from "@/components/schedule/schedule-row";
import { SectionHeader } from "@/components/ui/section-header";
import { Link } from "@/i18n/navigation";
import { requireViewer } from "@/lib/auth/session";
import {
  classState,
  DEMO_ASSIGNMENTS,
  entriesForDay,
  getNextClass,
  sortedAnnouncements,
} from "@/lib/demo/data";
import {
  formatClock,
  formatFullDate,
  getNow,
  relativeDays,
  weekdayName,
} from "@/lib/demo/time";

// Uses the current date, so it must not be prerendered at build time.
export const dynamic = "force-dynamic";

const viewAllClass =
  "text-sm font-medium text-brand-700 underline underline-offset-4 hover:text-brand-900";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const viewer = await requireViewer(locale);

  const now = getNow();
  const today = entriesForDay(now.day);
  const next = getNextClass(now);
  const announcements = sortedAnnouncements().slice(0, 3);
  const pending = DEMO_ASSIGNMENTS.filter((a) => a.status === "pending");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-brand-900">
          {t("dashboard.greeting", { name: viewer.fullName ?? t("shell.userName") })}
        </h1>
        <p className="mt-1 text-ink-muted">{formatFullDate(locale, now.date)}</p>
      </header>

      <section
        aria-labelledby="next-class"
        className="rounded-xl bg-brand-800 p-5 text-white sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="next-class" className="text-sm font-medium text-brand-200">
            {t("dashboard.nextClass")}
          </h2>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">
            {t("demo.badge")}
          </span>
        </div>
        {next ? (
          <>
            <p className="mt-3 text-2xl font-semibold sm:text-3xl">
              {t(`demo.subjects.${next.entry.subject}`)}
            </p>
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-brand-100">
              <span>
                {next.offset === 0
                  ? t("dashboard.today")
                  : weekdayName(locale, next.entry.day)}
              </span>
              <span className="tabular-nums">
                {formatClock(locale, next.entry.start)}
              </span>
              <span>{t(`demo.people.${next.entry.teacher}`)}</span>
              <span>{t("schedule.room", { n: next.entry.room })}</span>
            </p>
          </>
        ) : (
          <p className="mt-3 text-brand-100">{t("dashboard.noClassesToday")}</p>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="space-y-3 lg:col-span-3">
          <SectionHeader
            title={t("dashboard.todaySchedule")}
            demo
            action={
              <Link href="/schedule" className={viewAllClass}>
                {t("dashboard.viewAll")}
              </Link>
            }
          />
          {today.length > 0 ? (
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {today.map((entry) => (
                <ScheduleRow
                  key={`${entry.day}-${entry.start}`}
                  entry={entry}
                  state={classState(entry, now.minutes)}
                />
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-line bg-surface p-6 text-ink-muted">
              {t("dashboard.noClassesToday")}
            </p>
          )}
        </section>

        <div className="space-y-8 lg:col-span-2">
          <section className="space-y-3">
            <SectionHeader
              title={t("dashboard.latestAnnouncements")}
              demo
              action={
                <Link href="/announcements" className={viewAllClass}>
                  {t("dashboard.viewAll")}
                </Link>
              }
            />
            <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {announcements.map((item) => (
                <AnnouncementItem key={item.id} item={item} compact />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader title={t("dashboard.assignmentsDue")} demo />
            {pending.length > 0 ? (
              <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                {pending.map((a) => (
                  <li key={a.id} className="px-4 py-3">
                    <p className="font-medium">
                      {t(`demo.assignments.${a.id}`)}
                    </p>
                    <p className="mt-0.5 flex flex-wrap gap-x-4 text-sm text-ink-muted">
                      <span>{t(`demo.subjects.${a.subject}`)}</span>
                      <span>{relativeDays(locale, a.dueInDays)}</span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-muted">{t("dashboard.noAssignments")}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
            }
