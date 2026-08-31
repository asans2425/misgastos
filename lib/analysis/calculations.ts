import type {
  AnalysisBucket,
  AnalysisBucketMovement,
  AnalysisRecurringItem,
  AnalysisResult,
  AnalysisTransaction,
  CategoryAnalysis,
  CategoryComparisonItem,
  CategoryEvolutionItem,
  DailySpending,
  FixedVariableAnalysis,
  MonthlyTrendPoint,
  PeriodMonth,
  SpendingProjection,
  SubcategoryAnalysis,
  TopExpense,
} from "./types";

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function percent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 1000) / 10;
}

function compareValue(current: number, previous: number | null) {
  if (previous === null) {
    return {
      current,
      previous,
      trend: null,
      variation: null,
    };
  }

  if (previous === 0) {
    return {
      current,
      previous,
      trend: current > 0 ? ("new" as const) : ("flat" as const),
      variation: null,
    };
  }

  const variation = ((current - previous) / Math.abs(previous)) * 100;
  const roundedVariation = Math.round(variation * 10) / 10;

  return {
    current,
    previous,
    trend:
      Math.abs(roundedVariation) < 1
        ? ("flat" as const)
        : roundedVariation > 0
          ? ("up" as const)
          : ("down" as const),
    variation: roundedVariation,
  };
}

function getTransactionTitle(transaction: AnalysisTransaction) {
  return (
    transaction.description ||
    transaction.merchant ||
    transaction.subcategoryName ||
    transaction.categoryName ||
    "Movimiento"
  );
}

function makeEmptyMonth(month: PeriodMonth): MonthlyTrendPoint {
  return {
    balance: 0,
    expenses: 0,
    income: 0,
    label: month.label,
    month: month.key,
    savingsRate: 0,
  };
}

function addExpenseToCategory(
  categories: Map<string, CategoryAnalysis>,
  transaction: AnalysisTransaction,
  amount: number,
) {
  const categoryKey = transaction.categoryId ?? `name:${transaction.categoryName}`;
  const category = categories.get(categoryKey) ?? {
    amount: 0,
    categoryColor: transaction.categoryColor,
    categoryIcon: transaction.categoryIcon,
    categoryId: transaction.categoryId,
    categoryName: transaction.categoryName,
    percent: 0,
    subcategories: [],
  };
  const subcategoryKey =
    transaction.subcategoryId ?? `name:${transaction.subcategoryName}`;
  const subcategory =
    category.subcategories.find(
      (item) =>
        (item.subcategoryId ?? `name:${item.subcategoryName}`) ===
        subcategoryKey,
    ) ??
    ({
      amount: 0,
      subcategoryId: transaction.subcategoryId,
      subcategoryName: transaction.subcategoryName,
    } satisfies SubcategoryAnalysis);

  category.amount = roundMoney(category.amount + amount);
  subcategory.amount = roundMoney(subcategory.amount + amount);

  if (!category.subcategories.includes(subcategory)) {
    category.subcategories.push(subcategory);
  }

  categories.set(categoryKey, category);
}

