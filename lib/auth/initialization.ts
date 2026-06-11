import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMonthKey } from "@/lib/finance";
import type { Database, TablesInsert } from "@/types/database";

type Supabase = SupabaseClient<Database>;

const accounts = [
  { name: "Cuenta normal", sort_order: 1, type: "normal" },
  { name: "AHORROS", sort_order: 2, type: "savings" },
  { name: "VIAJES", sort_order: 3, type: "travel" },
] as const;

const categories = [
  { color: "#ef4444", icon: "utensils", name: "Comida / restaurantes", type: "expense" },
  { color: "#22c55e", icon: "shopping-cart", name: "Supermercado", type: "expense" },
  { color: "#f97316", icon: "car", name: "Gasolina / coche", type: "expense" },
  { color: "#06b6d4", icon: "dumbbell", name: "Deporte", type: "expense" },
  { color: "#a855f7", icon: "party-popper", name: "Ocio", type: "expense" },
  { color: "#0ea5e9", icon: "plane", name: "Viajes", type: "expense" },
  { color: "#64748b", icon: "home", name: "Casa", type: "expense" },
  { color: "#8b5cf6", icon: "repeat", name: "Suscripciones", type: "expense" },
  { color: "#475569", icon: "shield", name: "Seguro", type: "expense" },
  { color: "#14b8a6", icon: "heart-pulse", name: "Salud", type: "expense" },
  { color: "#f59e0b", icon: "paw-print", name: "Mascota", type: "expense" },
  { color: "#ec4899", icon: "shirt", name: "Ropa", type: "expense" },
  { color: "#2563eb", icon: "laptop", name: "Tecnología", type: "expense" },
  { color: "#d946ef", icon: "gift", name: "Regalos", type: "expense" },
  { color: "#0f766e", icon: "graduation-cap", name: "Formación", type: "expense" },
  { color: "#0891b2", icon: "code", name: "Webs / proyectos", type: "expense" },
  { color: "#1d4ed8", icon: "trending-up", name: "Inversión", type: "expense" },
  { color: "#16a34a", icon: "wallet", name: "Ingresos", type: "income" },
  { color: "#b45309", icon: "receipt", name: "Impuestos", type: "expense" },
  { color: "#71717a", icon: "more-horizontal", name: "Otros", type: "expense" },
] as const;

const subcategories = [
  ["Comida / restaurantes", "Bar trabajo"],
  ["Comida / restaurantes", "Comer con amigos"],
  ["Comida / restaurantes", "Comer con familia"],
  ["Comida / restaurantes", "Cena fuera"],
  ["Comida / restaurantes", "Café"],
  ["Comida / restaurantes", "Otros restaurantes"],
  ["Deporte", "Pádel"],
  ["Deporte", "Futgolf"],
  ["Deporte", "Gimnasio"],
  ["Deporte", "Material deportivo"],
  ["Deporte", "Otros deporte"],
  ["Ocio", "Discoteca"],
  ["Ocio", "Cine"],
  ["Ocio", "Concierto"],
  ["Ocio", "Planes con amigos"],
  ["Ocio", "Planes familia"],
  ["Ocio", "Otros ocio"],
  ["Gasolina / coche", "Gasolina"],
  ["Gasolina / coche", "Parking"],
  ["Gasolina / coche", "Peajes"],
  ["Gasolina / coche", "Mantenimiento"],
  ["Gasolina / coche", "Otros coche"],
  ["Ingresos", "Profesor FP"],
  ["Ingresos", "PFI"],
  ["Ingresos", "Clases Alan"],
  ["Ingresos", "Clases Liam"],
  ["Ingresos", "Clases Xavi"],
  ["Ingresos", "Webs"],
  ["Ingresos", "Ingreso extra normal"],
  ["Ingresos", "Ingreso extra viajes"],
  ["Inversión", "Aportación mensual"],
] as const;

