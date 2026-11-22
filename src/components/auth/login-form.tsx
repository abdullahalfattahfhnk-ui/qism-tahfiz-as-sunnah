"use client";

import { Eye, EyeOff, Info } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { signIn, type SignInState } from "@/lib/auth/actions";

const inputClass =
  "h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted/60 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20";

type Props = {
  /** True when the Supabase keys are set. Otherwise the form is design-only. */
  configured: boolean;
  initialError?: "inactive";
};

export function LoginForm({ configured, initialError }: Props) {
  const t = useTranslations("login");
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [state, formAction, pending] = useActionState(
    signIn.bind(null, locale),
    {} as SignInState,
  );

  const errorKey = state.error ?? initialError;

  return (
    <form
      action={configured ? formAction : undefined}
      onSubmit={
        configured
          ? undefined
          : (e) => {
              e.preventDefault();
              setAttempted(true); // demo mode: nothing is sent anywhere
            }
      }
      className="space-y-5"
    >
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="username"
          required
          className={`${inputClass} text-start`}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          {t("password")}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            dir="ltr"
            autoComplete="current-password"
            required
            className={`${inputClass} pe-11 text-start`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            aria-pressed={showPassword}
            className="absolute end-1 top-1 grid size-9 place-items-center rounded-md text-ink-muted hover:bg-canvas"
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("signingIn") : t("submit")}
      </Button>

      {errorKey && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-900"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t(`errors.${errorKey}`)}
        </p>
      )}

      {!configured && attempted && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-800"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t("notConnected")}
        </p>
      )}

      <div className="space-y-3 border-t border-line pt-5 text-sm text-ink-muted">
        <p>{t("noAccount")}</p>
        {!configured && (
          <Link
            href="/dashboard"
            className="inline-block font-medium text-brand-700 underline underline-offset-4 hover:text-brand-900"
          >
            {t("previewLink")}
          </Link>
        )}
      </div>
    </form>
  );
            }
