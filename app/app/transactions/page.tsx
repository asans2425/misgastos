import { EmptyTransactionsState } from "@/components/transactions/EmptyTransactionsState";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionsList } from "@/components/transactions/TransactionsList";
import { PageShell } from "@/components/ui/PageShell";
import { requireCurrentUser } from "@/lib/auth/currentUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadTransactionsPageData } from "@/lib/transactions/pageData";

type TransactionsPageProps = {
  searchParams: Promise<{
    category?: string;
    deleted?: string;
    month?: string;
    transaction?: string;
    text?: string;
    type?: string;
    updated?: string;
  }>;
};

type TransactionRow = {
  amount: number;
  categoryId: string | null;
  categoryName: string;
  date: string;
  description: string | null;
  id: string;
  isInvestment: boolean;
  isReimbursement: boolean;
  isTravelIncome: boolean;
  reimbursesTransactionId: string | null;
  status: "confirmed" | "edited" | "pending";
  subcategoryId: string | null;
  subcategoryName: string;
  type: "expense" | "income" | "transfer";
};

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const selectedType = params.type || "";
  const selectedCategory = params.category || "";
  const selectedText = params.text?.trim() || "";
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const {
    categoryRows,
    monthRange,
    selectedMonth,
    subcategoryRows,
    transactionRows,
  } = await loadTransactionsPageData({
    selectedMonthParam: params.month,
    supabase,
    userId: user.id,
  });

  const categories = (categoryRows ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    type: category.type,
  }));
  const subcategories = (subcategoryRows ?? []).map((subcategory) => ({
    categoryId: subcategory.category_id,
    id: subcategory.id,
    isTravelIncome: subcategory.is_travel_income,
    name: subcategory.name,
  }));
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const subcategoriesById = new Map(
    subcategories.map((subcategory) => [subcategory.id, subcategory]),
  );

  const filteredTransactions = transactionRows
    .map<TransactionRow>((transaction) => {
      const category = transaction.category_id
        ? categoriesById.get(transaction.category_id)
        : null;
      const subcategory = transaction.subcategory_id
        ? subcategoriesById.get(transaction.subcategory_id)
        : null;

      return {
        amount: transaction.amount,
        categoryId: transaction.category_id,
        categoryName: category?.name ?? "Sin categoria",
        date: transaction.date,
        description: transaction.description,
        id: transaction.id,
        isInvestment: transaction.is_investment,
        isReimbursement: transaction.is_reimbursement,
        isTravelIncome: transaction.is_travel_income,
        reimbursesTransactionId: transaction.reimburses_transaction_id,
        status: transaction.status,
        subcategoryId: transaction.subcategory_id,
        subcategoryName: subcategory?.name ?? "Sin subcategoria",
        type: transaction.type,
      };
    })
    .filter((transaction) =>
      selectedType ? transaction.type === selectedType : true,
    )
    .filter((transaction) =>
      selectedCategory ? transaction.categoryId === selectedCategory : true,
    )
    .filter((transaction) => {
      if (!selectedText) {
        return true;
      }

      const haystack = [
        transaction.categoryName,
        transaction.subcategoryName,
        transaction.description ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(selectedText.toLowerCase());
    });

  const groups = Array.from(
    filteredTransactions.reduce<Map<string, TransactionRow[]>>((map, transaction) => {
      const current = map.get(transaction.date) ?? [];

      current.push(transaction);
      map.set(transaction.date, current);

      return map;
    }, new Map()),
  ).map(([date, items]) => ({ date, items }));
  const returnToParams = new URLSearchParams();

  returnToParams.set("month", selectedMonth);
  if (selectedType) returnToParams.set("type", selectedType);
  if (selectedCategory) returnToParams.set("category", selectedCategory);
  if (selectedText) returnToParams.set("text", selectedText);

  const returnTo = `/app/transactions?${returnToParams.toString()}`;
  const reimbursementTargets = filteredTransactions
    .filter((transaction) => transaction.type === "expense")
    .map((transaction) => ({
      id: transaction.id,
      label: `${transaction.date} · ${
        transaction.description?.trim() ||
        transaction.subcategoryName ||
        transaction.categoryName
      } · ${transaction.amount.toLocaleString("es-ES", {
        currency: "EUR",
        style: "currency",
      })}`,
    }));

  return (
    <PageShell
      description="Movimientos del mes con filtros basicos, edicion rapida y borrado."
      title="Movimientos"
    >
      {params.updated === "1" ? (
        <section className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 shadow-sm">
          Movimiento actualizado correctamente.
        </section>
      ) : null}

      {params.deleted === "1" ? (
        <section className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 shadow-sm">
          Movimiento eliminado correctamente.
        </section>
      ) : null}

      <TransactionFilters
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        selectedCategory={selectedCategory}
        selectedEndDate={monthRange.end}
        selectedMonth={selectedMonth}
        selectedStartDate={monthRange.start}
        selectedText={selectedText}
        selectedType={selectedType}
      />

      {groups.length === 0 ? (
        <EmptyTransactionsState
          description="Añade tu primer gasto."
          title="Todavía no tienes movimientos este mes."
        />
      ) : (
        <TransactionsList
          categories={categories}
          groups={groups}
          reimbursementTargets={reimbursementTargets}
          returnTo={returnTo}
          selectedTransactionId={params.transaction}
          subcategories={subcategories}
        />
      )}
    </PageShell>
  );
}
