import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { formatMoney } from "@/lib/finance";

type MonthlySnapshotProps = Readonly<{
  investment: number;
  livingExpenses: number;
  monthlySavings: number;
  normalIncome: number;
  travelIncome: number;
  travelSavings: number;
}>;

export function MonthlySnapshot({
  investment,
  livingExpenses,
  monthlySavings,
  normalIncome,
  travelIncome,
  travelSavings,
}: MonthlySnapshotProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <DashboardMetricCard
        accent="rose"
        helper="Gasto ordinario"
        label="Gastado este mes"
        value={formatMoney(livingExpenses)}
      />
      <DashboardMetricCard
        accent="teal"
        helper="Ahorro calculado"
        label="AHORROS del mes"
        value={formatMoney(monthlySavings)}
      />
      <DashboardMetricCard
        accent="blue"
        helper="Ingresos destinados a viajes"
        label="VIAJES del mes"
        value={formatMoney(travelSavings)}
      />
      <DashboardMetricCard
        accent="amber"
        helper="No cuenta como gasto ordinario"
        label="Inversion del mes"
        value={formatMoney(investment)}
      />
      <DashboardMetricCard
        accent="emerald"
        helper="Ingresos del dia a dia"
        label="Ingresos normales"
        value={formatMoney(normalIncome)}
      />
      <DashboardMetricCard
        accent="blue"
        helper="Clases, webs y extras de viajes"
        label="Ingresos viajes"
        value={formatMoney(travelIncome)}
      />
    </section>
  );
}
