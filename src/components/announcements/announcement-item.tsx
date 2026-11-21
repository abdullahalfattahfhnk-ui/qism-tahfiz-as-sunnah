import { Pin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { DemoAnnouncement } from "@/lib/demo/data";
import { relativeDays } from "@/lib/demo/time";

export function AnnouncementItem({
  item,
  compact = false,
}: {
  item: DemoAnnouncement;
  compact?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <article className="px-4 py-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        {item.pinned && (
          <span className="inline-flex items-center gap-1 font-medium text-brand-700">
            <Pin className="size-3.5" aria-hidden />
            {t("announcements.pinned")}
          </span>
        )}
        <span className="rounded-md bg-canvas px-2 py-0.5">
          {t(`announcements.categories.${item.category}`)}
        </span>
        <span>{relativeDays(locale, -item.daysAgo)}</span>
      </div>
      <h3 className="mt-2 font-semibold">
        {t(`demo.announcements.${item.id}.title`)}
      </h3>
      {!compact && (
        <p className="mt-1 max-w-prose text-ink-muted">
          {t(`demo.announcements.${item.id}.body`)}
        </p>
      )}
      <p className="mt-2 text-xs text-ink-muted">
        {t(`demo.people.${item.author}`)}
      </p>
    </article>
  );
}