function calculateMonthSummary(
  monthKey: string,
  transactions: readonly AnalysisTransaction[],
) {
  const months = new Map<string, MonthlyTrendPoint>([
    [
      monthKey,
      {
        balance: 0,
        expenses: 0,
        income: 0,
        label: monthKey,
        month: monthKey,
        savingsRate: 0,
      },
    ],
  ]);
  const categories = new Map<string, CategoryAnalysis>();
  const expensesById = new Map(
    transactions
      .filter((transaction) => transaction.type === "expense")
      .map((transaction) => [transaction.id, transaction]),
  );

  for (const transaction of transactions) {
    if (transaction.monthKey !== monthKey) {
      continue;
    }

    const month = months.get(monthKey);

    if (!month) {
      continue;
    }

    if (transaction.type === "income") {
      if (!transaction.isReimbursement) {
        month.income = roundMoney(month.income + transaction.amount);
      }
      continue;
    }

    if (transaction.type !== "expense") {
      continue;
    }

    month.expenses = roundMoney(month.expenses + transaction.amount);
    addExpenseToCategory(categories, transaction, transaction.amount);
  }

  for (const reimbursement of transactions) {
    if (
      !reimbursement.isReimbursement ||
      !reimbursement.reimbursesTransactionId
    ) {
      continue;
    }

    const linkedExpense = expensesById.get(reimbursement.reimbursesTransactionId);

    if (!linkedExpense || linkedExpense.monthKey !== monthKey) {
      continue;
    }

    const month = months.get(monthKey);

    if (!month) {
      continue;
    }

    month.expenses = roundMoney(Math.max(0, month.expenses - reimbursement.amount));
    addExpenseToCategory(categories, linkedExpense, -reimbursement.amount);
  }

  const month = months.get(monthKey) ?? makeEmptyMonth({
    end: "",
    key: monthKey,
    label: monthKey,
    start: "",
  });

  month.balance = roundMoney(month.income - month.expenses);
  month.savingsRate = month.income > 0 ? percent(month.balance, month.income) : 0;

  const categoryList = Array.from(categories.values())
    .map((category) => ({
      ...category,
      amount: roundMoney(Math.max(0, category.amount)),
      percent: percent(category.amount, month.expenses),
      subcategories: category.subcategories
        .map((subcategory) => ({
          ...subcategory,
          amount: roundMoney(Math.max(0, subcategory.amount)),
        }))
        .filter((subcategory) => subcategory.amount > 0)
        .sort((left, right) => right.amount - left.amount),
    }))
    .filter((category) => category.amount > 0)
    .sort((left, right) => right.amount - left.amount);

  return { categories: categoryList, month };
}

function calculateMonthlyTrend(
  months: readonly PeriodMonth[],
  transactions: readonly AnalysisTransaction[],
) {
  return months.map((month) => {
    const summary = calculateMonthSummary(month.key, transactions).month;

    return {
      ...summary,
      label: month.label,
    };
  });
}

function calculateComparison(
  currentCategories: readonly CategoryAnalysis[],
  previousCategories: readonly CategoryAnalysis[],
) {
  const previousByName = new Map(
    previousCategories.map((category) => [category.categoryName, category]),
  );

  return currentCategories
    .map<CategoryComparisonItem>((category) => {
      const previous = previousByName.get(category.categoryName)?.amount ?? 0;
      const variation =
        previous >= 10 ? ((category.amount - previous) / previous) * 100 : null;

      return {
        amountDelta: roundMoney(category.amount - previous),
        categoryName: category.categoryName,
        current: category.amount,
        previous,
        variation: variation === null ? null : Math.round(variation * 10) / 10,
      };
    })
    .filter((item) => item.current >= 10 || item.previous >= 10)
    .sort((left, right) => Math.abs(right.amountDelta) - Math.abs(left.amountDelta))
    .slice(0, 5);
}

function createEvolutionItem({
  id,
  kind,
  name,
  parentName,
  periodMonths,
}: {
  id: string;
  kind: "category" | "subcategory";
  name: string;
  parentName: string | null;
  periodMonths: readonly PeriodMonth[];
}): CategoryEvolutionItem {
  return {
    id,
    kind,
    name,
    parentName,
    points: periodMonths.map((month) => ({
      amount: 0,
      label: month.label,
      month: month.key,
    })),
    total: 0,
  };
}