const travelIncomeSubcategories = new Set([
  "Clases Alan",
  "Clases Liam",
  "Clases Xavi",
  "Webs",
  "Ingreso extra viajes",
]);

const recurringItems = [
  { amount: 0, category: "Ingresos", is_travel_income: false, name: "Profesor FP", subcategory: "Profesor FP", type: "income" },
  { amount: 0, category: "Ingresos", is_travel_income: false, name: "PFI", subcategory: "PFI", type: "income" },
  { amount: 210, category: "Inversión", include_in_living_expenses: false, is_investment: true, name: "Inversión mensual", subcategory: "Aportación mensual", type: "expense" },
  { amount: 4, category: "Suscripciones", name: "Spotify", type: "expense" },
  { amount: 0, category: "Seguro", name: "Seguro", type: "expense" },
  { amount: 0, category: "Casa", name: "Casa", type: "expense" },
  { amount: 0, category: "Impuestos", name: "Impuestos", type: "expense" },
] as const;

const quickActions = [
  { category: "Comida / restaurantes", icon: "coffee", label: "Bar trabajo", subcategory: "Bar trabajo" },
  { category: "Gasolina / coche", icon: "fuel", label: "Gasolina", subcategory: "Gasolina" },
  { category: "Deporte", icon: "activity", label: "Pádel", subcategory: "Pádel" },
  { category: "Deporte", icon: "flag", label: "Futgolf", subcategory: "Futgolf" },
  { category: "Supermercado", icon: "shopping-cart", label: "Supermercado" },
  { category: "Comida / restaurantes", icon: "utensils", label: "Comida amigos", subcategory: "Comer con amigos" },
  { category: "Comida / restaurantes", icon: "utensils", label: "Comida familia", subcategory: "Comer con familia" },
  { category: "Ocio", icon: "music", label: "Discoteca", subcategory: "Discoteca" },
  { category: "Comida / restaurantes", icon: "coffee", label: "Café", subcategory: "Café" },
  { category: "Tecnología", icon: "package", label: "Amazon" },
  { category: "Otros", icon: "more-horizontal", label: "Otros" },
] as const;

function byName<T extends { name: string }>(rows: readonly T[] | null) {
  return new Map((rows ?? []).map((row) => [row.name, row]));
}

function subcategoryKey(categoryId: string, name: string) {
  return `${categoryId}:${name}`;
}

