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
};

type SubcategoryRow = {
  id: string;
  name: string;
};

type AccountRow = {
  current_balance: number;
  id: string;
  name: string;
  sort_order: number;
};

type QuickActionRow = {
  category_id: string | null;
  id: string;
  label: string;
  sort_order: number;
  subcategory_id: string | null;
  type: "expense" | "income";
};

type BucketRow = {
  color: string | null;
  current_balance: number;
  id: string;
  initial_balance: number;
  is_active: boolean;
  name: string;
  sort_order: number;
  target_amount: number | null;
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

type FinancialMonthSettings = {
  labelMode: "next" | "same";
  startDay: number;
};

export type AppHomeData = {
  accounts: AccountRow[];
  bucketRows: BucketRow[];
  categories: CategoryRow[];
  financialMonthSettings: FinancialMonthSettings;
  monthRange: {
    end: string;
    start: string;
  };
  quickActions: QuickActionRow[];
  selectedMonth: string;
  subcategories: SubcategoryRow[];
  transactionRows: TransactionRow[];
};

type RpcPayload = {
  accounts?: unknown;
  buckets?: unknown;
  categories?: unknown;
  monthRange?: {
    end?: unknown;
    start?: unknown;
  };
  preferences?: {
    financial_month_label_mode?: unknown;
    financial_month_start_day?: unknown;
  };
  quickActions?: unknown;
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

async function sortQuickActionsByHabit({
  quickActions,
  supabase,
  userId,
}: {
  quickActions: QuickActionRow[];
  supabase: Supabase;
  userId: string;
}) {
  if (quickActions.length < 2) {
    return quickActions;
  }

  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const { data, error } = await supabase
    .from("transactions")
    .select("category_id,subcategory_id")
    .eq("user_id", userId)
    .eq("type", "expense")
    .gte("date", since.toISOString().slice(0, 10));

  if (error) {
    throwIfSupabaseError(error);
    return quickActions;
  }

  const exactUsage = new Map<string, number>();
  const categoryUsage = new Map<string, number>();

  for (const transaction of data ?? []) {
    if (transaction.category_id) {
      categoryUsage.set(
        transaction.category_id,
        (categoryUsage.get(transaction.category_id) ?? 0) + 1,
      );
    }

    if (transaction.category_id && transaction.subcategory_id) {
      const key = `${transaction.category_id}:${transaction.subcategory_id}`;
      exactUsage.set(key, (exactUsage.get(key) ?? 0) + 1);
    }
  }

  const usageFor = (action: QuickActionRow) => {
    if (action.subcategory_id && action.category_id) {
      return exactUsage.get(`${action.category_id}:${action.subcategory_id}`) ?? 0;
    }

    return action.category_id
      ? categoryUsage.get(action.category_id) ?? 0
      : 0;
  };

  return [...quickActions].sort((a, b) => {
    const usageDifference = usageFor(b) - usageFor(a);

    if (usageDifference !== 0) {
      return usageDifference;
    }

    return a.sort_order - b.sort_order || a.label.localeCompare(b.label, "es");
  });
}

function normalizeRpcHomeData(payload: RpcPayload): AppHomeData | null {
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

  const startDay = toNumber(
    payload.preferences?.financial_month_start_day,
    1,
  );
  const labelMode =
    payload.preferences?.financial_month_label_mode === "next"
      ? "next"
      : "same";

  return {
    accounts: toRows<AccountRow>(payload.accounts).map((account) => ({
      ...account,
      current_balance: toNumber(account.current_balance),
      sort_order: toNumber(account.sort_order),
    })),
    bucketRows: toRows<BucketRow>(payload.buckets).map((bucket) => ({
      ...bucket,
      current_balance: toNumber(bucket.current_balance),
      initial_balance: toNumber(bucket.initial_balance),
      sort_order: toNumber(bucket.sort_order),
      target_amount:
        bucket.target_amount === null ? null : toNumber(bucket.target_amount),
    })),
    categories: toRows<CategoryRow>(payload.categories),
    financialMonthSettings: {
      labelMode,
      startDay,
    },
    monthRange: {
      end: rangeEnd,
      start: rangeStart,
    },
    quickActions: toRows<QuickActionRow>(payload.quickActions),
    selectedMonth,
    subcategories: toRows<SubcategoryRow>(payload.subcategories),
    transactionRows: toRows<TransactionRow>(payload.transactions).map(
      (transaction) => ({
        ...transaction,
        amount: toNumber(transaction.amount),
      }),
    ),
  };
}

async function loadLegacyHomeData({
  selectedMonthParam,
  supabase,
  userId,
}: {
  selectedMonthParam?: string;
  supabase: Supabase;
  userId: string;
}): Promise<AppHomeData> {
  const [
    { data: categoriesData, error: categoriesError },
    { data: subcategoriesData, error: subcategoriesError },
    { data: accountsData, error: accountsError },
    { data: quickActionsData, error: quickActionsError },
    { data: bucketRowsData, error: bucketRowsError },
    { data: preferencesData, error: preferencesError },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name")
      .eq("user_id", userId)
      .eq("is_active", true),
    supabase
      .from("subcategories")
      .select("id,name")
      .eq("user_id", userId)
      .eq("is_active", true),
    supabase
      .from("accounts")
      .select("id,name,sort_order,current_balance")
      .eq("user_id", userId)
      .eq("is_active", true)
      .eq("type", "normal")
      .order("sort_order", { ascending: true }),
    supabase
      .from("quick_actions")
      .select("id,label,category_id,subcategory_id,sort_order,type")
      .eq("user_id", userId)
      .eq("is_active", true)
      .eq("type", "expense")
      .order("sort_order", { ascending: true }),
    supabase
      .from("savings_buckets")
      .select(
        "id,name,current_balance,target_amount,initial_balance,color,is_active,sort_order",
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("user_preferences")
      .select("financial_month_start_day,financial_month_label_mode")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  throwIfSupabaseError(categoriesError);
  throwIfSupabaseError(subcategoriesError);
  throwIfSupabaseError(accountsError);
  throwIfSupabaseError(quickActionsError);
  if (bucketRowsError && !isSupabaseSchemaMissingError(bucketRowsError)) {
    throwIfSupabaseError(bucketRowsError);
  }
  throwIfSupabaseError(preferencesError);

  const financialMonthSettings = {
    labelMode: preferencesData?.financial_month_label_mode ?? "same",
    startDay: preferencesData?.financial_month_start_day ?? 1,
  } satisfies FinancialMonthSettings;
  const selectedMonth =
    selectedMonthParam ||
    getFinancialMonthKey(new Date(), financialMonthSettings);
  const monthRange = getFinancialMonthRange(
    selectedMonth,
    financialMonthSettings,
  );
  const { data: transactionRowsData, error: transactionRowsError } =
    await supabase
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
    accounts: accountsData ?? [],
    bucketRows: bucketRowsError ? [] : (bucketRowsData ?? []),
    categories: categoriesData ?? [],
    financialMonthSettings,
    monthRange,
    quickActions: quickActionsData ?? [],
    selectedMonth,
    subcategories: subcategoriesData ?? [],
    transactionRows: transactionRowsData ?? [],
  };
}

export async function loadAppHomeData({
  selectedMonthParam,
  supabase,
  userId,
}: {
  selectedMonthParam?: string;
  supabase: Supabase;
  userId: string;
}) {
  const { data, error } = await supabase.rpc("get_app_home_data", {
    p_selected_month: selectedMonthParam ?? null,
  });

  if (!error) {
    const normalized = data ? normalizeRpcHomeData(toObject(data) ?? {}) : null;

    if (normalized) {
      return {
        ...normalized,
        quickActions: await sortQuickActionsByHabit({
          quickActions: normalized.quickActions,
          supabase,
          userId,
        }),
      };
    }
  }

  if (error && !isSupabaseSchemaMissingError(error)) {
    throwIfSupabaseError(error);
  }

  const legacyData = await loadLegacyHomeData({
    selectedMonthParam,
    supabase,
    userId,
  });

  return {
    ...legacyData,
    quickActions: await sortQuickActionsByHabit({
      quickActions: legacyData.quickActions,
      supabase,
      userId,
    }),
  };
}