function addExpenseToEvolution(
  evolutionById: Map<string, CategoryEvolutionItem>,
  periodMonthKeys: Set<string>,
  periodMonths: readonly PeriodMonth[],
  transaction: AnalysisTransaction,
  amount: number,
) {
  if (!periodMonthKeys.has(transaction.monthKey)) {
    return;
  }

  const categoryId = `category:${transaction.categoryId ?? transaction.categoryName}`;
  const subcategoryId = `subcategory:${
    transaction.subcategoryId ?? `${transaction.categoryName}:${transaction.subcategoryName}`
  }`;
  const items = [
    evolutionById.get(categoryId) ??
      createEvolutionItem({
        id: categoryId,
        kind: "category",
        name: transaction.categoryName,
        parentName: null,
        periodMonths,
      }),
    evolutionById.get(subcategoryId) ??
      createEvolutionItem({
        id: subcategoryId,
        kind: "subcategory",
        name: transaction.subcategoryName,
        parentName: transaction.categoryName,
        periodMonths,
      }),
  ];

  for (const item of items) {
    const point = item.points.find((entry) => entry.month === transaction.monthKey);

    if (!point) {
      continue;
    }

    point.amount = roundMoney(Math.max(0, point.amount + amount));
    item.total = roundMoney(Math.max(0, item.total + amount));
    evolutionById.set(item.id, item);
  }
}

function calculateCategoryEvolution(
  periodMonths: readonly PeriodMonth[],
  transactions: readonly AnalysisTransaction[],
) {
  const evolutionById = new Map<string, CategoryEvolutionItem>();
  const periodMonthKeys = new Set(periodMonths.map((month) => month.key));
  const expensesById = new Map(
    transactions
      .filter((transaction) => transaction.type === "expense")
      .map((transaction) => [transaction.id, transaction]),
  );

  for (const transaction of transactions) {
    if (transaction.type !== "expense" || transaction.isReimbursement) {
      continue;
    }

    addExpenseToEvolution(
      evolutionById,
      periodMonthKeys,
      periodMonths,
      transaction,
      transaction.amount,
    );
  }

  for (const reimbursement of transactions) {
    if (
      !reimbursement.isReimbursement ||
      !reimbursement.reimbursesTransactionId
    ) {
      continue;
    }

    const linkedExpense = expensesById.get(reimbursement.reimbursesTransactionId);

    if (!linkedExpense) {
      continue;
    }

    addExpenseToEvolution(
      evolutionById,
      periodMonthKeys,
      periodMonths,
      linkedExpense,
      -reimbursement.amount,
    );
  }

  return Array.from(evolutionById.values())
    .filter((item) => item.total > 0)
    .sort((left, right) => right.total - left.total);
}

