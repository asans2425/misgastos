import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { formatMoney } from "@/lib/finance";

type MonthlySnapshotProps = Readonly<{
  expandedBalance: number;
  investment: number;
  livingExpenses: number;
  monthlySavings: number;
  normalIncome: number;
  totalExpenses: number;
}>;

export function MonthlySnapshot({
  expandedBalance,
  investment,
  livingExpenses,
  monthlySavings,
  normalIncome,
  totalExpenses,
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
        helper="Ingresos menos gastos"
        label="Ahorro del mes"
        value={formatMoney(monthlySavings)}
      />
      <DashboardMetricCard
        accent="amber"
        helper="No cuenta como gasto ordinario"
        label="Inversion del mes"
        value={formatMoney(investment)}
      />
      <DashboardMetricCard
        accent="emerald"
        helper="Todo entra en cuenta principal"
        label="Ingresos"
        value={formatMoney(normalIncome)}
      />
      <DashboardMetricCard
        accent="slate"
        helper="Gasto ordinario e inversion"
        label="Gastos totales"
        value={formatMoney(totalExpenses)}
      />
      <DashboardMetricCard
        accent="blue"
        helper="Resultado global"
        label="Balance del mes"
        value={formatMoney(expandedBalance)}
      />
    </section>
  );
}
