"use client";

import {
  BookOpen,
  Download,
  FileText,
  Headphones,
  PenLine,
  Search,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DemoResource, ResourceType } from "@/lib/demo/data";
import { relativeDays } from "@/lib/demo/time";
import { cn } from "@/lib/utils";

const ICONS: Record<ResourceType, LucideIcon> = {
  book: BookOpen,
  notes: FileText,
  audio: Headphones,
  worksheet: PenLine,
};

const FILTERS: ("all" | ResourceType)[] = ["all", "book", "notes", "audio", "worksheet"];

/** Search and filter run locally on demo data. Downloads are not connected. */
export function LibraryBrowser({ resources }: { resources: DemoResource[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const [type, setType] = useState<"all" | ResourceType>("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = resources.filter(
    (r) =>
      (type === "all" || r.type === type) &&
      (!q ||
        t(`demo.resources.${r.id}`).toLowerCase().includes(q) ||
        t(`demo.subjects.${r.subject}`).toLowerCase().includes(q)),
  );

  const size = (mb: number) =>
    new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "megabyte",
      maximumFractionDigits: 1,
    }).format(mb);

  return (
    <div className="space-y-4">
      <div className="relative">
        <label htmlFor="library-search" className="sr-only">
          {t("library.search")}
        </label>
        <Search
          className="pointer-events-none absolute start-3 top-3 size-4 text-ink-muted"
          aria-hidden
        />
        <input
          id="library-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("library.search")}
          className="h-10 w-full rounded-lg border border-line bg-surface ps-9 pe-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={type === f}
            onClick={() => setType(f)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              type === f
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-line bg-surface text-ink-muted hover:bg-brand-50",
            )}
          >
            {t(`library.filters.${f}`)}
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {visible.map((r) => {
            const Icon = ICONS[r.type];
            return (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{t(`demo.resources.${r.id}`)}</p>
                  <p className="mt-0.5 flex flex-wrap gap-x-4 text-sm text-ink-muted">
                    <span>{t(`demo.subjects.${r.subject}`)}</span>
                    <span>
                      {r.format}, {size(r.sizeMb)}
                    </span>
                    <span>
                      {t("library.added", { when: relativeDays(locale, -r.daysAgo) })}
                    </span>
                  </p>
                </div>
                <Button
                  variant="secondary"
                  disabled
                  aria-label={`${t("library.download")}: ${t(`demo.resources.${r.id}`)}`}
                  className="h-9 shrink-0 px-3"
                >
                  <Download className="size-4" aria-hidden />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-line bg-surface p-6 text-ink-muted">
          {t("library.empty")}
        </p>
      )}
    </div>
  );
      }