export async function userHasInitialData(
  userId: string,
  supabaseClient?: Supabase,
) {
  const supabase = supabaseClient ?? (await createSupabaseServerClient());
  const { count, error } = await supabase
    .from("accounts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return Number(count ?? 0) > 0;
}

export async function initializeUserData(
  userId: string,
  supabaseClient?: Supabase,
) {
  const supabase = supabaseClient ?? (await createSupabaseServerClient());

  await supabase.from("accounts").upsert(
    accounts.map<TablesInsert<"accounts">>((account) => ({
      current_balance: 0,
      initial_balance: 0,
      is_active: true,
      name: account.name,
      sort_order: account.sort_order,
      type: account.type,
      user_id: userId,
    })),
    { ignoreDuplicates: true, onConflict: "user_id,name" },
  );

  await supabase.from("categories").upsert(
    categories.map<TablesInsert<"categories">>((category, index) => ({
      color: category.color,
      icon: category.icon,
      is_active: true,
      is_system: true,
      name: category.name,
      sort_order: index + 1,
      type: category.type,
      user_id: userId,
    })),
    { ignoreDuplicates: true, onConflict: "user_id,name" },
  );

  const { data: accountRows, error: accountsError } = await supabase
    .from("accounts")
    .select("id,name")
    .eq("user_id", userId);
  const { data: categoryRows, error: categoriesError } = await supabase
    .from("categories")
    .select("id,name")
    .eq("user_id", userId);

  if (accountsError) throw new Error(accountsError.message);
  if (categoriesError) throw new Error(categoriesError.message);

  const accountsByName = byName(accountRows);
  const categoriesByName = byName(categoryRows);
  const defaultAccount = accountsByName.get("Cuenta normal");

  await supabase.from("subcategories").upsert(
    subcategories
      .map<TablesInsert<"subcategories"> | null>(([categoryName, name], index) => {
        const category = categoriesByName.get(categoryName);

        if (!category) {
          return null;
        }

        return {
          category_id: category.id,
          default_destination: travelIncomeSubcategories.has(name)
            ? "viajes"
            : "normal",
          is_active: true,
          is_investment: name === "Aportación mensual",
          is_travel_income: travelIncomeSubcategories.has(name),
          name,
          sort_order: index + 1,
          user_id: userId,
        };
      })
      .filter((value): value is TablesInsert<"subcategories"> => Boolean(value)),
    { ignoreDuplicates: true, onConflict: "user_id,category_id,name" },
  );

  const { data: subcategoryRows, error: subcategoriesError } = await supabase
    .from("subcategories")
    .select("id,name,category_id")
    .eq("user_id", userId);

  if (subcategoriesError) throw new Error(subcategoriesError.message);

  const subcategoriesByCategoryAndName = new Map(
    (subcategoryRows ?? []).map((subcategory) => [
      subcategoryKey(subcategory.category_id, subcategory.name),
      subcategory,
    ]),
  );

  await supabase.from("recurring_items").upsert(
    recurringItems
      .map<TablesInsert<"recurring_items"> | null>((item) => {
        const category = categoriesByName.get(item.category);

        if (!category) {
          return null;
        }

        const itemSubcategory =
          "subcategory" in item ? item.subcategory : undefined;
        const subcategory = itemSubcategory
          ? subcategoriesByCategoryAndName.get(
              subcategoryKey(category.id, itemSubcategory),
            )
          : null;

        return {
          account_id: defaultAccount?.id ?? null,
          amount: item.amount,
          auto_create: false,
          category_id: category.id,
          day_of_month: 1,
          frequency: "monthly",
          include_in_living_expenses:
            "include_in_living_expenses" in item
              ? item.include_in_living_expenses
              : true,
          is_active: true,
          is_investment: "is_investment" in item ? item.is_investment : false,
          is_travel_income:
            "is_travel_income" in item ? item.is_travel_income : false,
          name: item.name,
          subcategory_id: subcategory?.id ?? null,
          type: item.type,
          user_id: userId,
        };
      })
      .filter((value): value is TablesInsert<"recurring_items"> =>
        Boolean(value),
      ),
    { ignoreDuplicates: true, onConflict: "user_id,name" },
  );

  await supabase.from("quick_actions").upsert(
    quickActions
      .map<TablesInsert<"quick_actions"> | null>((action, index) => {
        const category = categoriesByName.get(action.category);

        if (!category) {
          return null;
        }

        const actionSubcategory =
          "subcategory" in action ? action.subcategory : undefined;
        const subcategory = actionSubcategory
          ? subcategoriesByCategoryAndName.get(
              subcategoryKey(category.id, actionSubcategory),
            )
          : null;

        return {
          category_id: category.id,
          color: null,
          default_amount: null,
          icon: action.icon,
          is_active: true,
          label: action.label,
          sort_order: index + 1,
          subcategory_id: subcategory?.id ?? null,
          type: "expense",
          user_id: userId,
        };
      })
      .filter((value): value is TablesInsert<"quick_actions"> =>
        Boolean(value),
      ),
    { ignoreDuplicates: true, onConflict: "user_id,label" },
  );

  await supabase.from("user_preferences").upsert(
    {
      currency: "EUR",
      default_account_id: defaultAccount?.id ?? null,
      default_month: getMonthKey(),
      hide_investment_from_living_expenses: true,
      user_id: userId,
    },
    { ignoreDuplicates: true, onConflict: "user_id" },
  );
}
