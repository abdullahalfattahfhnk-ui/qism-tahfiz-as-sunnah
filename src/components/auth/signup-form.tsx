"use client";

import { Eye, EyeOff, Info, MailCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { signUp, type SignUpState } from "@/lib/auth/actions";

const inputClass =
  "h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted/60 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20";

export function SignupForm() {
  const t = useTranslations("signup");
  const locale = useLocale();
  // Controlled fields so a failed attempt does not clear what was typed.
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(
    signUp.bind(null, locale),
    {} as SignUpState,
  );

  if (state.checkEmail) {
    return (
      <div role="status" className="rounded-xl border border-line bg-brand-50 p-5">
        <MailCheck className="size-6 text-brand-700" aria-hidden />
        <h2 className="mt-3 text-lg font-semibold text-brand-900">
          {t("checkEmailTitle")}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">{t("checkEmailBody")}</p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-brand-700 underline underline-offset-4 hover:text-brand-900"
        >
          {t("signInLink")}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="fullName" className="text-sm font-medium">
          {t("fullName")}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={100}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={`${inputClass} text-start`}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="password-hint"
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
        <p id="password-hint" className="text-xs text-ink-muted">
          {t("passwordHint")}
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("submitting") : t("submit")}
      </Button>

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-900"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t(`errors.${state.error}`)}
        </p>
      )}

      <p className="border-t border-line pt-5 text-sm text-ink-muted">
        {t("haveAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-brand-700 underline underline-offset-4 hover:text-brand-900"
        >
          {t("signInLink")}
        </Link>
      </p>
    </form>
  );
          }
