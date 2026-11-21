/**
 * DEMO DATA ONLY. Nothing here comes from the database.
 * Display text lives in messages/*.json under the "demo" namespace.
 * Replaced by Supabase queries in Step 4.
 */
import { getNow, toMinutes } from "./time";

export type DemoSubject = "hadith" | "arabic" | "fiqh" | "sirah" | "tajweed";
export type DemoPerson = "abdullah" | "ibrahim" | "yusuf" | "admin";

/* ---------- Schedule ---------- */

/** Saturday to Thursday. 0 = Sunday ... 6 = Saturday. */
export const SCHOOL_DAYS = [6, 0, 1, 2, 3, 4] as const;

const PERIODS = [
  ["08:00", "08:45"],
  ["08:50", "09:35"],
  ["10:00", "10:45"],
  ["10:50", "11:35"],
] as const;

type Slot = { subject: DemoSubject; teacher: DemoPerson; room: number };

const PLAN: Record<number, Slot[]> = {
  6: [
    { subject: "hadith", teacher: "abdullah", room: 1 },
    { subject: "arabic", teacher: "ibrahim", room: 1 },
    { subject: "tajweed", teacher: "yusuf", room: 2 },
    { subject: "fiqh", teacher: "abdullah", room: 1 },
  ],
  0: [
    { subject: "arabic", teacher: "ibrahim", room: 1 },
    { subject: "hadith", teacher: "abdullah", room: 1 },
    { subject: "sirah", teacher: "yusuf", room: 2 },
    { subject: "tajweed", teacher: "yusuf", room: 2 },
  ],
  1: [
    { subject: "hadith", teacher: "abdullah", room: 1 },
    { subject: "fiqh", teacher: "abdullah", room: 1 },
    { subject: "arabic", teacher: "ibrahim", room: 1 },
    { subject: "sirah", teacher: "yusuf", room: 2 },
  ],
  2: [
    { subject: "tajweed", teacher: "yusuf", room: 2 },
    { subject: "hadith", teacher: "abdullah", room: 1 },
    { subject: "arabic", teacher: "ibrahim", room: 1 },
    { subject: "fiqh", teacher: "abdullah", room: 1 },
  ],
  3: [
    { subject: "hadith", teacher: "abdullah", room: 1 },
    { subject: "sirah", teacher: "yusuf", room: 2 },
    { subject: "fiqh", teacher: "abdullah", room: 1 },
    { subject: "arabic", teacher: "ibrahim", room: 1 },
  ],
  4: [
    { subject: "arabic", teacher: "ibrahim", room: 1 },
    { subject: "hadith", teacher: "abdullah", room: 1 },
    { subject: "tajweed", teacher: "yusuf", room: 2 },
  ],
};

export type ScheduleEntry = Slot & { day: number; start: string; end: string };

export const DEMO_SCHEDULE: ScheduleEntry[] = SCHOOL_DAYS.flatMap((day) =>
  PLAN[day].map((slot, i) => ({
    ...slot,
    day,
    start: PERIODS[i][0],
    end: PERIODS[i][1],
  })),
);

export const entriesForDay = (day: number) =>
  DEMO_SCHEDULE.filter((e) => e.day === day);

export type ClassState = "past" | "current" | "upcoming";

export function classState(
  entry: ScheduleEntry,
  nowMinutes: number,
): ClassState {
  if (toMinutes(entry.end) <= nowMinutes) return "past";
  if (toMinutes(entry.start) <= nowMinutes) return "current";
  return "upcoming";
}

/** The next class that has not started yet. offset = days from today. */
export function getNextClass(now: ReturnType<typeof getNow>) {
  for (let offset = 0; offset < 7; offset++) {
    const day = (now.day + offset) % 7;
    const entries = entriesForDay(day);
    const entry =
      offset === 0
        ? entries.find((e) => toMinutes(e.start) > now.minutes)
        : entries[0];
    if (entry) return { entry, offset };
  }
  return null;
}

/* ---------- Announcements ---------- */

export type DemoAnnouncement = {
  id: "a1" | "a2" | "a3" | "a4";
  daysAgo: number;
  category: "general" | "academic" | "event";
  pinned?: boolean;
  author: DemoPerson;
};

