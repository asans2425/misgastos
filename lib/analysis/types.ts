import type { BucketMovementType, TransactionType } from "@/types/database";

export type AnalysisPeriod = "1" | "3" | "6" | "12";

export type AnalysisTransaction = {
  amount: number;
  categoryColor: string | null;
  categoryIcon: string | null;
  categoryId: string | null;
  categoryName: string;
  date: string;
  description: string | null;
  id: string;
  isInvestment: boolean;
  isReimbursement: boolean;
  isRecurring: boolean;
  merchant: string | null;
  monthKey: string;
  reimbursesTransactionId: string | null;
  recurringItemId: string | null;
  status: string;
  subcategoryId: string | null;
  subcategoryName: string;
  type: TransactionType;
};

export type AnalysisRecurringItem = {
  amount: number;
  id: string;
  isActive: boolean;
  name: string;
  type: "expense" | "income";
};

export type AnalysisBucket = {
  color: string | null;
  currentBalance: number;
  id: string;
  name: string;
};

export type AnalysisBucketMovement = {
  amount: number;
  bucketId: string;
  date: string;
  monthKey: string;
  type: BucketMovementType;
};

export type PeriodMonth = {
  end: string;
  key: string;
  label: string;
  start: string;
};

export type AnalysisKpi = {
  current: number;
  previous: number | null;
  trend: "down" | "flat" | "new" | "up" | null;
  variation: number | null;
};

export type CategoryAnalysis = {
  amount: number;
  categoryColor: string | null;
  categoryIcon: string | null;
  categoryId: string | null;
  categoryName: string;
  percent: number;
  subcategories: SubcategoryAnalysis[];
};

export type SubcategoryAnalysis = {
  amount: number;
  subcategoryId: string | null;
  subcategoryName: string;
};

export type MonthlyTrendPoint = {
  balance: number;
  expenses: number;
  income: number;
  label: string;
  month: string;
  savingsRate: number;
};

export type CategoryComparisonItem = {
  amountDelta: number;
  categoryName: string;
  current: number;
  previous: number;
  variation: number | null;
};

export type CategoryEvolutionPoint = {
  amount: number;
  label: string;
  month: string;
};

export type CategoryEvolutionItem = {
  id: string;
  kind: "category" | "subcategory";
  name: string;
  parentName: string | null;
  points: CategoryEvolutionPoint[];
  total: number;
};

export type FixedVariableAnalysis = {
  committedFixedExpense: number;
  fixed: number;
  fixedPercent: number;
  variable: number;
  variablePercent: number;
};

export type SpendingProjection = {
  averageDaily: number;
  daysElapsed: number;
  daysTotal: number;
  projectedExpense: number;
  reliability: "low" | "normal";
  sixMonthAverage: number;
  status: "above" | "below" | "inline" | "unknown";
};

export type DailySpending = {
  amount: number;
  date: string;
  transactions: AnalysisTransaction[];
};

export type TopExpense = {
  amount: number;
  categoryName: string;
  date: string;
  description: string;
  id: string;
  subcategoryName: string;
};

export type BucketsAnalysis = {
  buckets: Array<AnalysisBucket & { movementDelta: number }>;
  movementDelta: number;
  total: number;
};

export type AnalysisResult = {
  balance: AnalysisKpi;
  buckets: BucketsAnalysis;
  categories: readonly CategoryAnalysis[];
  categoryEvolution: readonly CategoryEvolutionItem[];
  comparison: readonly CategoryComparisonItem[];
  dailySpending: readonly DailySpending[];
  expenses: AnalysisKpi;
  fixedVariable: FixedVariableAnalysis;
  income: AnalysisKpi;
  periodMonths: readonly PeriodMonth[];
  projection: SpendingProjection | null;
  savingsRate: AnalysisKpi;
  savingsTrend: readonly MonthlyTrendPoint[];
  selectedMonthSummary: MonthlyTrendPoint;
  topExpenses: readonly TopExpense[];
  trend: readonly MonthlyTrendPoint[];
};
