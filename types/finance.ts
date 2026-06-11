export type TransactionType = "expense" | "income";

export type Transaction = {
  amount: number;
  category: string;
  date: string;
  id: string;
  notes?: string;
  title: string;
  type: TransactionType;
};
