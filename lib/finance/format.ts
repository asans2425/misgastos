import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatMonthLabel(date: Date) {
  return format(date, "LLLL yyyy", { locale: es });
}

export function formatMoney(
  value: number,
  options: {
    currency?: string;
    locale?: string;
  } = {},
) {
  const { currency = "EUR", locale = "es-ES" } = options;

  return new Intl.NumberFormat(locale, {
    currency,
    style: "currency",
  }).format(value);
}

export function formatCurrency(value: number) {
  return formatMoney(value);
}

export function getMonthKey(value: Date | string = new Date()) {
  if (typeof value === "string" && /^[0-9]{4}-[0-9]{2}$/.test(value)) {
    return value;
  }

  const date = typeof value === "string" ? parseISO(value) : value;

  return format(date, "yyyy-MM");
}
