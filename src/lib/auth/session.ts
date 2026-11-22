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

/** Why a signed-in account has no access yet. */
export type InactiveReason = "pending" | "rejected" | "suspended";

export type AccountState =
  | { status: "ok"; viewer: Viewer }
  | { status: "anonymous" }
  | { status: "inactive"; reason: InactiveReason; fullName: string | null };

const ROLES: Role[] = ["super_admin", "teacher", "student"];

async function loadAuth() {
  try {
    const supabase = await createClient();
    // getUser() asks the Supabase Auth server to verify the session.
    const { data } = await supabase.auth.getUser();
    return { supabase, user: data.user };
  } catch {
    // Supabase unreachable or misconfigured: treat as signed out.
    return null;
  }
}

/** Resolved once per request. The role comes from the database, never from the browser. */
export const getAccountState = cache(async (): Promise<AccountState> => {
  if (!getSupabaseEnv()) {
    return {
      status: "ok",
      viewer: { role: getDemoRole(), fullName: null, email: null, isDemo: true },
    };
  }

  const auth = await loadAuth();
  if (!auth || !auth.user) return { status: "anonymous" };
  const { supabase, user } = auth;

  // A pending account may read only its own profile row (RLS allows exactly that).
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_active, approval_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return { status: "inactive", reason: "pending", fullName: null };
  }
  if (profile.approval_status === "rejected") {
    return { status: "inactive", reason: "rejected", fullName: profile.full_name };
  }
  if (profile.approval_status !== "approved") {
    return { status: "inactive", reason: "pending", fullName: profile.full_name };
  }
  if (!profile.is_active || !ROLES.includes(profile.role)) {
    return { status: "inactive", reason: "suspended", fullName: profile.full_name };
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
  const state = await getAccountState();
  if (state.status === "ok") return state.viewer;
  if (state.status === "inactive") redirect({ href: "/waiting", locale });
  redirect({ href: "/login", locale });
  // redirect() never returns; this satisfies the type checker.
  throw new Error("unreachable");
}
