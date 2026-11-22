import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnnouncementItem } from "@/components/announcements/announcement-item";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { sortedAnnouncements } from "@/lib/demo/data";
import { requireViewer } from "@/lib/auth/session";

export default async function AnnouncementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { role } = await requireViewer(locale);
  const canPost = role !== "student";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <SectionHeader
          level="h1"
          title={t("nav.announcements")}
          demo
          action={
            canPost && (
              <Button variant="secondary" disabled>
                <Plus className="size-4" aria-hidden />
                {t("announcements.newAnnouncement")}
              </Button>
            )
          }
        />
        <p className="mt-2 text-ink-muted">{t("announcements.description")}</p>
        {canPost && (
          <p className="mt-1 text-xs text-ink-muted">
            {t("announcements.availableLater")}
          </p>
        )}
      </div>

      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {sortedAnnouncements().map((item) => (
          <AnnouncementItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
          }
