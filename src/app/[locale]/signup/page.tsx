import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "signup" });
  return { title: t("title") };
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("signup");
  const tLogin = await getTranslations("login");

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      {getSupabaseEnv() ? (
        <SignupForm />
      ) : (
        <p className="rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-800">
          {tLogin("notConnected")}
        </p>
      )}
    </AuthShell>
  );
}
