import { redirect } from "next/navigation";
import { AnalysisHeader } from "@/components/analysis/AnalysisHeader";
import { BucketsSummary } from "@/components/analysis/BucketsSummary";
import { CategoryBreakdown } from "@/components/analysis/CategoryBreakdown";
import { CategoryEvolutionChart } from "@/components/analysis/CategoryEvolutionChart";
import { FixedVariableCard } from "@/components/analysis/FixedVariableCard";
import { MonthlyTrendChart } from "@/components/analysis/MonthlyTrendChart";
import { SavingsTrendChart } from "@/components/analysis/SavingsTrendChart";
import { SpendingCalendar } from "@/components/analysis/SpendingCalendar";
import { SpendingPaceCard } from "@/components/analysis/SpendingPaceCard";
import { StatsKpiGrid } from "@/components/analysis/StatsKpiGrid";
import { TopExpenses } from "@/components/analysis/TopExpenses";
import {
  type AnalysisBucket,
  type AnalysisBucketMovement,
  type AnalysisPeriod,
  type AnalysisRecurringItem,
  type AnalysisTransaction,
  type PeriodMonth,
  calculateAnalysis,
} from "@/lib/analysis";
import {
  formatRangeDate,
  formatShortMonthLabel,
  getFinancialMonthKey,
  getFinancialMonthRange,
} from "@/lib/finance";
import {
  isSupabaseSchemaMissingError,
  throwIfSupabaseError,
} from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AnalysisPageProps = {
  searchParams: Promise<{
    month?: string;
    period?: string;
  }>;
};

type FinancialMonthSettings = {
  labelMode: "next" | "same";
  startDay: number;
};

const allowedPeriods = new Set(["1", "3", "6", "12"]);

function parsePeriod(value?: string): AnalysisPeriod {
  return allowedPeriods.has(value ?? "") ? (value as AnalysisPeriod) : "6";
}

function addMonths(month: string, amount: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + amount, 1);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(month: string) {
  return formatShortMonthLabel(new Date(`${month}-01T00:00:00`));
}

function buildPeriodMonths({
  count,
  endMonth,
  settings,
}: {
  count: number;
  endMonth: string;
  settings: FinancialMonthSettings;
}): PeriodMonth[] {
  return Array.from({ length: count }, (_, index) => {
    const key = addMonths(endMonth, index - count + 1);
    const range = getFinancialMonthRange(key, settings);

    return {
      end: range.end,
      key,
      label: formatMonthLabel(key),
      start: range.start,
    };
  });
}

