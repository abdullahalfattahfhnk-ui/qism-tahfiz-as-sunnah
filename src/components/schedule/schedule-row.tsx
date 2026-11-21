import { useLocale, useTranslations } from "next-intl";
import type { ClassState, ScheduleEntry } from "@/lib/demo/data";
import { formatClock } from "@/lib/demo/time";
import { cn } from "@/lib/utils";

export function ScheduleRow({
  entry,
  state,
}: {
  entry: ScheduleEntry;
  state?: ClassState;
}) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <li
      className={cn(
        "flex gap-4 px-4 py-3",
        state === "past" && "text-ink-muted",
        state === "current" && "bg-brand-50",
      )}
    >
      <div className="w-24 shrink-0 text-sm tabular-nums">
        <p>{formatClock(locale, entry.start)}</p>
        <p className="text-ink-muted">{formatClock(locale, entry.end)}</p>
      </div>
      <div className="min-w-0">
        <p className="font-medium">{t(`demo.subjects.${entry.subject}`)}</p>
        <p className="mt-0.5 flex flex-wrap gap-x-4 text-sm text-ink-muted">
          <span>{t(`demo.people.${entry.teacher}`)}</span>
          <span>{t("schedule.room", { n: entry.room })}</span>
        </p>
        {state === "current" && (
          <p className="mt-1 text-xs font-medium text-brand-700">
            {t("schedule.current")}
          </p>
        )}
      </div>
    </li>
  );
}
