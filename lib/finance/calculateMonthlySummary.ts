import type {
  CategorySummary,
  MonthlySummary,
  MonthlySummaryInput,
  SubcategorySummary,
} from "@/types/finance";

const emptySummary: MonthlySummary = {
  byCategory: [],
  bySubcategory: [],
  expandedBalance: 0,
  investment: 0,
  livingExpenses: 0,
  monthlySavings: 0,
  normalIncome: 0,
  totalExpenses: 0,
  travelIncome: 0,
  travelSavings: 0,
};

function sortByAmountDesc<T extends { amount: number }>(items: Iterable<T>) {
  return Array.from(items).sort((left, right) => right.amount - left.amount);
}

// Transfers are ignored in the monthly summary because they do not represent income or expenses.
export function calculateMonthlySummary(
  transactions: readonly MonthlySummaryInput[],
): MonthlySummary {
  const byCategory = new Map<string, CategorySummary>();
  const bySubcategory = new Map<string, SubcategorySummary>();

  const summary = transactions.reduce<MonthlySummary>((totals, transaction) => {
    if (transaction.type === "income") {
      if (transaction.is_travel_income) {
        totals.travelIncome += transaction.amount;
      } else {
        totals.normalIncome += transaction.amount;
      }

      return totals;
    }

    if (transaction.type !== "expense") {
      return totals;
    }

    if (transaction.is_investment) {
      totals.investment += transaction.amount;
    } else {
      totals.livingExpenses += transaction.amount;
    }

    const categoryId = transaction.categoryId ?? null;
    const categoryName = transaction.categoryName ?? "Sin categoria";
    const categoryKey = `${categoryId ?? "null"}:${categoryName}`;
    const categoryItem = byCategory.get(categoryKey) ?? {
      amount: 0,
      categoryId,
      categoryName,
    };

    categoryItem.amount += transaction.amount;
    byCategory.set(categoryKey, categoryItem);

    const subcategoryId = transaction.subcategoryId ?? null;
    const subcategoryName = transaction.subcategoryName ?? "Sin subcategoria";
    const subcategoryKey = `${subcategoryId ?? "null"}:${subcategoryName}:${categoryName}`;
    const subcategoryItem = bySubcategory.get(subcategoryKey) ?? {
      amount: 0,
      categoryName,
      subcategoryId,
      subcategoryName,
    };

    subcategoryItem.amount += transaction.amount;
    bySubcategory.set(subcategoryKey, subcategoryItem);

    return totals;
  }, structuredClone(emptySummary));

  summary.totalExpenses = summary.livingExpenses + summary.investment;
  summary.monthlySavings =
    summary.normalIncome - summary.livingExpenses - summary.investment;
  summary.travelSavings = summary.travelIncome;
  summary.expandedBalance =
    summary.normalIncome + summary.travelIncome - summary.totalExpenses;
  summary.byCategory = sortByAmountDesc(byCategory.values());
  summary.bySubcategory = sortByAmountDesc(bySubcategory.values());

  return summary;
}
