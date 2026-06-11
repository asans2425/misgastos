import type { MonthlySummary, SummaryTransaction } from "@/types/finance";

const emptySummary: MonthlySummary = {
  expandedBalance: 0,
  investment: 0,
  livingExpenses: 0,
  monthlySavings: 0,
  normalIncome: 0,
  totalExpenses: 0,
  travelIncome: 0,
  travelSavings: 0,
};

export function calculateMonthlySummary(
  transactions: readonly SummaryTransaction[],
): MonthlySummary {
  const summary = transactions.reduce<MonthlySummary>(
    (totals, transaction) => {
      if (transaction.type === "income") {
        if (transaction.is_travel_income) {
          totals.travelIncome += transaction.amount;
        } else {
          totals.normalIncome += transaction.amount;
        }
      }

      if (transaction.type === "expense") {
        if (transaction.is_investment) {
          totals.investment += transaction.amount;
        } else {
          totals.livingExpenses += transaction.amount;
        }
      }

      return totals;
    },
    { ...emptySummary },
  );

  summary.monthlySavings =
    summary.normalIncome - summary.livingExpenses - summary.investment;
  summary.travelSavings = summary.travelIncome;
  summary.totalExpenses = summary.livingExpenses + summary.investment;
  summary.expandedBalance =
    summary.normalIncome + summary.travelIncome - summary.totalExpenses;

  return summary;
}
