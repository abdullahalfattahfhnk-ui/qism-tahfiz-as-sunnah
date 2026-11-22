"use server";

import { headers } from "next/headers";
import { hasLocale } from "next-intl";
import { z } from "zod";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type SignInState = { error?: "invalid" | "disabled" | "unavailable" };
export type SignUpState = {
  error?: "invalid" | "exists" | "weak" | "unavailable" | "rateLimited";
  /** True when a confirmation email was sent. */
  checkEmail?: boolean;
};

const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const signUpSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
});

const safeLocale = (value: string) =>
  hasLocale(routing.locales, value) ? value : routing.defaultLocale;

export async function signIn(
  locale: string,
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "invalid" };
  if (!getSupabaseEnv()) return { error: "unavailable" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Same message for wrong email and wrong password (no account probing).
    return { error: error.status && error.status >= 500 ? "unavailable" : "invalid" };
  }

  // Pending, rejected or paused accounts are sent to the waiting screen
  // by the app layout, so signing in itself always succeeds.
  redirect({ href: "/dashboard", locale: safeLocale(locale) });
  return {};
}

export async function signUp(
  locale: string,
  _previous: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "invalid" };
  if (!getSupabaseEnv()) return { error: "unavailable" };

  const { fullName, email, password } = parsed.data;
  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      // Must be listed under Authentication -> URL Configuration -> Redirect URLs.
      emailRedirectTo: origin
        ? `${origin}/api/auth/callback?locale=${safeLocale(locale)}`
        : undefined,
    },
  });

  if (error) {
    if (error.code === "weak_password") return { error: "weak" };
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { error: "exists" };
    }
    if (
      error.status === 429 ||
      error.code === "over_email_send_rate_limit" ||
      error.code === "over_request_rate_limit"
    ) {
      return { error: "rateLimited" };
    }
    if (error.code === "validation_failed") return { error: "invalid" };
    return { error: "unavailable" };
  }

  // Email confirmation OFF: a session exists already. Go to the waiting screen.
  if (data.session) {
    redirect({ href: "/waiting", locale: safeLocale(locale) });
  }

  // Email confirmation ON: tell the user to check their inbox. The same
  // message is shown even if the email already existed (no account probing).
  return { checkEmail: true };
}

export async function signOut(locale: string) {
  if (getSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect({ href: "/login", locale: safeLocale(locale) });
    }