function calculateFixedVariable(
  selectedMonth: string,
  transactions: readonly AnalysisTransaction[],
  recurringItems: readonly AnalysisRecurringItem[],
  selectedExpenses: number,
): FixedVariableAnalysis {
  const fixed = transactions
    .filter(
      (transaction) =>
        transaction.monthKey === selectedMonth &&
        transaction.type === "expense" &&
        !transaction.isReimbursement &&
        (transaction.isRecurring || Boolean(transaction.recurringItemId)),
    )
    .reduce((total, transaction) => total + transaction.amount, 0);
  const variable = Math.max(0, selectedExpenses - fixed);
  const committedFixedExpense = recurringItems
    .filter((item) => item.isActive && item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  return {
    committedFixedExpense: roundMoney(committedFixedExpense),
    fixed: roundMoney(fixed),
    fixedPercent: percent(fixed, selectedExpenses),
    variable: roundMoney(variable),
    variablePercent: percent(variable, selectedExpenses),
  };
}

function calculateProjection(
  selectedMonth: PeriodMonth,
  selectedMonthSummary: MonthlyTrendPoint,
  trend: readonly MonthlyTrendPoint[],
  today: Date,
) {
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  if (todayKey < selectedMonth.start || todayKey > selectedMonth.end) {
    return null;
  }

  const start = new Date(`${selectedMonth.start}T00:00:00`);
  const end = new Date(`${selectedMonth.end}T00:00:00`);
  const daysTotal =
    Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const daysElapsed =
    Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1;
  const averageDaily =
    daysElapsed > 0 ? selectedMonthSummary.expenses / daysElapsed : 0;
  const projectedExpense = roundMoney(averageDaily * daysTotal);
  const previousMonths = trend
    .filter((point) => point.month !== selectedMonth.key)
    .slice(-6)
    .filter((point) => point.expenses > 0);
  const sixMonthAverage =
    previousMonths.length > 0
      ? roundMoney(
          previousMonths.reduce((total, point) => total + point.expenses, 0) /
            previousMonths.length,
        )
      : 0;
  const diffPercent =
    sixMonthAverage > 0 ? ((projectedExpense - sixMonthAverage) / sixMonthAverage) * 100 : 0;
  const reliability = daysElapsed < 5 ? "low" : "normal";
  const status =
    sixMonthAverage === 0
      ? "unknown"
      : diffPercent > 10
        ? "above"
        : diffPercent < -10
          ? "below"
          : "inline";

  return {
    averageDaily: roundMoney(averageDaily),
    daysElapsed,
    daysTotal,
    projectedExpense,
    reliability,
    sixMonthAverage,
    status,
  } satisfies SpendingProjection;
}

function calculateDailySpending(
  selectedMonth: PeriodMonth,
  transactions: readonly AnalysisTransaction[],
) {
  const daily = new Map<string, DailySpending>();
  const expensesById = new Map(
    transactions
      .filter((transaction) => transaction.type === "expense")
      .map((transaction) => [transaction.id, transaction]),
  );

  for (const transaction of transactions) {
    if (
      transaction.date < selectedMonth.start ||
      transaction.date > selectedMonth.end ||
      transaction.type !== "expense" ||
      transaction.isReimbursement
    ) {
      continue;
    }

    const day = daily.get(transaction.date) ?? {
      amount: 0,
      date: transaction.date,
      transactions: [],
    };

    day.amount = roundMoney(day.amount + transaction.amount);
    day.transactions.push(transaction);
    daily.set(transaction.date, day);
  }

  for (const reimbursement of transactions) {
    if (
      !reimbursement.isReimbursement ||
      !reimbursement.reimbursesTransactionId
    ) {
      continue;
    }

    const linkedExpense = expensesById.get(reimbursement.reimbursesTransactionId);

    if (
      !linkedExpense ||
      linkedExpense.date < selectedMonth.start ||
      linkedExpense.date > selectedMonth.end
    ) {
      continue;
    }

    const day = daily.get(linkedExpense.date);

    if (day) {
      day.amount = roundMoney(Math.max(0, day.amount - reimbursement.amount));
    }
  }

  return Array.from(daily.values()).sort((left, right) =>
    left.date.localeCompare(right.date),
  );
}

function calculateTopExpenses(
  selectedMonth: PeriodMonth,
  transactions: readonly AnalysisTransaction[],
) {
  const reimbursementsByExpense = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.isReimbursement && transaction.reimbursesTransactionId) {
      reimbursementsByExpense.set(
        transaction.reimbursesTransactionId,
        (reimbursementsByExpense.get(transaction.reimbursesTransactionId) ?? 0) +
          transaction.amount,
      );
    }
  }

  return transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" &&
        !transaction.isReimbursement &&
        transaction.date >= selectedMonth.start &&
        transaction.date <= selectedMonth.end,
    )
    .map<TopExpense>((transaction) => ({
      amount: roundMoney(
        Math.max(0, transaction.amount - (reimbursementsByExpense.get(transaction.id) ?? 0)),
      ),
      categoryName: transaction.categoryName,
      date: transaction.date,
      description: getTransactionTitle(transaction),
      id: transaction.id,
      subcategoryName: transaction.subcategoryName,
    }))
    .filter((transaction) => transaction.amount > 0)
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 5);
}

function calculateBuckets(
  buckets: readonly AnalysisBucket[],
  movements: readonly AnalysisBucketMovement[],
  periodMonths: readonly PeriodMonth[],
) {
  const first = periodMonths[0];
  const last = periodMonths[periodMonths.length - 1];
  const movementByBucket = new Map<string, number>();

  for (const movement of movements) {
    if (
      !first ||
      !last ||
      movement.date < first.start ||
      movement.date > last.end
    ) {
      continue;
    }

    const delta =
      movement.type === "contribution" ? movement.amount : -movement.amount;

    movementByBucket.set(
      movement.bucketId,
      roundMoney((movementByBucket.get(movement.bucketId) ?? 0) + delta),
    );
  }

  const bucketRows = buckets.map((bucket) => ({
    ...bucket,
    movementDelta: movementByBucket.get(bucket.id) ?? 0,
  }));

  return {
    buckets: bucketRows,
    movementDelta: roundMoney(
      bucketRows.reduce((total, bucket) => total + bucket.movementDelta, 0),
    ),
    total: roundMoney(
      buckets.reduce((total, bucket) => total + bucket.currentBalance, 0),
    ),
  };
}

