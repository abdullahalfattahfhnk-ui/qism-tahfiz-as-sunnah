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

function back(locale: string, result: Result): never {
  return redirect({
    href: { pathname: "/admin/users", query: { result } },
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
  if (!(await isSuperAdmin())) back(locale, "error");

  const parsed = approveSchema.safeParse({
    userId: formData.get("userId"),
    classId: formData.get("classId"),
    role: formData.get("role"),
    studentCode: formData.get("studentCode") ?? "",
  });
  if (!parsed.success) back(locale, "error");
  const { userId, classId, role, studentCode } = parsed.data!;

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_approve_user", {
    p_user: userId,
    p_role: role,
    p_class: classId,
    p_student_code: studentCode || null,
  });

  if (error) {
    back(locale, error.message.toLowerCase().includes("verified") ? "unverified" : "error");
  }
  back(locale, "approved");
}

export async function rejectUser(formData: FormData): Promise<void> {
  const locale = safeLocale(formData.get("locale"));
  if (!(await isSuperAdmin())) back(locale, "error");

  const parsed = rejectSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) back(locale, "error");

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_reject_user", {
    p_user: parsed.data!.userId,
  });

  back(locale, error ? "error" : "rejected");
}
