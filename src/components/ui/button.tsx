import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className, ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors disabled:opacity-60",
        variant === "primary" &&
          "bg-brand-700 text-white hover:bg-brand-800",
        variant === "secondary" &&
          "border border-line bg-surface text-ink hover:bg-brand-50",
        className,
      )}
      {...props}
    />
  );
}
