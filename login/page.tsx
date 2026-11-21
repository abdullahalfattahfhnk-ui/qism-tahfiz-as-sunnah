import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSupabaseEnv } from "@/lib/supabase/env";

export default async function LoginPage() {
  const t = await getTranslations();
  const hasSupabase = Boolean(getSupabaseEnv());

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Qism Tahfiz as-Sunnah</h1>
          <p className="text-sm opacity-80">
            {hasSupabase
              ? "Supabase authentication is configured."
              : "Demo mode is active (Supabase environment variables not set yet)."}
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-lg py-2.5 text-sm font-semibold border opacity-90"
          >
            Sign in
          </button>
        </form>

        <div className="pt-2 border-t flex items-center justify-between text-sm">
          <Link href="/" className="underline">
            ← Home ({t ? "Locale" : ""})
          </Link>
          <span className="text-xs opacity-70">/login</span>
        </div>
      </div>
    </main>
  );
}
