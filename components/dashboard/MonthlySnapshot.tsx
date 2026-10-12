import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { formatMoney } from "@/lib/finance";

type MonthlySnapshotProps = Readonly<{
  availableAfterLivingExpenses: number;
  expandedBalance: number;
  includeInvestment: boolean;
  investment: number;
  livingExpenses: number;
  normalIncome: number;
  travelIncome: number;
  totalExpenses: number;
}>;

export function MonthlySnapshot({
  availableAfterLivingExpenses,
  expandedBalance,
  includeInvestment,
  investment,
  livingExpenses,
  normalIncome,
  travelIncome,
  totalExpenses,
}: MonthlySnapshotProps) {
  const totalIncome = normalIncome + travelIncome;

  return (
    <section className="grid min-w-0 grid-cols-3 gap-1.5 sm:gap-3">
      <DashboardMetricCard
        accent="emerald"
        label="Ingresos"
        value={formatMoney(totalIncome)}
      />
      <DashboardMetricCard
        accent="rose"
        label="Gastado"
        value={formatMoney(livingExpenses)}
      />
      {includeInvestment ? (
        <>
          <DashboardMetricCard
            accent="amber"
            label="Inversión"
            value={formatMoney(investment)}
          />
          <DashboardMetricCard
            accent="teal"
            label="Balance con inversión"
            value={formatMoney(expandedBalance)}
          />
          <DashboardMetricCard
            accent="blue"
            label="Balance sin inversión"
            value={formatMoney(availableAfterLivingExpenses)}
          />
          <DashboardMetricCard
            accent="slate"
            label="Gastos totales"
            value={formatMoney(totalExpenses)}
          />
        </>
      ) : (
        <DashboardMetricCard
          accent="teal"
          label="Balance"
          value={formatMoney(availableAfterLivingExpenses)}
        />
      )}
    </section>
  );
}
