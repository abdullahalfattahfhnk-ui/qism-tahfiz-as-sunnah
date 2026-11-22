import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/layout/app-shell";
import { requireViewer } from "@/lib/auth/session";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AppLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Signed-out or inactive users are redirected to the login page here.
  const viewer = await requireViewer(locale);
  return (
    <AppShell role={viewer.role} fullName={viewer.fullName} isDemo={viewer.isDemo}>
      {children}
    </AppShell>
  );
}
