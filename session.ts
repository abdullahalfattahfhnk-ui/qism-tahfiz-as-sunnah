import { cache } from "react";
import { redirect } from "@/i18n/navigation";
import { getDemoRole } from "@/lib/demo/role";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Role } from "@/types";

export type Viewer = {
  role: Role;
  fullName: string | null;
  email: string | null;
  /** True when Supabase is not configured and the role is only a preview. */
  isDemo: boolean;
};

type State =
  | { status: "ok"; viewer: Viewer }
  | { status: "anonymous" }
  | { status: "invalid" }; // signed in, but no active profile

const ROLES: Role[] = ["super_admin", "teacher", "student"];

/** Resolved once per request. The role comes from the database, never from the browser. */
const getState = cache(async (): Promise<State> => {
  if (!getSupabaseEnv()) {
    return {
      status: "ok",
      viewer: { role: getDemoRole(), fullName: null, email: null, isDemo: true },
    };
  }

  const supabase = await createClient();
  // getUser() asks the Supabase Auth server to verify the session.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active || !ROLES.includes(profile.role)) {
    return { status: "invalid" };
  }

  return {
    status: "ok",
    viewer: {
      role: profile.role as Role,
      fullName: profile.full_name,
      email: user.email ?? null,
      isDemo: false,
    },
  };
});

/** Use at the top of any protected page or layout. Redirects when not allowed. */
export async function requireViewer(locale: string): Promise<Viewer> {
  const state = await getState();
  if (state.status === "ok") return state.viewer;
  if (state.status === "invalid") {
    redirect({ href: { pathname: "/login", query: { error: "inactive" } }, locale });
  }
  redirect({ href: "/login", locale });
  // redirect() never returns; this satisfies the type checker.
  throw new Error("unreachable");
}
