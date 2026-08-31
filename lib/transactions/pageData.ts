import {
  getFinancialMonthKey,
  getFinancialMonthRange,
} from "@/lib/finance";
import {
  isSupabaseSchemaMissingError,
  throwIfSupabaseError,
} from "@/lib/supabase/errors";
import type { Database, Json } from "@/types/database";

type Supabase = {
  from: <TableName extends keyof Database["public"]["Tables"]>(
    table: TableName,
  ) => ReturnType<import("@supabase/supabase-js").SupabaseClient<Database>["from"]>;
  rpc: import("@supabase/supabase-js").SupabaseClient<Database>["rpc"];
};

type CategoryRow = {
  id: string;
  name: string;
  type: "expense" | "income" | "special";
};

type SubcategoryRow = {
  category_id: string;
  id: string;
  is_travel_income: boolean;
  name: string;
};

type TransactionRow = {
  amount: number;
  category_id: string | null;
  created_at: string;
  date: string;
  description: string | null;
  id: string;
  is_investment: boolean;
  is_reimbursement: boolean;
  is_travel_income: boolean;
  reimburses_transaction_id: string | null;
  status: "confirmed" | "edited" | "pending";
  subcategory_id: string | null;
  type: "expense" | "income" | "transfer";
};

export type TransactionsPageData = {
  categoryRows: CategoryRow[];
  monthRange: {
    end: string;
    start: string;
  };
  selectedMonth: string;
  subcategoryRows: SubcategoryRow[];
  transactionRows: TransactionRow[];
};

type RpcPayload = {
  categories?: unknown;
  monthRange?: {
    end?: unknown;
    start?: unknown;
  };
  preferences?: {
    financial_month_label_mode?: unknown;
    financial_month_start_day?: unknown;
  };
  selectedMonth?: unknown;
  subcategories?: unknown;
  transactions?: unknown;
};

function toObject(value: Json): RpcPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as RpcPayload;
}

function toRows<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function normalizeRpcTransactionsData(
  payload: RpcPayload,
): TransactionsPageData | null {
  const selectedMonth =
    typeof payload.selectedMonth === "string" ? payload.selectedMonth : null;
  const rangeStart =
    typeof payload.monthRange?.start === "string"
      ? payload.monthRange.start
      : null;
  const rangeEnd =
    typeof payload.monthRange?.end === "string" ? payload.monthRange.end : null;

  if (!selectedMonth || !rangeStart || !rangeEnd) {
    return null;
  }

  return {
    categoryRows: toRows<CategoryRow>(payload.categories),
    monthRange: {
      end: rangeEnd,
      start: rangeStart,
    },
    selectedMonth,
    subcategoryRows: toRows<SubcategoryRow>(payload.subcategories),
    transactionRows: toRows<TransactionRow>(payload.transactions).map(
      (transaction) => ({
        ...transaction,
        amount: toNumber(transaction.amount),
      }),
    ),
  };
}

async function loadLegacyTransactionsPageData({
  selectedMonthParam,
  supabase,
  userId,
}: {
  selectedMonthParam?: string;
  supabase: Supabase;
  userId: string;
}): Promise<TransactionsPageData> {
  const [
    { data: categoryRows, error: categoryRowsError },
    { data: subcategoryRows, error: subcategoryRowsError },
    { data: preferencesData, error: preferencesError },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,type,sort_order")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("subcategories")
      .select("id,name,category_id,is_travel_income,sort_order")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("user_preferences")
      .select("financial_month_start_day,financial_month_label_mode")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  throwIfSupabaseError(categoryRowsError);
  throwIfSupabaseError(subcategoryRowsError);
  throwIfSupabaseError(preferencesError);

  const financialMonthSettings = {
    labelMode: preferencesData?.financial_month_label_mode ?? "same",
    startDay: preferencesData?.financial_month_start_day ?? 1,
  };
  const selectedMonth =
    selectedMonthParam ||
    getFinancialMonthKey(new Date(), financialMonthSettings);
  const monthRange = getFinancialMonthRange(
    selectedMonth,
    financialMonthSettings,
  );
  const { data: transactionRows, error: transactionRowsError } = await supabase
    .from("transactions")
    .select(
      "id,amount,date,description,type,status,is_investment,is_reimbursement,is_travel_income,reimburses_transaction_id,category_id,subcategory_id,created_at",
    )
    .eq("user_id", userId)
    .gte("date", monthRange.start)
    .lte("date", monthRange.end)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  throwIfSupabaseError(transactionRowsError);

  return {
    categoryRows: categoryRows ?? [],
    monthRange,
    selectedMonth,
    subcategoryRows: subcategoryRows ?? [],
    transactionRows: transactionRows ?? [],
  };
}

export async function loadTransactionsPageData({
  selectedMonthParam,
  supabase,
  userId,
}: {
  selectedMonthParam?: string;
  supabase: Supabase;
  userId: string;
}) {
  const { data, error } = await supabase.rpc("get_transactions_page_data", {
    p_selected_month: selectedMonthParam ?? null,
  });

  if (!error) {
    const normalized = data
      ? normalizeRpcTransactionsData(toObject(data) ?? {})
      : null;

    if (normalized) {
      return normalized;
    }
  }

  if (error && !isSupabaseSchemaMissingError(error)) {
    throwIfSupabaseError(error);
  }

  return loadLegacyTransactionsPageData({
    selectedMonthParam,
    supabase,
    userId,
  });
}
