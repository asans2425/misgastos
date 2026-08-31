import assert from "node:assert/strict";
import test from "node:test";
import { calculateAnalysis } from "../lib/analysis/calculations.ts";
import type {
  AnalysisBucket,
  AnalysisBucketMovement,
  AnalysisRecurringItem,
  AnalysisTransaction,
  PeriodMonth,
} from "../lib/analysis/types.ts";

const selectedMonth: PeriodMonth = {
  end: "2026-08-30",
  key: "2026-08",
  label: "ago 2026",
  start: "2026-08-01",
};

const previousMonth: PeriodMonth = {
  end: "2026-07-31",
  key: "2026-07",
  label: "jul 2026",
  start: "2026-07-01",
};

function transaction(
  overrides: Partial<AnalysisTransaction> & {
    amount: number;
    id: string;
    type: AnalysisTransaction["type"];
  },
): AnalysisTransaction {
  return {
    amount: overrides.amount,
    categoryColor: null,
    categoryIcon: null,
    categoryId: "food",
    categoryName: "Comida",
    date: "2026-08-10",
    description: null,
    id: overrides.id,
    isInvestment: false,
    isRecurring: false,
    isReimbursement: false,
    merchant: null,
    monthKey: "2026-08",
    reimbursesTransactionId: null,
    recurringItemId: null,
    status: "confirmed",
    subcategoryId: "restaurant",
    subcategoryName: "Restaurante",
    type: overrides.type,
    ...overrides,
  };
}

function analyze({
  buckets = [],
  bucketMovements = [],
  recurringItems = [],
  transactions = [],
}: {
  buckets?: AnalysisBucket[];
  bucketMovements?: AnalysisBucketMovement[];
  recurringItems?: AnalysisRecurringItem[];
  transactions?: AnalysisTransaction[];
}) {
  return calculateAnalysis({
    buckets,
    bucketMovements,
    periodMonths: [selectedMonth],
    previousPeriodMonths: [previousMonth],
    recurringItems,
    selectedMonth,
    today: new Date("2026-08-10T12:00:00"),
    transactions,
  });
}

test("los reembolsos reducen el gasto neto de la categoria original", () => {
  const result = analyze({
    transactions: [
      transaction({ amount: 100, id: "expense-1", type: "expense" }),
      transaction({
        amount: 40,
        id: "refund-1",
        isReimbursement: true,
        reimbursesTransactionId: "expense-1",
        type: "income",
      }),
    ],
  });

  assert.equal(result.expenses.current, 60);
  assert.equal(result.categories[0].amount, 60);
});

test("un reembolso no cuenta como ingreso real", () => {
  const result = analyze({
    transactions: [
      transaction({
        amount: 2000,
        categoryId: "income",
        categoryName: "Ingresos",
        id: "salary",
        subcategoryId: "salary",
        subcategoryName: "Nomina",
        type: "income",
      }),
      transaction({
        amount: 40,
        id: "refund-1",
        isReimbursement: true,
        reimbursesTransactionId: "expense-1",
        type: "income",
      }),
    ],
  });

  assert.equal(result.income.current, 2000);
});

test("las aportaciones a huchas no son gasto estadistico", () => {
  const result = analyze({
    bucketMovements: [
      {
        amount: 500,
        bucketId: "bucket-1",
        date: "2026-08-05",
        monthKey: "2026-08",
        type: "contribution",
      },
    ],
  });

  assert.equal(result.expenses.current, 0);
});

test("las retiradas de huchas no son ingreso estadistico", () => {
  const result = analyze({
    bucketMovements: [
      {
        amount: 100,
        bucketId: "bucket-1",
        date: "2026-08-05",
        monthKey: "2026-08",
        type: "withdrawal",
      },
    ],
  });

  assert.equal(result.income.current, 0);
});

test("balance y tasa de ahorro usan ingresos reales y gastos netos", () => {
  const result = analyze({
    transactions: [
      transaction({ amount: 2000, id: "salary", type: "income" }),
      transaction({ amount: 800, id: "expense", type: "expense" }),
    ],
  });

  assert.equal(result.balance.current, 1200);
  assert.equal(result.savingsRate.current, 60);
});

test("si el periodo anterior fue cero no muestra porcentajes infinitos", () => {
  const result = analyze({
    transactions: [transaction({ amount: 50, id: "expense", type: "expense" })],
  });

  assert.equal(result.expenses.variation, null);
  assert.equal(result.expenses.trend, "new");
});

test("la proyeccion lineal escala por dias transcurridos", () => {
  const result = analyze({
    transactions: [transaction({ amount: 300, id: "expense", type: "expense" })],
  });

  assert.equal(result.projection?.projectedExpense, 900);
});
