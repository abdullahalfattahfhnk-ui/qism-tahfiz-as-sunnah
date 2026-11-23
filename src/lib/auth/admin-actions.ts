"use server";

import { hasLocale } from "next-intl";
import { z } from "zod";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getAccountState } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const safeLocale = (value: unknown) =>
  typeof value === "string" && hasLocale(routing.locales, value)
    ? value
    : routing.defaultLocale;

const approveSchema = z.object({
  userId: z.string().uuid(),
  classId: z.string().uuid(),
  role: z.enum(["student", "teacher"]),
  studentCode: z.string().trim().max(30),
});

const rejectSchema = z.object({ userId: z.string().uuid() });

type Result = "approved" | "rejected" | "error" | "unverified";
type Failure = { message: string; code?: string };

/** Sends the Super Admin back to the list with a result (and, on errors, a technical detail). */
function back(locale: string, result: Result, failure?: Failure): never {
  const detail = failure
    ? `${failure.code ? `${failure.code}: ` : ""}${failure.message}`.slice(0, 160)
    : undefined;
  return redirect({
    href: {
      pathname: "/admin/users",
      query: detail ? { result, detail } : { result },
    },
    locale,
  });
}

/** Second check in the app. The database function checks again (Super Admin only). */
async function isSuperAdmin() {
  const state = await getAccountState();
  return state.status === "ok" && !state.viewer.isDemo && state.viewer.role === "super_admin";
}

export async function approveUser(formData: FormData): Promise<void> {
  const locale = safeLocale(formData.get("locale"));
  if (!(await isSuperAdmin())) back(locale, "error", { message: "not a Super Admin session" });

  const parsed = approveSchema.safeParse({
    userId: formData.get("userId"),
    classId: formData.get("classId"),
    role: formData.get("role"),
    studentCode: formData.get("studentCode") ?? "",
  });
  if (!parsed.success) {
    back(locale, "error", { message: `invalid form: ${parsed.error.issues[0]?.path.join(".")}` });
  }
  const { userId, classId, role, studentCode } = parsed.data!;

  let failure: Failure | null = null;
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_approve_user", {
      p_user: userId,
      p_role: role,
      p_class: classId,
      p_student_code: studentCode || null,
    });
    if (error) failure = { message: error.message, code: error.code };
  } catch (e) {
    failure = { message: e instanceof Error ? e.message : "unknown error" };
  }

  if (failure) {
    const unverified = failure.message.toLowerCase().includes("verified");
    back(locale, unverified ? "unverified" : "error", failure);
  }
  back(locale, "approved");
}

export async function rejectUser(formData: FormData): Promise<void> {
  const locale = safeLocale(formData.get("locale"));
  if (!(await isSuperAdmin())) back(locale, "error", { message: "not a Super Admin session" });

  const parsed = rejectSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) back(locale, "error", { message: "invalid form: userId" });

  let failure: Failure | null = null;
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_reject_user", {
      p_user: parsed.data!.userId,
    });
    if (error) failure = { message: error.message, code: error.code };
  } catch (e) {
    failure = { message: e instanceof Error ? e.message : "unknown error" };
  }

  if (failure) back(locale, "error", failure);
  back(locale, "rejected");
}
