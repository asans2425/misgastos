import { TransactionDraftForm } from "@/components/forms/TransactionDraftForm";
import { PageShell } from "@/components/ui/PageShell";
import { formatMoney } from "@/lib/finance";
import { requireCurrentUser } from "@/lib/auth/currentUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

export default async function AddTransactionPage() {
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();

  const [
    { data: accounts },
    { data: categories },
    { data: subcategories },
    { data: expenseRows },
    { data: savingsBuckets },
  ] = await Promise.all([
      supabase
        .from("accounts")
        .select("id,name,sort_order")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .eq("type", "normal")
        .order("sort_order", { ascending: true }),
      supabase
        .from("categories")
        .select("id,name,type,sort_order")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("subcategories")
        .select("id,name,category_id,is_investment,is_travel_income,sort_order")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("transactions")
        .select("id,amount,date,description,category_id,subcategory_id,created_at")
        .eq("user_id", user.id)
        .eq("type", "expense")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("savings_buckets")
        .select("id,name")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

  const defaultAccountId =
    accounts?.find((account) => account.name === "Cuenta normal")?.id ??
    accounts?.[0]?.id ??
    "";
  const today = new Date().toISOString().slice(0, 10);
  const categoriesById = new Map(
    (categories ?? []).map((category) => [category.id, category]),
  );
  const subcategoriesById = new Map(
    (subcategories ?? []).map((subcategory) => [subcategory.id, subcategory]),
  );
  const reimbursementTargets = (expenseRows ?? []).map((transaction) => {
    const categoryName =
      categoriesById.get(transaction.category_id ?? "")?.name ?? "Sin categoria";
    const subcategoryName =
      subcategoriesById.get(transaction.subcategory_id ?? "")?.name ?? null;
    const title =
      transaction.description?.trim() ||
      subcategoryName ||
      categoryName;

    return {
      id: transaction.id,
      label: `${formatDisplayDate(transaction.date)} · ${title} · ${formatMoney(transaction.amount)}`,
    };
  });

  return (
    <PageShell
      description="Alta rapida de gastos e ingresos con reglas base de MoneyFlow ARSA."
      title="Nuevo movimiento"
    >
      <TransactionDraftForm
        accounts={(accounts ?? []).map((account) => ({
          id: account.id,
          name: account.name,
        }))}
        categories={(categories ?? []).map((category) => ({
          id: category.id,
          name: category.name,
          type: category.type,
        }))}
        defaultAccountId={defaultAccountId}
        defaultDate={today}
        reimbursementTargets={reimbursementTargets}
        savingsBuckets={(savingsBuckets ?? []).map((bucket) => ({
          id: bucket.id,
          name: bucket.name,
        }))}
        subcategories={(subcategories ?? []).map((subcategory) => ({
          categoryId: subcategory.category_id,
          id: subcategory.id,
          isInvestment: subcategory.is_investment,
          isTravelIncome: subcategory.is_travel_income,
          name: subcategory.name,
        }))}
      />
    </PageShell>
  );
}
