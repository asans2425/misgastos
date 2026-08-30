import { redirect } from "next/navigation";
import { EmptyTransactionsState } from "@/components/transactions/EmptyTransactionsState";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionsList } from "@/components/transactions/TransactionsList";
import { PageShell } from "@/components/ui/PageShell";
import { getMonthKey } from "@/lib/finance";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type TransactionsPageProps = {
  searchParams: Promise<{
    category?: string;
    deleted?: string;
    month?: string;
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
  isTravelIncome: boolean;
  status: "confirmed" | "edited" | "pending";
  subcategoryId: string | null;
  subcategoryName: string;
  type: "expense" | "income" | "transfer";
};

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const selectedMonth = params.month || getMonthKey();
  const selectedType = params.type || "";
  const selectedCategory = params.category || "";
  const selectedText = params.text?.trim() || "";
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: categoryRows }, { data: subcategoryRows }, { data: transactionRows }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id,name,type,sort_order")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("subcategories")
        .select("id,name,category_id,is_travel_income,sort_order")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("transactions")
        .select(
          "id,amount,date,description,type,status,is_investment,is_travel_income,category_id,subcategory_id,created_at",
        )
        .eq("user_id", user.id)
        .eq("month", selectedMonth)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

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

  const filteredTransactions = (transactionRows ?? [])
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
        isTravelIncome: transaction.is_travel_income,
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
        selectedMonth={selectedMonth}
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
          returnTo={returnTo}
          subcategories={subcategories}
        />
      )}
    </PageShell>
  );
}
