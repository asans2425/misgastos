import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatMonthLabel(date: Date) {
  return format(date, "LLLL yyyy", { locale: es });
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    currency: "EUR",
    style: "currency",
  }).format(value);
}
