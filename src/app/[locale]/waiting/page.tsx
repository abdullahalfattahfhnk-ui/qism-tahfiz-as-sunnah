import { Hourglass, PauseCircle, XCircle } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Brand } from "@/components/layout/brand";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { redirect } from "@/i18n/navigation";
import { signOut } from "@/lib/auth/actions";
import { getAccountState } from "@/lib/auth/session";

// Depends on the signed-in account, so it must not be prerendered.
export const dynamic = "force-dynamic";

export default async function WaitingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const state = await getAccountState();
  if (state.status !== "inactive") {
    // Signed out goes to login; an approved, active account goes to the app.
    redirect({ href: state.status === "ok" ? "/dashboard" : "/login", locale });
    return null;
  }

  const t = await getTranslations("waiting");
  const content = {
    pending: { icon: Hourglass, title: t("title"), body: t("pendingBody") },
    rejected: { icon: XCircle, title: t("rejectedTitle"), body: t("rejectedBody") },
    suspended: { icon: PauseCircle, title: t("suspendedTitle"), body: t("suspendedBody") },
  }[state.reason];
  const Icon = content.icon;

  return (
    <main className="flex min-h-dvh flex-col px-5 py-6 sm:px-10">
      <div className="flex items-center justify-between gap-3">
        <Brand />
        <LanguageSwitcher compact />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <div className="rounded-xl border border-line bg-surface p-6 text-center sm:p-8">
          <Icon className="mx-auto size-10 text-brand-700" aria-hidden />
          <h1 className="mt-4 text-xl font-semibold text-brand-900">{content.title}</h1>
          <p className="mt-2 text-ink-muted">{content.body}</p>
          {state.fullName && (
            <p className="mt-4 text-sm text-ink-muted">
              {t("signedInAs", { name: state.fullName })}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {state.reason === "pending" && (
              // A plain link forces a fresh load, so the latest status is read.
              <a
                href={`/${locale}/waiting`}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-700 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
              >
                {t("refresh")}
              </a>
            )}
            <form action={signOut.bind(null, locale)}>
              <Button type="submit" variant="secondary" className="w-full">
                {t("signOut")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
