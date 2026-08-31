import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarDays, ReceiptText } from "lucide-react";
import { MonthPickerCard } from "@/components/dashboard/MonthPickerCard";
import { MonthlySnapshot } from "@/components/dashboard/MonthlySnapshot";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import {
  calculateMonthlySummary,
  getFinancialMonthKey,
  getFinancialMonthRange,
  formatMoney,
  formatMonthLabel,
} from "@/lib/finance";
import { throwIfSupabaseError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";

type AppHomePageProps = {
  searchParams: Promise<{
    created?: string;
    month?: string;
  }>;
};

type TransactionView = {
  amount: number;
  categoryName: string;
  date: string;
  description: string | null;
  id: string;
  is_investment: boolean;
  is_reimbursement: boolean;
  is_travel_income: boolean;
  reimburses_transaction_id: string | null;
  status: "confirmed" | "edited" | "pending";
  subcategoryName: string;
  type: "expense" | "income" | "transfer";
};

function formatDisplayDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatRangeDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

function getSignedAmountLabel(
  amount: number,
  type: "expense" | "income" | "transfer",
) {
  if (type === "expense") {
    return `-${formatMoney(amount)}`;
  }

  if (type === "income") {
    return `+${formatMoney(amount)}`;
  }

  return formatMoney(amount);
}

function getAmountTone(type: "expense" | "income" | "transfer") {
  if (type === "expense") {
    return "text-rose-700";
  }

  if (type === "income") {
    return "text-emerald-700";
  }

  return "text-slate-900";
}

function getPrimaryLabel(transaction: TransactionView) {
  if (transaction.description?.trim()) {
    return transaction.description.trim();
  }

  if (transaction.subcategoryName !== "Sin subcategoria") {
    return transaction.subcategoryName;
  }

  return transaction.categoryName;
}

export default async function AppHomePage({ searchParams }: AppHomePageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const params = await searchParams;

  if (!user) {
    redirect("/login");
  }

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
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("subcategories")
      .select("id,name")
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("accounts")
      .select("id,name,sort_order")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .eq("type", "normal")
      .order("sort_order", { ascending: true }),
    supabase
      .from("quick_actions")
      .select("id,label,category_id,subcategory_id,is_active,sort_order,type")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .eq("type", "expense")
      .order("sort_order", { ascending: true }),
    supabase
      .from("savings_buckets")
      .select("id,name,current_balance,target_amount,initial_balance,color,is_active,sort_order")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("user_preferences")
      .select("financial_month_start_day,financial_month_label_mode")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  throwIfSupabaseError(categoriesError);
  throwIfSupabaseError(subcategoriesError);
  throwIfSupabaseError(accountsError);
  throwIfSupabaseError(quickActionsError);
  throwIfSupabaseError(bucketRowsError);
  throwIfSupabaseError(preferencesError);

  const financialMonthSettings = {
    labelMode: preferencesData?.financial_month_label_mode ?? "same",
    startDay: preferencesData?.financial_month_start_day ?? 1,
  };
  const selectedMonth =
    params.month || getFinancialMonthKey(new Date(), financialMonthSettings);
  const monthDate = new Date(`${selectedMonth}-01T00:00:00`);
  const monthRange = getFinancialMonthRange(
    selectedMonth,
    financialMonthSettings,
  );
  const { data: transactionRowsData, error: transactionRowsError } = await supabase
    .from("transactions")
    .select(
      "id,amount,date,description,type,status,is_investment,is_reimbursement,is_travel_income,reimburses_transaction_id,category_id,subcategory_id,created_at",
    )
    .eq("user_id", user.id)
    .gte("date", monthRange.start)
    .lte("date", monthRange.end)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  throwIfSupabaseError(transactionRowsError);

  const categories = categoriesData ?? [];
  const subcategories = subcategoriesData ?? [];
  const accounts = accountsData ?? [];
  const quickActions = quickActionsData ?? [];
  const transactionRows = transactionRowsData ?? [];
  const bucketRows = bucketRowsData ?? [];

  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const subcategoriesById = new Map(
    subcategories.map((subcategory) => [subcategory.id, subcategory]),
  );
  const defaultAccountId =
    accounts.find((account) => account.name === "Cuenta normal")?.id ??
    accounts[0]?.id ??
    "";
  const today = new Date().toISOString().slice(0, 10);

  const summaryInput = transactionRows.map((transaction) => ({
    amount: transaction.amount,
    categoryId: transaction.category_id,
    categoryName:
      categoriesById.get(transaction.category_id ?? "")?.name ?? "Sin categoria",
    id: transaction.id,
    is_investment: transaction.is_investment,
    is_reimbursement: transaction.is_reimbursement,
    is_travel_income: transaction.is_travel_income,
    reimburses_transaction_id: transaction.reimburses_transaction_id,
    subcategoryId: transaction.subcategory_id,
    subcategoryName:
      subcategoriesById.get(transaction.subcategory_id ?? "")?.name ??
      "Sin subcategoria",
    type: transaction.type,
  }));
  const summary = calculateMonthlySummary(summaryInput);
  const latestTransactions: TransactionView[] = transactionRows
    .slice(0, 5)
    .map((transaction) => ({
      amount: transaction.amount,
      categoryName:
        categoriesById.get(transaction.category_id ?? "")?.name ?? "Sin categoria",
      date: transaction.date,
      description: transaction.description,
      id: transaction.id,
      is_investment: transaction.is_investment,
      is_reimbursement: transaction.is_reimbursement,
      is_travel_income: transaction.is_travel_income,
      reimburses_transaction_id: transaction.reimburses_transaction_id,
      status: transaction.status,
      subcategoryName:
        subcategoriesById.get(transaction.subcategory_id ?? "")?.name ??
        "Sin subcategoria",
      type: transaction.type,
    }));
  const quickActionItems = quickActions.map((action) => ({
    accountId: defaultAccountId,
    categoryName:
      categoriesById.get(action.category_id ?? "")?.name ?? "Sin categoria",
    date: today,
    id: action.id,
    label: action.label,
    subcategoryName:
      subcategoriesById.get(action.subcategory_id ?? "")?.name ?? null,
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {params.created === "1" ? (
        <section className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 shadow-sm">
          Movimiento guardado correctamente.
        </section>
      ) : null}

      <MonthPickerCard
        monthLabel={formatMonthLabel(monthDate)}
        rangeLabel={`${formatRangeDate(monthRange.start)} - ${formatRangeDate(monthRange.end)}`}
        selectedMonth={selectedMonth}
      />

      <MonthlySnapshot
        expandedBalance={summary.expandedBalance}
        investment={summary.investment}
        livingExpenses={summary.livingExpenses}
        monthlySavings={summary.monthlySavings}
        normalIncome={summary.normalIncome}
        totalExpenses={summary.totalExpenses}
      />

      <QuickActionsPanel actions={quickActionItems} />

        <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Ultimos movimientos
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Los cinco movimientos mas recientes del mes seleccionado.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-strong"
              href={`/app/transactions?month=${selectedMonth}`}
            >
              Ver todos
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>

          {latestTransactions.length === 0 ? (
            <div className="rounded-md border border-dashed border-border-soft px-4 py-6 text-center">
              <p className="text-sm font-medium text-slate-600">
                Todavía no tienes movimientos este mes.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Añade tu primer gasto.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestTransactions.map((transaction) => (
                <article
                  className="flex items-start justify-between gap-3 rounded-md border border-border-soft bg-white px-3 py-3"
                  key={transaction.id}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      <CalendarDays aria-hidden="true" size={14} />
                      {formatDisplayDate(transaction.date)}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {getPrimaryLabel(transaction)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {transaction.categoryName}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {transaction.is_travel_income ? (
                        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-900">
                          VIAJES
                        </span>
                      ) : null}
                      {transaction.is_reimbursement ? (
                        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-900">
                          Reembolso
                        </span>
                      ) : null}
                      {transaction.is_investment ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                          Inversion
                        </span>
                      ) : null}
                      {transaction.status === "pending" ? (
                        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-900">
                          Pendiente
                        </span>
                      ) : (
                        <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-900">
                          Confirmado
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        getAmountTone(transaction.type),
                      )}
                    >
                      {getSignedAmountLabel(transaction.amount, transaction.type)}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                      {transaction.type === "expense"
                        ? "Gasto"
                        : transaction.type === "income"
                          ? "Ingreso"
                          : "Transferencia"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Huchas</h2>
              <p className="mt-1 text-sm text-slate-500">
                Dinero apartado sin contar como gasto.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-strong"
              href="/app/settings/buckets"
            >
              Gestionar
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>

          {bucketRows.length === 0 ? (
            <p className="text-sm text-slate-500">
              Crea tu primera hucha para separar objetivos como ahorros, viajes
              o coche.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {bucketRows.map((bucket) => (
                <div
                  className="rounded-md border border-border-soft bg-white p-3"
                  key={bucket.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {bucket.name}
                    </p>
                    <span
                      aria-hidden="true"
                      className="size-5 shrink-0 rounded-full border border-border-soft"
                      style={{ backgroundColor: bucket.color ?? "#e2e8f0" }}
                    />
                  </div>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {formatMoney(bucket.current_balance)}
                  </p>
                  {bucket.target_amount ? (
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Objetivo {formatMoney(bucket.target_amount)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ReceiptText aria-hidden="true" size={18} className="text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-950">
              Lectura rapida del mes
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-md bg-surface-muted p-3">
              <p className="text-sm font-medium text-slate-500">Balance ampliado</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatMoney(summary.expandedBalance)}
              </p>
            </div>
            <div className="rounded-md bg-surface-muted p-3">
              <p className="text-sm font-medium text-slate-500">Gasto total</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatMoney(summary.totalExpenses)}
              </p>
            </div>
            <div className="rounded-md bg-surface-muted p-3">
              <p className="text-sm font-medium text-slate-500">Movimientos del mes</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {transactionRows.length}
              </p>
            </div>
          </div>
        </section>
    </div>
  );
}
