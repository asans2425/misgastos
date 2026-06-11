import type { Tables, TransactionType } from "@/types/database";

export type { AccountType, DestinationType, TransactionType } from "@/types/database";

export type Transaction = Tables<"transactions">;

export type SummaryTransaction = Pick<
  Transaction,
  "amount" | "is_investment" | "is_travel_income" | "type"
>;

export type MonthlySummary = {
  expandedBalance: number;
  investment: number;
  livingExpenses: number;
  monthlySavings: number;
  normalIncome: number;
  totalExpenses: number;
  travelIncome: number;
  travelSavings: number;
};

export type TransactionDraft = {
  amount: number;
  categoryId?: string;
  date: string;
  description?: string;
  isInvestment?: boolean;
  isTravelIncome?: boolean;
  subcategoryId?: string;
  type: TransactionType;
};
