import { format, parseISO } from "date-fns";

// Example: getMonthKey(new Date("2026-06-11")) => "2026-06"
export function getMonthKey(value: Date | string = new Date()) {
  if (typeof value === "string" && /^[0-9]{4}-[0-9]{2}$/.test(value)) {
    return value;
  }

  const date = typeof value === "string" ? parseISO(value) : value;

  return format(date, "yyyy-MM");
}
