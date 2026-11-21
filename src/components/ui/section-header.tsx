import { DemoBadge } from "@/components/ui/demo-badge";

type Props = {
  title: string;
  level?: "h1" | "h2";
  demo?: boolean;
  action?: React.ReactNode;
};

export function SectionHeader({ title, level = "h2", demo, action }: Props) {
  const Tag = level;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Tag
          className={
            level === "h1"
              ? "text-2xl font-semibold text-brand-900"
              : "text-base font-semibold"
          }
        >
          {title}
        </Tag>
        {demo && <DemoBadge />}
      </div>
      {action}
    </div>
  );
}
