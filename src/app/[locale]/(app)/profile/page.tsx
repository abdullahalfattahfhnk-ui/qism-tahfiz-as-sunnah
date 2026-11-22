import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { localeLabels, type Locale } from "@/i18n/routing";
import { requireViewer } from "@/lib/auth/session";

const DEMO_EMAIL = "demo@example.com";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const viewer = await requireViewer(locale);
  const role = viewer.role;

  const fields = [
    { id: "name", label: t("profile.name"), value: viewer.fullName ?? t("shell.userName") },
    { id: "email", label: t("profile.email"), value: viewer.email ?? DEMO_EMAIL, ltr: true },
    { id: "role", label: t("profile.role"), value: t(`shell.roles.${role}`) },
    { id: "class", label: t("profile.class"), value: t("demo.className") },
    { id: "language", label: t("profile.language"), value: localeLabels[locale as Locale] },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <SectionHeader level="h1" title={t("nav.profile")} demo />
        <p className="mt-2 text-ink-muted">{t("profile.description")}</p>
      </div>

      <form className="space-y-4 rounded-xl border border-line bg-surface p-5 sm:p-6">
        {fields.map(({ id, label, value, ltr }) => (
          <div key={id} className="space-y-1.5">
            <label htmlFor={id} className="text-sm font-medium">
              {label}
            </label>
            <input
              id={id}
              defaultValue={value}
              disabled
              dir={ltr ? "ltr" : undefined}
              className="h-11 w-full rounded-lg border border-line bg-canvas px-3 text-start text-sm text-ink-muted"
            />
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" disabled>
            {t("profile.save")}
          </Button>
          <p className="text-xs text-ink-muted">{t("profile.availableLater")}</p>
        </div>
      </form>
    </div>
  );
      }
