import type { Role } from "@/types";

const ROLES: Role[] = ["super_admin", "teacher", "student"];

/**
 * DEMO ONLY. Picks which role's navigation to preview.
 * Real roles come from the database and are enforced by RLS in Step 4.
 */
export function getDemoRole(): Role {
  const value = process.env.NEXT_PUBLIC_DEMO_ROLE as Role | undefined;
  return value && ROLES.includes(value) ? value : "student";
}
