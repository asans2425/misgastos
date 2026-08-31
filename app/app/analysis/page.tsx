import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { MonthPickerCard } from "@/components/dashboard/MonthPickerCard";
import { MonthPreviewChart } from "@/components/charts/MonthPreviewChart";
import { PageShell } from "@/components/ui/PageShell";
import {
  calculateMonthlySummary,
  formatMoney,
  formatMonthLabel,
  getFinancialMonthKey,
  getFinancialMonthRange,
} from "@/lib/finance";
import { throwIfSupabaseError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AnalysisPageProps = {
  searchParams: Promise<{
    month?: string;
  }>;
};

function formatRangeDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

export default async function AnalysisPage({ searchParams }: AnalysisPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: categoriesData, error: categoriesError },
    { data: subcategoriesData, error: subcategoriesError },
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
      .from("user_preferences")
      .select("financial_month_start_day,financial_month_label_mode")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  throwIfSupabaseError(categoriesError);
  throwIfSupabaseError(subcategoriesError);
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
      "id,amount,type,is_investment,is_reimbursement,is_travel_income,reimburses_transaction_id,category_id,subcategory_id",
    )
    .eq("user_id", user.id)
    .gte("date", monthRange.start)
    .lte("date", monthRange.end);

  throwIfSupabaseError(transactionRowsError);

  const categoriesById = new Map(
    (categoriesData ?? []).map((category) => [category.id, category]),
  );
  const subcategoriesById = new Map(
    (subcategoriesData ?? []).map((subcategory) => [subcategory.id, subcategory]),
  );
  const summaryInput = (transactionRowsData ?? []).map((transaction) => ({
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
  const topExpenseCategories = summary.byCategory
    .filter((category) => category.categoryName !== "Inversion")
    .filter((category) => category.categoryName !== "Inversión")
    .slice(0, 5);

  return (
    <PageShell title="Análisis">
      <div className="space-y-4 sm:space-y-6">
        <MonthPickerCard
          monthLabel={formatMonthLabel(monthDate)}
          rangeLabel={`${formatRangeDate(monthRange.start)} - ${formatRangeDate(monthRange.end)}`}
          selectedMonth={selectedMonth}
        />

        <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand text-white">
              <BarChart3 aria-hidden="true" size={20} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Top categorías
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Gasto ordinario del ciclo, sin contar inversión.
              </p>
            </div>
          </div>

          {topExpenseCategories.length === 0 ? (
            <p className="text-sm text-slate-500">
              Todavía no hay gasto ordinario en este ciclo.
            </p>
          ) : (
            <div className="space-y-3">
              {topExpenseCategories.map((category, index) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md bg-surface-muted px-3 py-3"
                  key={`${category.categoryId ?? "null"}:${category.categoryName}`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      #{index + 1}
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {category.categoryName}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-slate-900">
                    {formatMoney(category.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <MonthPreviewChart />
      </div>
    </PageShell>
  );
}
