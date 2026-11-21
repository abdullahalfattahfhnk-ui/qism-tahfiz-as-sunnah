"use client";

import { Info, LogOut, Menu, UserRound, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Brand } from "@/components/layout/brand";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NavLinks } from "@/components/layout/nav-links";
import { Link, usePathname } from "@/i18n/navigation";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

function SidebarBody({
  role,
  fullName,
  isDemo,
}: {
  role: Role;
  fullName: string | null;
  isDemo: boolean;
}) {
  const t = useTranslations("shell");
  const locale = useLocale();
  return (
    <>
      <div className="px-5 py-5">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        <NavLinks role={role} />
      </div>
      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-800">
            <UserRound className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">{fullName ?? t("userName")}</p>
            <p className="truncate text-xs text-ink-muted">
              {t(`roles.${role}`)}
            </p>
          </div>
        </div>
        {isDemo ? (
          <Link
            href="/login"
            className="mt-3 flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink-muted hover:bg-canvas hover:text-ink"
          >
            <LogOut className="size-4 rtl:-scale-x-100" aria-hidden />
            {t("exitPreview")}
          </Link>
        ) : (
          <form action={signOut.bind(null, locale)}>
            <button
              type="submit"
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink-muted hover:bg-canvas hover:text-ink"
            >
              <LogOut className="size-4 rtl:-scale-x-100" aria-hidden />
              {t("signOut")}
            </button>
          </form>
        )}
      </div>
    </>
  );
}

export function AppShell({
  role,
  fullName,
  isDemo,
  children,
}: {
  role: Role;
  fullName: string | null;
  isDemo: boolean;
  children: React.ReactNode;
}) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer after navigating.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes the drawer; page scroll is locked while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e border-line bg-surface lg:flex">
        <SidebarBody role={role} fullName={fullName} isDemo={isDemo} />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn("fixed inset-0 z-40 lg:hidden", !open && "pointer-events-none")}
        inert={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink/40 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={t("mainNav")}
          className={cn(
            "absolute inset-y-0 start-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-xl transition-transform",
            open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
          )}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("closeMenu")}
            className="absolute end-3 top-5 grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-canvas"
          >
            <X className="size-5" aria-hidden />
          </button>
          <SidebarBody role={role} fullName={fullName} isDemo={isDemo} />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface px-4 lg:justify-end lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t("openMenu")}
              aria-expanded={open}
              className="grid size-10 place-items-center rounded-lg text-ink hover:bg-canvas"
            >
              <Menu className="size-5" aria-hidden />
            </button>
            <Brand compact />
          </div>
          <LanguageSwitcher compact />
        </header>

        <div className="flex items-center gap-2 border-b border-line bg-brand-50 px-4 py-2 text-sm text-brand-800 lg:px-8">
          <Info className="size-4 shrink-0" aria-hidden />
          <p>{t("demoNotice")}</p>
        </div>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
