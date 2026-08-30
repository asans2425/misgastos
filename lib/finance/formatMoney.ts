import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatMonthLabel(date: Date) {
  return format(date, "LLLL yyyy", { locale: es });
}

// Example: formatMoney(1234.5) => "1.234,50 €"
export function formatMoney(value: number) {
  return new Intl.NumberFormat("es-ES", {
    currency: "EUR",
    style: "currency",
  }).format(value);
}
