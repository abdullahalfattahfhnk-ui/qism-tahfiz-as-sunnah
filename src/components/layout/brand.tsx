import { BookOpenText } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

type Props = { compact?: boolean; tone?: "dark" | "light" };

/** Official name: Arabic first, English beneath, in every interface language. */
export function Brand({ compact = false, tone = "dark" }: Props) {
  const light = tone === "light";
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-lg",
          light ? "bg-white text-brand-800" : "bg-brand-700 text-white",
        )}
      >
        <BookOpenText className="size-5" aria-hidden />
      </span>
      {compact ? (
        <span className="sr-only">
          {BRAND.nameAr} ({BRAND.nameEn})
        </span>
      ) : (
        <div className="leading-tight">
          <p
            lang="ar"
            dir="rtl"
            className={cn(
              "font-[family-name:var(--font-arabic)] text-lg font-semibold",
              light ? "text-white" : "text-brand-900",
            )}
          >
            {BRAND.nameAr}
          </p>
          <p
            lang="en"
            dir="ltr"
            className={cn(
              "font-[family-name:var(--font-inter)] text-xs",
              light ? "text-brand-200" : "text-ink-muted",
            )}
          >
            {BRAND.nameEn}
          </p>
        </div>
      )}
    </div>
  );
    }
