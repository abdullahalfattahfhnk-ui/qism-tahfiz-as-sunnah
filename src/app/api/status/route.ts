import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// TEMPORARY diagnostic. Shows only the signed-in person's own account state.
// Delete this file once the problem is fixed.
export const dynamic = "force-dynamic";

export async function GET() {
  const out: Record<string, unknown> = { configured: Boolean(getSupabaseEnv()) };
  if (!out.configured) return NextResponse.json(out);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    out.signedIn = Boolean(data.user);
    out.authError = error?.message ?? null;

    if (data.user) {
      out.email = data.user.email ?? null;
      const profile = await supabase
        .from("profiles")
        .select("full_name, role, is_active, approval_status")
        .eq("id", data.user.id)
        .maybeSingle();
      out.profile = profile.data;
      out.profileError = profile.error
        ? `${profile.error.code}: ${profile.error.message}`
        : null;
    }
  } catch (e) {
    out.thrown = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }

  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}
