import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatMonthLabel(date: Date) {
  return format(date, "LLLL yyyy", { locale: es });
}

export function formatShortMonthLabel(date: Date) {
  return format(date, "LLL yyyy", { locale: es }).replace(".", "");
}

export function formatRangeDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

// Example: formatMoney(1234.5) => "1.234,50 €"
export function formatMoney(value: number) {
  return new Intl.NumberFormat("es-ES", {
    currency: "EUR",
    style: "currency",
  }).format(value);
}
