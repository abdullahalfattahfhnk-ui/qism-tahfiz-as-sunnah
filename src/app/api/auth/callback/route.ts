import { NextResponse, type NextRequest } from "next/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing point of the confirmation link in the sign-up email.
 * Supabase has already verified the address; here we try to start a session.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const requested = searchParams.get("locale") ?? "";
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const code = searchParams.get("code");

  if (code && getSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      // Signed in: the app sends pending accounts on to the waiting screen.
      if (!error) return NextResponse.redirect(`${origin}/${locale}/dashboard`);
    } catch {
      // fall through to the sign-in page
    }
  }

  // Opened in a different browser, or the link expired: the email may still be
  // confirmed, so ask the person to sign in.
  return NextResponse.redirect(`${origin}/${locale}/login?confirmed=1`);
}
