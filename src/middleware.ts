import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { getSupabaseEnv } from "@/lib/supabase/env";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * 1. next-intl handles the language prefix.
 * 2. When Supabase is configured: refresh the session, send signed-out visitors
 *    to the login page, and signed-in users away from it.
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  const isLogin = path === "/login";
  if (!user) return isLogin ? response : redirectTo("/login");
  // "?error=" lets an inactive account see the message instead of looping.
  if (isLogin && !request.nextUrl.searchParams.has("error")) {
    return redirectTo("/dashboard");
  }
  if (path === "/") return redirectTo("/dashboard");
  return response;
}

export const config = {
  // Skip API routes, Next internals and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
