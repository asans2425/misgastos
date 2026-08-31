import { RecurringItemsManager } from "@/components/settings/recurring/RecurringItemsManager";
import { PageShell } from "@/components/ui/PageShell";
import { requireCurrentUser } from "@/lib/auth/currentUser";
import { getMonthKey } from "@/lib/finance";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RecurringSettingsPageProps = {
  searchParams: Promise<{
    month?: string;
    status?: string;
  }>;
};

export default async function RecurringSettingsPage({
  searchParams,
}: RecurringSettingsPageProps) {
  const params = await searchParams;
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();

  const [
    { data: accountRows },
    { data: categoryRows },
    { data: subcategoryRows },
    { data: recurringRows },
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
      .select("id,name,category_id,sort_order")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("recurring_items")
      .select(
        "id,name,type,amount,category_id,subcategory_id,account_id,day_of_month,is_investment,is_travel_income,include_in_living_expenses,auto_create,is_active,created_at",
      )
      .eq("user_id", user.id)
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: true }),
  ]);

  const accounts = (accountRows ?? []).map((account) => ({
    id: account.id,
    name: account.name,
  }));
  const categories = (categoryRows ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    type: category.type,
  }));
  const subcategories = (subcategoryRows ?? []).map((subcategory) => ({
    categoryId: subcategory.category_id,
    id: subcategory.id,
    name: subcategory.name,
  }));
  const accountsById = new Map(accounts.map((account) => [account.id, account]));
  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const subcategoriesById = new Map(
    subcategories.map((subcategory) => [subcategory.id, subcategory]),
  );
  const items = (recurringRows ?? []).map((item) => ({
    accountId: item.account_id,
    accountName: accountsById.get(item.account_id ?? "")?.name ?? "Sin cuenta",
    amount: item.amount,
    categoryId: item.category_id,
    categoryName: categoriesById.get(item.category_id ?? "")?.name ?? null,
    dayOfMonth: item.day_of_month,
    id: item.id,
    isActive: item.is_active,
    isInvestment: item.is_investment,
    name: item.name,
    subcategoryId: item.subcategory_id,
    subcategoryName:
      subcategoriesById.get(item.subcategory_id ?? "")?.name ?? null,
    type: item.type,
  }));

  return (
    <PageShell
      description="Configura ingresos y gastos que se repiten cada mes."
      title="Gastos e ingresos fijos"
    >
      <RecurringItemsManager
        accounts={accounts}
        categories={categories}
        currentMonth={params.month ?? getMonthKey()}
        items={items}
        status={params.status}
        subcategories={subcategories}
      />
    </PageShell>
  );
}
