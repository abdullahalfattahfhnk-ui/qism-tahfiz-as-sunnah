import {
  ChevronRight,
  FolderCog,
  Megaphone,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccessDenied } from "@/components/ui/access-denied";
import { SectionHeader } from "@/components/ui/section-header";
import { Link } from "@/i18n/navigation";
import { requireViewer } from "@/lib/auth/session";
import {
  DEMO_ACTIVITY,
  DEMO_RESOURCES,
  DEMO_STUDENTS,
  DEMO_STUDY,
  DEMO_TEACHER_COUNT,
} from "@/lib/demo/data";
import { relativeDays } from "@/lib/demo/time";
import { createClient } from "@/lib/supabase/server";

// Shows a live count for the signed-in Super Admin, so it must not be prerendered.
export const dynamic = "force-dynamic";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const viewer = await requireViewer(locale);
  if (viewer.role !== "super_admin") return <AccessDenied />;
  const t = await getTranslations();
  const num = new Intl.NumberFormat(locale);

  // Real data (not demo): how many sign-ups wait for approval.
  let pendingCount = 0;
  if (!viewer.isDemo) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("admin_list_users", { p_status: "pending" });
    pendingCount = Array.isArray(data) ? data.length : 0;
  }

  const stats = [
    { key: "students", value: DEMO_STUDENTS.length },
    { key: "teachers", value: DEMO_TEACHER_COUNT },
    { key: "subjects", value: DEMO_STUDY.length },
    { key: "resources", value: DEMO_RESOURCES.length },
  ];
  const tools = [
    { key: "users", icon: Users },
    { key: "content", icon: FolderCog },
    { key: "announcements", icon: Megaphone },
    { key: "permissions", icon: ShieldCheck },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <SectionHeader level="h1" title={t("nav.admin")} demo />
        <p className="mt-2 text-ink-muted">{t("admin.description")}</p>
      </div>

      {!viewer.isDemo && (
        <Link
          href="/admin/users"
          className="flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-brand-900 transition-colors hover:bg-brand-100"
        >
          <span className="flex items-center gap-3">
            <UserCheck className="size-5 shrink-0 text-brand-700" aria-hidden />
            <span>
              <span className="block font-semibold">{t("adminUsers.title")}</span>
              <span className="block text-sm">
                {t("adminUsers.pendingCount", { n: pendingCount })}
              </span>
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 rtl:-scale-x-100" aria-hidden />
        </Link>
      )}

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
        {stats.map(({ key, value }) => (
          <div key={key} className="bg-surface px-4 py-4">
            <dt className="text-sm text-ink-muted">{t(`admin.stats.${key}`)}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-brand-900">
              {num.format(value)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-3">
          <SectionHeader title={t("admin.manage")} demo />
          <p className="text-xs text-ink-muted">{t("admin.availableLater")}</p>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {tools.map(({ key, icon: Icon }) => (
              <li
                key={key}
                aria-disabled="true"
                className="flex items-center gap-3 px-4 py-3 text-ink-muted"
              >
                <Icon className="size-[18px] shrink-0" aria-hidden />
                {t(`admin.items.${key}`)}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <SectionHeader title={t("admin.recent")} demo />
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {DEMO_ACTIVITY.map((a) => (
              <li key={a.kind} className="px-4 py-3">
                <p>{t(`admin.activity.${a.kind}`, { person: t(`demo.people.${a.person}`) })}</p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {relativeDays(locale, -a.daysAgo)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
        }