export function calculateAnalysis({
  buckets,
  bucketMovements,
  periodMonths,
  previousPeriodMonths,
  recurringItems,
  selectedMonth,
  today = new Date(),
  transactions,
}: {
  buckets: readonly AnalysisBucket[];
  bucketMovements: readonly AnalysisBucketMovement[];
  periodMonths: readonly PeriodMonth[];
  previousPeriodMonths: readonly PeriodMonth[];
  recurringItems: readonly AnalysisRecurringItem[];
  selectedMonth: PeriodMonth;
  today?: Date;
  transactions: readonly AnalysisTransaction[];
}): AnalysisResult {
  const { categories, month: selectedMonthSummary } = calculateMonthSummary(
    selectedMonth.key,
    transactions,
  );
  const trend = calculateMonthlyTrend(periodMonths, transactions);
  const previousTrend = calculateMonthlyTrend(previousPeriodMonths, transactions);
  const currentPeriodSummary = trend.reduce(
    (total, point) => ({
      balance: roundMoney(total.balance + point.balance),
      expenses: roundMoney(total.expenses + point.expenses),
      income: roundMoney(total.income + point.income),
      savingsRate: 0,
    }),
    { balance: 0, expenses: 0, income: 0, savingsRate: 0 },
  );
  const previousPeriodSummary = previousTrend.reduce(
    (total, point) => ({
      balance: roundMoney(total.balance + point.balance),
      expenses: roundMoney(total.expenses + point.expenses),
      income: roundMoney(total.income + point.income),
      savingsRate: 0,
    }),
    { balance: 0, expenses: 0, income: 0, savingsRate: 0 },
  );
  const previousSelectedMonth =
    previousPeriodMonths.length === 1
      ? calculateMonthSummary(previousPeriodMonths[0].key, transactions)
      : null;
  const comparison = calculateComparison(
    categories,
    previousSelectedMonth?.categories ?? [],
  );

  currentPeriodSummary.savingsRate =
    currentPeriodSummary.income > 0
      ? percent(currentPeriodSummary.balance, currentPeriodSummary.income)
      : 0;
  previousPeriodSummary.savingsRate =
    previousPeriodSummary.income > 0
      ? percent(previousPeriodSummary.balance, previousPeriodSummary.income)
      : 0;

  return {
    balance: compareValue(
      currentPeriodSummary.balance,
      previousTrend.length > 0 ? previousPeriodSummary.balance : null,
    ),
    buckets: calculateBuckets(buckets, bucketMovements, periodMonths),
    categories,
    categoryEvolution: calculateCategoryEvolution(periodMonths, transactions),
    comparison,
    dailySpending: calculateDailySpending(selectedMonth, transactions),
    expenses: compareValue(
      currentPeriodSummary.expenses,
      previousTrend.length > 0 ? previousPeriodSummary.expenses : null,
    ),
    fixedVariable: calculateFixedVariable(
      selectedMonth.key,
      transactions,
      recurringItems,
      selectedMonthSummary.expenses,
    ),
    income: compareValue(
      currentPeriodSummary.income,
      previousTrend.length > 0 ? previousPeriodSummary.income : null,
    ),
    periodMonths,
    projection: calculateProjection(selectedMonth, selectedMonthSummary, trend, today),
    savingsRate: compareValue(
      currentPeriodSummary.savingsRate,
      previousTrend.length > 0 ? previousPeriodSummary.savingsRate : null,
    ),
    savingsTrend: trend,
    selectedMonthSummary,
    topExpenses: calculateTopExpenses(selectedMonth, transactions),
    trend,
  };
}
