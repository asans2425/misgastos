import type {
  Tables,
  TablesInsert,
  TransactionType,
} from "@/types/database";

export type { AccountType, DestinationType, TransactionType } from "@/types/database";

export type Transaction = Tables<"transactions">;
export type TransactionInsert = TablesInsert<"transactions">;

export type MonthlySummaryInput = {
  amount: number;
  categoryId: string | null;
  categoryName: string;
  is_investment: boolean;
  is_travel_income: boolean;
  subcategoryId: string | null;
  subcategoryName: string;
  type: TransactionType;
};

export type CategorySummary = {
  amount: number;
  categoryId: string | null;
  categoryName: string;
};

export type SubcategorySummary = {
  amount: number;
  categoryName: string;
  subcategoryId: string | null;
  subcategoryName: string;
};

export type MonthlySummary = {
  byCategory: CategorySummary[];
  bySubcategory: SubcategorySummary[];
  expandedBalance: number;
  investment: number;
  livingExpenses: number;
  monthlySavings: number;
  normalIncome: number;
  totalExpenses: number;
  travelIncome: number;
  travelSavings: number;
};

export type AddTransactionMode = "expense" | "income";
export type IncomeDestinationMode = "normal" | "travel";

export type TransactionDraft = {
  accountId: string;
  amount: number;
  categoryId?: string | null;
  date: string;
  description?: string;
  incomeDestination?: IncomeDestinationMode;
  isInvestment?: boolean;
  isTravelIncome?: boolean;
  subcategoryId?: string | null;
  type: AddTransactionMode;
};
