"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

export function NavLinks({ role }: { role: Role }) {
  const t = useTranslations();
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <nav aria-label={t("shell.mainNav")} className="px-3">
      <ul className="space-y-1">
        {items.map(({ key, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-brand-50 font-medium text-brand-800"
                    : "text-ink-muted hover:bg-canvas hover:text-ink",
                )}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden />
                {t(`nav.${key}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
