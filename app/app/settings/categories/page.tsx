import { CategoriesManager } from "@/components/settings/categories/CategoriesManager";
import { PageShell } from "@/components/ui/PageShell";
import { requireCurrentUser } from "@/lib/auth/currentUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CategoriesSettingsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function CategoriesSettingsPage({
  searchParams,
}: CategoriesSettingsPageProps) {
  const params = await searchParams;
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();

  const [{ data: categoryRows }, { data: subcategoryRows }] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,type,icon,color,is_active,sort_order")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("subcategories")
      .select(
        "id,name,category_id,default_destination,is_travel_income,is_investment,is_active,sort_order",
      )
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  const categories = (categoryRows ?? []).map((category) => ({
    color: category.color,
    icon: category.icon,
    id: category.id,
    isActive: category.is_active,
    name: category.name,
    type: category.type,
  }));
  const subcategories = (subcategoryRows ?? []).map((subcategory) => ({
    categoryId: subcategory.category_id,
    defaultDestination: subcategory.default_destination,
    id: subcategory.id,
    isActive: subcategory.is_active,
    isInvestment: subcategory.is_investment,
    name: subcategory.name,
  }));

  return (
    <PageShell
      description="Personaliza categorias y subcategorias para adaptar MoneyFlow a cualquier persona."
      title="Categorias"
    >
      <CategoriesManager
        categories={categories}
        status={params.status}
        subcategories={subcategories}
      />
    </PageShell>
  );
}
