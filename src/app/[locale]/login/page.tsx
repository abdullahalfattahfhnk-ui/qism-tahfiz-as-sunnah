import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
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
  searchParams: Promise<{ error?: string; confirmed?: string }>;
}) {
  const { locale } = await params;
  const { error, confirmed } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("login");

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <LoginForm
        configured={Boolean(getSupabaseEnv())}
        initialError={error === "inactive" ? "inactive" : undefined}
        confirmed={confirmed === "1"}
      />
    </AuthShell>
  );
}