export const DEMO_ANNOUNCEMENTS: DemoAnnouncement[] = [
  { id: "a1", daysAgo: 6, category: "general", pinned: true, author: "admin" },
  { id: "a2", daysAgo: 1, category: "academic", author: "abdullah" },
  { id: "a3", daysAgo: 2, category: "event", author: "admin" },
  { id: "a4", daysAgo: 4, category: "general", author: "ibrahim" },
];

/** Pinned first, then newest first. */
export const sortedAnnouncements = () =>
  [...DEMO_ANNOUNCEMENTS].sort(
    (a, b) =>
      Number(!!b.pinned) - Number(!!a.pinned) || a.daysAgo - b.daysAgo,
  );

/* ---------- Assignments ---------- */

export type DemoAssignment = {
  id: "s1" | "s2" | "s3" | "s4" | "s5";
  subject: DemoSubject;
  /** Negative = already past. */
  dueInDays: number;
  status: "pending" | "submitted";
};

export const DEMO_ASSIGNMENTS: DemoAssignment[] = [
  { id: "s5", subject: "tajweed", dueInDays: -3, status: "pending" },
  { id: "s1", subject: "hadith", dueInDays: 2, status: "pending" },
  { id: "s2", subject: "arabic", dueInDays: 4, status: "pending" },
  { id: "s3", subject: "fiqh", dueInDays: 6, status: "pending" },
  { id: "s4", subject: "sirah", dueInDays: -1, status: "submitted" },
];

/* ---------- Study ---------- */

export const DEMO_STUDY: { subject: DemoSubject; teacher: DemoPerson; total: number; done: number }[] = [
  { subject: "hadith", teacher: "abdullah", total: 40, done: 18 },
  { subject: "arabic", teacher: "ibrahim", total: 30, done: 12 },
  { subject: "fiqh", teacher: "abdullah", total: 24, done: 9 },
  { subject: "sirah", teacher: "yusuf", total: 20, done: 20 },
  { subject: "tajweed", teacher: "yusuf", total: 16, done: 7 },
];

/* ---------- Library ---------- */

export type ResourceType = "book" | "notes" | "audio" | "worksheet";

export type DemoResource = {
  id: "r1" | "r2" | "r3" | "r4" | "r5" | "r6" | "r7" | "r8";
  subject: DemoSubject;
  type: ResourceType;
  format: "PDF" | "MP3";
  sizeMb: number;
  daysAgo: number;
};

export const DEMO_RESOURCES: DemoResource[] = [
  { id: "r1", subject: "hadith", type: "notes", format: "PDF", sizeMb: 1.2, daysAgo: 3 },
  { id: "r2", subject: "arabic", type: "worksheet", format: "PDF", sizeMb: 0.8, daysAgo: 5 },
  { id: "r3", subject: "fiqh", type: "notes", format: "PDF", sizeMb: 1.5, daysAgo: 8 },
  { id: "r4", subject: "sirah", type: "book", format: "PDF", sizeMb: 4.2, daysAgo: 12 },
  { id: "r5", subject: "tajweed", type: "audio", format: "MP3", sizeMb: 12, daysAgo: 14 },
  { id: "r6", subject: "hadith", type: "book", format: "PDF", sizeMb: 6.1, daysAgo: 20 },
  { id: "r7", subject: "arabic", type: "book", format: "PDF", sizeMb: 3.3, daysAgo: 25 },
  { id: "r8", subject: "tajweed", type: "notes", format: "PDF", sizeMb: 0.6, daysAgo: 30 },
];

/* ---------- Students & admin ---------- */

export const DEMO_STUDENTS = [
  "hamza", "bilal", "salman", "yahya", "idris", "zayd", "anas", "mikail",
].map((key, i) => ({ key, studentId: `S-${String(i + 1).padStart(3, "0")}` }));

export const DEMO_TEACHER_COUNT = 3;

export const DEMO_ACTIVITY: { kind: "posted" | "uploaded" | "submitted"; person: DemoPerson; daysAgo: number }[] = [
  { kind: "submitted", person: "admin", daysAgo: 0 },
  { kind: "posted", person: "abdullah", daysAgo: 1 },
  { kind: "uploaded", person: "ibrahim", daysAgo: 3 },
];
