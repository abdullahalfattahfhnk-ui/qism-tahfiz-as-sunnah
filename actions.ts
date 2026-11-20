"use server";

import { hasLocale } from "next-intl";
import { z } from "zod";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type SignInState = { error?: "invalid" | "disabled" | "unavailable" };

const credentials = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const safeLocale = (value: string) =>
  hasLocale(routing.locales, value) ? value : routing.defaultLocale;

export async function signIn(
  locale: string,
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = credentials.safeParse({
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

  // A disabled account must not stay signed in.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("is_active").eq("id", user.id).maybeSingle()
    : { data: null };
  if (!profile?.is_active) {
    await supabase.auth.signOut();
    return { error: "disabled" };
  }

  redirect({ href: "/dashboard", locale: safeLocale(locale) });
  return {};
}

export async function signOut(locale: string) {
  if (getSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect({ href: "/login", locale: safeLocale(locale) });
}
