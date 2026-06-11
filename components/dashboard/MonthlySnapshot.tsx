import { StatCard } from "@/components/ui/StatCard";

export function MonthlySnapshot() {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <StatCard label="Ingresos" tone="positive" value="--" />
      <StatCard label="Gastos" tone="danger" value="--" />
      <StatCard label="Balance" tone="accent" value="--" />
    </section>
  );
}
