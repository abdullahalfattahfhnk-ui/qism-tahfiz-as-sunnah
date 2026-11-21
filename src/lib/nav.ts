import {
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Library,
  Megaphone,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types";

export type NavItem = {
  /** Key inside the "nav" translation namespace. */
  key: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
};

const ALL: Role[] = ["super_admin", "teacher", "student"];

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ALL },
  { key: "study", href: "/study", icon: GraduationCap, roles: ALL },
  { key: "library", href: "/library", icon: Library, roles: ALL },
  { key: "assignments", href: "/assignments", icon: ClipboardList, roles: ALL },
  { key: "announcements", href: "/announcements", icon: Megaphone, roles: ALL },
  { key: "schedule", href: "/schedule", icon: CalendarDays, roles: ALL },
  { key: "students", href: "/students", icon: Users, roles: ["super_admin", "teacher"] },
  { key: "profile", href: "/profile", icon: UserRound, roles: ALL },
  { key: "admin", href: "/admin", icon: ShieldCheck, roles: ["super_admin"] },
];
