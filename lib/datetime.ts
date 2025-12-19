// lib/datetime.ts
export const IST_TIMEZONE = "Asia/Kolkata";

type FormatOpts = {
  dateOnly?: boolean;
  withSeconds?: boolean;
  includeTZ?: boolean;
};

export function formatIST(value: any, opts: FormatOpts = {}) {
  if (!value) return "N/A";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  const { dateOnly = false, withSeconds = false, includeTZ = true } = opts;

  const parts: Intl.DateTimeFormatOptions = dateOnly
    ? {
        timeZone: IST_TIMEZONE,
        year: "numeric",
        month: "short",
        day: "2-digit",
      }
    : {
        timeZone: IST_TIMEZONE,
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        ...(withSeconds ? { second: "2-digit" } : {}),
        hour12: true,
      };

  const s = new Intl.DateTimeFormat("en-IN", parts).format(d);
  return includeTZ && !dateOnly ? `${s} IST` : s;
}

export function prettyStatus(s?: string) {
  return String(s || "")
    .replaceAll("_", " ")
    .trim();
}