function makeAnalysisHref(month: string, period: AnalysisPeriod) {
  return `/app/analysis?month=${month}&period=${period}`;
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

  const { data: preferencesData, error: preferencesError } = await supabase
    .from("user_preferences")
    .select("financial_month_start_day,financial_month_label_mode")
    .eq("user_id", user.id)
    .maybeSingle();

  throwIfSupabaseError(preferencesError);

  const financialMonthSettings = {
    labelMode: preferencesData?.financial_month_label_mode ?? "same",
    startDay: preferencesData?.financial_month_start_day ?? 1,
  } satisfies FinancialMonthSettings;
  const selectedMonth =
    params.month || getFinancialMonthKey(new Date(), financialMonthSettings);
  const period = parsePeriod(params.period);
  const periodCount = Number(period);
  const periodMonths = buildPeriodMonths({
    count: periodCount,
    endMonth: selectedMonth,
    settings: financialMonthSettings,
  });
  const previousPeriodMonths = buildPeriodMonths({
    count: periodCount,
    endMonth: addMonths(selectedMonth, -periodCount),
    settings: financialMonthSettings,
  });
  const selectedPeriodMonth = periodMonths[periodMonths.length - 1];
  const queryMonths = [...previousPeriodMonths, ...periodMonths];
  const queryStart = queryMonths[0].start;
  const queryEnd = queryMonths[queryMonths.length - 1].end;

  const [
    { data: categoriesData, error: categoriesError },
    { data: subcategoriesData, error: subcategoriesError },
    { data: transactionRowsData, error: transactionRowsError },
    { data: recurringRowsData, error: recurringRowsError },
    { data: bucketRowsData, error: bucketRowsError },
    { data: bucketMovementRowsData, error: bucketMovementRowsError },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,icon,color")
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("subcategories")
      .select("id,name")
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("transactions")
      .select(
        "id,amount,date,description,merchant,type,status,is_investment,is_reimbursement,is_recurring,reimburses_transaction_id,recurring_item_id,category_id,subcategory_id",
      )
      .eq("user_id", user.id)
      .gte("date", queryStart)
      .lte("date", queryEnd),
    supabase
      .from("recurring_items")
      .select("id,name,type,amount,is_active")
      .eq("user_id", user.id),
    supabase
      .from("savings_buckets")
      .select("id,name,current_balance,color")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("bucket_movements")
      .select("bucket_id,amount,date,month,type")
      .eq("user_id", user.id)
      .gte("date", queryStart)
      .lte("date", queryEnd),
  ]);

  throwIfSupabaseError(categoriesError);
  throwIfSupabaseError(subcategoriesError);
  throwIfSupabaseError(transactionRowsError);
  throwIfSupabaseError(recurringRowsError);
  if (bucketRowsError && !isSupabaseSchemaMissingError(bucketRowsError)) {
    throwIfSupabaseError(bucketRowsError);
  }
  if (
    bucketMovementRowsError &&
    !isSupabaseSchemaMissingError(bucketMovementRowsError)
  ) {
    throwIfSupabaseError(bucketMovementRowsError);
  }

  const categoriesById = new Map(
    (categoriesData ?? []).map((category) => [category.id, category]),
  );
  const subcategoriesById = new Map(
    (subcategoriesData ?? []).map((subcategory) => [subcategory.id, subcategory]),
  );
  const transactions: AnalysisTransaction[] = (transactionRowsData ?? []).map(
    (transaction) => {
      const category = categoriesById.get(transaction.category_id ?? "");

      return {
        amount: transaction.amount,
        categoryColor: category?.color ?? null,
        categoryIcon: category?.icon ?? null,
        categoryId: transaction.category_id,
        categoryName: category?.name ?? "Sin categoría",
        date: transaction.date,
        description: transaction.description,
        id: transaction.id,
        isInvestment: transaction.is_investment,
        isReimbursement: transaction.is_reimbursement,
        isRecurring: transaction.is_recurring,
        merchant: transaction.merchant,
        monthKey: getFinancialMonthKey(transaction.date, financialMonthSettings),
        reimbursesTransactionId: transaction.reimburses_transaction_id,
        recurringItemId: transaction.recurring_item_id,
        status: transaction.status,
        subcategoryId: transaction.subcategory_id,
        subcategoryName:
          subcategoriesById.get(transaction.subcategory_id ?? "")?.name ??
          "Sin subcategoría",
        type: transaction.type,
      };
    },
  );
  const recurringItems: AnalysisRecurringItem[] = (recurringRowsData ?? []).map(
    (item) => ({
      amount: item.amount,
      id: item.id,
      isActive: item.is_active,
      name: item.name,
      type: item.type,
    }),
  );
  const buckets: AnalysisBucket[] = (bucketRowsError ? [] : (bucketRowsData ?? [])).map((bucket) => ({
    color: bucket.color,
    currentBalance: bucket.current_balance,
    id: bucket.id,
    name: bucket.name,
  }));
  const bucketMovements: AnalysisBucketMovement[] = (
    bucketMovementRowsError ? [] : (bucketMovementRowsData ?? [])
  ).map((movement) => ({
    amount: movement.amount,
    bucketId: movement.bucket_id,
    date: movement.date,
    monthKey: movement.month,
    type: movement.type,
  }));
  const analysis = calculateAnalysis({
    buckets,
    bucketMovements,
    periodMonths,
    previousPeriodMonths,
    recurringItems,
    selectedMonth: selectedPeriodMonth,
    transactions,
  });
  const rangeLabel =
    period === "1"
      ? `${formatRangeDate(selectedPeriodMonth.start)} - ${formatRangeDate(
          selectedPeriodMonth.end,
        )}`
      : `${formatRangeDate(periodMonths[0].start)} - ${formatRangeDate(
          selectedPeriodMonth.end,
        )}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <AnalysisHeader
        currentMonthHref={makeAnalysisHref(
          getFinancialMonthKey(new Date(), financialMonthSettings),
          period,
        )}
        monthLabel={formatMonthLabel(selectedMonth)}
        nextHref={makeAnalysisHref(addMonths(selectedMonth, 1), period)}
        period={period}
        periodHref={(nextPeriod) => makeAnalysisHref(selectedMonth, nextPeriod)}
        previousHref={makeAnalysisHref(addMonths(selectedMonth, -1), period)}
        rangeLabel={rangeLabel}
      />

      <StatsKpiGrid
        items={[
          {
            invertGood: true,
            kpi: analysis.expenses,
            title: "Gastos netos",
          },
          {
            kpi: analysis.income,
            title: "Ingresos reales",
          },
          {
            kpi: analysis.balance,
            title: "Balance",
          },
          {
            kpi: analysis.savingsRate,
            title: "Tasa ahorro",
            valueKind: "percent",
          },
        ]}
      />

      <MonthlyTrendChart data={analysis.trend} />

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <CategoryBreakdown categories={analysis.categories} />
        <SpendingPaceCard projection={analysis.projection} />
        <CategoryEvolutionChart items={analysis.categoryEvolution} />
        <FixedVariableCard fixedVariable={analysis.fixedVariable} />
        <SpendingCalendar
          days={analysis.dailySpending}
          month={selectedPeriodMonth}
        />
        <TopExpenses expenses={analysis.topExpenses} />
        <SavingsTrendChart data={analysis.savingsTrend} />
        <BucketsSummary buckets={analysis.buckets} />
      </div>
    </div>
  );
}
