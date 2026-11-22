import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

type Messages = { [key: string]: string | Messages };

/** Deep merge: keys in `extra` add to or override keys in `base`. */
function merge(base: Messages, extra: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    const current = out[key];
    out[key] =
      typeof value === "object" && typeof current === "object"
        ? merge(current, value)
        : value;
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const base: Messages = (await import(`../../messages/${locale}.json`)).default;
  const access: Messages = (
    await import(`../../messages/${locale}.access.json`)
  ).default;

  return { locale, messages: merge(base, access) };
});
