import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { getSupabaseEnv } from "@/lib/supabase/env";

const intlMiddleware = createIntlMiddleware(routing);

/** Pages anyone can open without signing in (the path after the language prefix). */
const PUBLIC_PATHS = new Set(["/login", "/signup"]);

/**
 * 1. next-intl handles the language prefix.
 * 2. When Supabase is configured: refresh the session, send signed-out visitors
 *    to the login page, and signed-in users away from the login/sign-up pages.
 * This is a convenience gate. The real protection is the server-side checks in
 * pages/actions plus Row Level Security in the database.
 */
export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const env = getSupabaseEnv();
  if (!env) return response; // demo mode
  if (response.headers.has("location")) return response; // locale redirect

  const [, first, ...rest] = request.nextUrl.pathname.split("/");
  const locale = routing.locales.find((l) => l === first);
  if (!locale) return response;
  const path = ("/" + rest.join("/")).replace(/\/+$/, "") || "/";

  let user: { id: string } | null = null;
  try {
    const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          list.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase unreachable or keys wrong: treat as signed out instead of
    // returning a 500 for the whole site. The login page then shows an error.
  }

  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  const isPublic = PUBLIC_PATHS.has(path);
  if (!user) return isPublic ? response : redirectTo("/login");
  // Signed-in users skip the login and sign-up pages. The app layout then sends
  // pending, rejected or paused accounts on to the waiting screen.
  // "?error=" lets a page show a message instead of redirecting.
  if (isPublic && !request.nextUrl.searchParams.has("error")) {
    return redirectTo("/dashboard");
  }
  if (path === "/") return redirectTo("/dashboard");
  return response;
}

export const config = {
  // Skip API routes, Next internals and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
