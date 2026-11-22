import { ClipboardList, Library, Megaphone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";
import { Brand } from "@/components/layout/brand";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("login") };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("login");

  const points = [
    { icon: Library, text: t("points.materials") },
    { icon: ClipboardList, text: t("points.assignments") },
    { icon: Megaphone, text: t("points.announcements") },
  ];

  return (
    <main className="grid min-h-dvh lg:grid-cols-[5fr_6fr]">
      <aside className="hidden flex-col justify-between bg-brand-900 p-12 text-white lg:flex">
        <Brand tone="light" />
        <div>
          <h2 className="max-w-xs text-3xl font-semibold leading-snug">
            {t("panelTitle")}
          </h2>
          <ul className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-brand-100">
                <Icon className="size-5 shrink-0" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <span aria-hidden />
      </aside>

      <section className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between gap-3">
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="ms-auto">
            <LanguageSwitcher compact />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-semibold text-brand-900">{t("title")}</h1>
          <p className="mb-8 mt-2 text-ink-muted">{t("subtitle")}</p>
          <LoginForm
            configured={Boolean(getSupabaseEnv())}
            initialError={error === "inactive" ? "inactive" : undefined}
          />
        </div>
      </section>
    </main>
  );
}
