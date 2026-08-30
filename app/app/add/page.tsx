import { redirect } from "next/navigation";
import { TransactionDraftForm } from "@/components/forms/TransactionDraftForm";
import { PageShell } from "@/components/ui/PageShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AddTransactionPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: accounts }, { data: categories }, { data: subcategories }] =
    await Promise.all([
      supabase
        .from("accounts")
        .select("id,name,sort_order")
        .eq("user_id", user.id)
        .eq("is_active", true)
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
    ]);

  const defaultAccountId =
    accounts?.find((account) => account.name === "Cuenta normal")?.id ??
    accounts?.[0]?.id ??
    "";
  const today = new Date().toISOString().slice(0, 10);

  return (
    <PageShell
      description="Alta rapida de gastos e ingresos con reglas base de MoneyFlow Albert."
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
