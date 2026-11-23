import { CheckCircle2, MailWarning } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccessDenied } from "@/components/ui/access-denied";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { Link } from "@/i18n/navigation";
import { approveUser, rejectUser } from "@/lib/auth/admin-actions";
import { requireViewer } from "@/lib/auth/session";
import { relativeDays } from "@/lib/demo/time";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// Reads live data for the signed-in Super Admin, so it must not be prerendered.
export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  email_confirmed: boolean;
  role: "super_admin" | "teacher" | "student";
  approval_status: "pending" | "approved" | "rejected";
  is_active: boolean;
  created_at: string;
};

type ClassRow = {
  id: string;
  name_ar: string | null;
  name_bn: string | null;
  name_en: string | null;
};

const fieldClass =
  "h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20";

const RESULTS = ["approved", "rejected", "error", "unverified"];

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ result?: string; detail?: string }>;
}) {
  const { locale } = await params;
  const { result, detail } = await searchParams;
  setRequestLocale(locale);

  const { role } = await requireViewer(locale);
  if (role !== "super_admin") return <AccessDenied />;
  const t = await getTranslations();

  if (!getSupabaseEnv()) {
    return (
      <p className="mx-auto max-w-xl rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-800">
        {t("login.notConnected")}
      </p>
    );
  }

  const supabase = await createClient();
  const [usersResult, classesResult] = await Promise.all([
    supabase.rpc("admin_list_users", { p_status: null }),
    supabase
      .from("classes")
      .select("id, name_ar, name_bn, name_en")
      .eq("is_active", true)
      .order("created_at"),
  ]);

  const rows = (usersResult.data ?? []) as UserRow[];
  const classes = (classesResult.data ?? []) as ClassRow[];
  const pending = rows.filter((u) => u.approval_status === "pending");
  const handled = rows.filter((u) => u.approval_status !== "pending").slice(0, 20);

  const className = (c: ClassRow) =>
    (locale === "bn" ? c.name_bn : locale === "en" ? c.name_en : c.name_ar) ??
    c.name_ar ?? c.name_en ?? c.name_bn ?? "";
  const requestedAgo = (iso: string) =>
    relativeDays(locale, -Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));
  const statusOf = (u: UserRow) =>
    u.approval_status === "approved" && !u.is_active ? "suspended" : u.approval_status;

  const showResult = result && RESULTS.includes(result);
  const resultIsError = result === "error" || result === "unverified";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href="/admin"
          className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          {t("adminUsers.back")}
        </Link>
        <div className="mt-3">
          <SectionHeader level="h1" title={t("adminUsers.title")} />
        </div>
        <p className="mt-2 text-ink-muted">{t("adminUsers.description")}</p>
      </div>

      {showResult && (
        <div
          role={resultIsError ? "alert" : "status"}
          className="rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-900"
        >
          <p>{t(`adminUsers.results.${result}`)}</p>
          {resultIsError && detail && (
            <p dir="ltr" className="mt-1 break-all text-xs text-ink-muted">
              {detail.slice(0, 200)}
            </p>
          )}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-base font-semibold">{t("adminUsers.pendingHeading")}</h2>
        {classes.length === 0 && (
          <p className="rounded-lg border border-dashed border-line bg-surface p-4 text-sm text-ink-muted">
            {t("adminUsers.noClasses")}
          </p>
        )}
        {pending.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-surface p-6 text-ink-muted">
            {t("adminUsers.none")}
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {pending.map((u) => (
              <li key={u.id} className="space-y-4 px-4 py-4">
                <div>
                  <p className="font-semibold">{u.full_name}</p>
                  <p dir="ltr" className="mt-0.5 break-all text-sm text-ink-muted">
                    {u.email}
                  </p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    {u.email_confirmed ? (
                      <span className="inline-flex items-center gap-1 text-brand-700">
                        <CheckCircle2 className="size-3.5" aria-hidden />
                        {t("adminUsers.verified")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-ink">
                        <MailWarning className="size-3.5" aria-hidden />
                        {t("adminUsers.notVerified")}
                      </span>
                    )}
                    <span className="text-ink-muted">
                      {t("adminUsers.requested", { when: requestedAgo(u.created_at) })}
                    </span>
                  </p>
                </div>

                <form action={approveUser} className="grid gap-3 sm:grid-cols-3">
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="locale" value={locale} />
                  <label className="space-y-1.5 text-sm font-medium">
                    {t("adminUsers.role")}
                    <select name="role" defaultValue="student" className={fieldClass}>
                      <option value="student">{t("adminUsers.roles.student")}</option>
                      <option value="teacher">{t("adminUsers.roles.teacher")}</option>
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    {t("adminUsers.class")}
                    <select name="classId" required className={fieldClass}>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {className(c)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    {t("adminUsers.studentCode")}
                    <input
                      name="studentCode"
                      type="text"
                      maxLength={30}
                      dir="ltr"
                      className={`${fieldClass} text-start`}
                    />
                  </label>
                  <div className="flex flex-wrap gap-3 sm:col-span-3">
                    <Button
                      type="submit"
                      disabled={!u.email_confirmed || classes.length === 0}
                    >
                      {t("adminUsers.approve")}
                    </Button>
                    <Button
                      type="submit"
                      variant="secondary"
                      formAction={rejectUser}
                      formNoValidate
                    >
                      {t("adminUsers.reject")}
                    </Button>
                  </div>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {handled.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">{t("adminUsers.handledHeading")}</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {handled.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{u.full_name}</p>
                  <p dir="ltr" className="truncate text-sm text-ink-muted">
                    {u.email}
                  </p>
                </div>
                <div className="shrink-0 text-end text-xs">
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-800">
                    {t(`adminUsers.status.${statusOf(u)}`)}
                  </span>
                  {u.approval_status === "approved" && (
                    <p className="mt-1 text-ink-muted">{t(`shell.roles.${u.role}`)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
                  }
