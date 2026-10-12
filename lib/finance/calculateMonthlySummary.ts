import type {
  CategorySummary,
  MonthlySummary,
  MonthlySummaryInput,
  SubcategorySummary,
} from "@/types/finance";

const emptySummary: MonthlySummary = {
  availableAfterLivingExpenses: 0,
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

function getCategoryKey(
  categoryId: string | null,
  categoryName: string,
) {
  return `${categoryId ?? "null"}:${categoryName}`;
}

function getSubcategoryKey(
  subcategoryId: string | null,
  subcategoryName: string,
  categoryName: string,
) {
  return `${subcategoryId ?? "null"}:${subcategoryName}:${categoryName}`;
}

function applyExpenseAmount(
  transaction: MonthlySummaryInput,
  amount: number,
  byCategory: Map<string, CategorySummary>,
  bySubcategory: Map<string, SubcategorySummary>,
) {
  const categoryId = transaction.categoryId ?? null;
  const categoryName = transaction.categoryName ?? "Sin categoria";
  const categoryKey = getCategoryKey(categoryId, categoryName);
  const categoryItem = byCategory.get(categoryKey) ?? {
    amount: 0,
    categoryId,
    categoryName,
  };

  categoryItem.amount += amount;
  byCategory.set(categoryKey, categoryItem);

  const subcategoryId = transaction.subcategoryId ?? null;
  const subcategoryName = transaction.subcategoryName ?? "Sin subcategoria";
  const subcategoryKey = getSubcategoryKey(
    subcategoryId,
    subcategoryName,
    categoryName,
  );
  const subcategoryItem = bySubcategory.get(subcategoryKey) ?? {
    amount: 0,
    categoryName,
    subcategoryId,
    subcategoryName,
  };

  subcategoryItem.amount += amount;
  bySubcategory.set(subcategoryKey, subcategoryItem);
}

// Transfers are ignored in the monthly summary because they do not represent income or expenses.
export function calculateMonthlySummary(
  transactions: readonly MonthlySummaryInput[],
): MonthlySummary {
  const byCategory = new Map<string, CategorySummary>();
  const bySubcategory = new Map<string, SubcategorySummary>();
  const expensesById = new Map(
    transactions
      .filter((transaction) => transaction.id && transaction.type === "expense")
      .map((transaction) => [transaction.id, transaction]),
  );

  const summary = transactions.reduce<MonthlySummary>((totals, transaction) => {
    if (transaction.type === "income") {
      if (transaction.is_reimbursement) {
        return totals;
      }

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

    applyExpenseAmount(
      transaction,
      transaction.amount,
      byCategory,
      bySubcategory,
    );

    return totals;
  }, structuredClone(emptySummary));

  for (const reimbursement of transactions) {
    if (
      !reimbursement.is_reimbursement ||
      !reimbursement.reimburses_transaction_id
    ) {
      continue;
    }

    const linkedExpense = expensesById.get(
      reimbursement.reimburses_transaction_id,
    );

    if (!linkedExpense) {
      continue;
    }

    if (linkedExpense.is_investment) {
      summary.investment -= reimbursement.amount;
    } else {
      summary.livingExpenses -= reimbursement.amount;
    }

    applyExpenseAmount(
      linkedExpense,
      -reimbursement.amount,
      byCategory,
      bySubcategory,
    );
  }

  summary.totalExpenses = summary.livingExpenses + summary.investment;
  summary.monthlySavings =
    summary.normalIncome - summary.livingExpenses - summary.investment;
  summary.availableAfterLivingExpenses =
    summary.normalIncome + summary.travelIncome - summary.livingExpenses;
  summary.travelSavings = summary.travelIncome;
  summary.expandedBalance =
    summary.normalIncome + summary.travelIncome - summary.totalExpenses;
  summary.byCategory = sortByAmountDesc(
    Array.from(byCategory.values()).filter((item) => item.amount !== 0),
  );
  summary.bySubcategory = sortByAmountDesc(
    Array.from(bySubcategory.values()).filter((item) => item.amount !== 0),
  );

  return summary;
}
