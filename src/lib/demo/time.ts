/**
 * DEMO ONLY helpers. Times are shown in a fixed time zone for now;
 * a per-madrasa setting replaces this when the database is connected.
 */
export const DEMO_TIME_ZONE = "Asia/Dhaka";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** day: 0 = Sunday ... 6 = Saturday. minutes: since midnight. */
export function getNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DEMO_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return {
    date: now,
    day: WEEKDAYS.indexOf(get("weekday")),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function formatClock(locale: string, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, 0, 1, h, m)));
}

/** Localized weekday name. day: 0 = Sunday ... 6 = Saturday. */
export function weekdayName(locale: string, day: number) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, 0, 7 + day)));
}

/** Negative = past, positive = future. 0 reads as "today". */
export function relativeDays(locale: string, days: number) {
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
    days,
    "day",
  );
}

export function formatFullDate(locale: string, date: Date) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeZone: DEMO_TIME_ZONE,
  }).format(date);
}
