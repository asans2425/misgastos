import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMonthKey } from "@/lib/finance";
import {
  isSupabaseSchemaMissingError,
  throwIfSupabaseError,
} from "@/lib/supabase/errors";
import type { Database, TablesInsert } from "@/types/database";

type Supabase = SupabaseClient<Database>;

const accounts = [
  { name: "Cuenta normal", sort_order: 1, type: "normal" },
] as const;

type SeedSavingsBucket = {
  color: string;
  icon: string;
  name: string;
  sort_order: number;
};

const savingsBuckets: readonly SeedSavingsBucket[] = [];

const categories = [
  { color: "#ef4444", icon: "utensils", name: "Comida / restaurantes", type: "expense" },
  { color: "#22c55e", icon: "shopping-cart", name: "Supermercado", type: "expense" },
  { color: "#f97316", icon: "car", name: "Coche / transporte", type: "expense" },
  { color: "#a855f7", icon: "party-popper", name: "Ocio", type: "expense" },
  { color: "#0ea5e9", icon: "plane", name: "Viajes", type: "expense" },
  { color: "#64748b", icon: "home", name: "Casa", type: "expense" },
  { color: "#8b5cf6", icon: "repeat", name: "Suscripciones", type: "expense" },
  { color: "#14b8a6", icon: "heart-pulse", name: "Salud", type: "expense" },
  { color: "#ec4899", icon: "shirt", name: "Ropa", type: "expense" },
  { color: "#2563eb", icon: "laptop", name: "Tecnología", type: "expense" },
  { color: "#d946ef", icon: "gift", name: "Regalos", type: "expense" },
  { color: "#0f766e", icon: "graduation-cap", name: "Formación", type: "expense" },
  { color: "#1d4ed8", icon: "trending-up", name: "Inversión", type: "expense" },
  { color: "#16a34a", icon: "wallet", name: "Ingresos", type: "income" },
  { color: "#b45309", icon: "receipt", name: "Impuestos", type: "expense" },
  { color: "#71717a", icon: "more-horizontal", name: "Otros", type: "expense" },
] as const;

const subcategories = [
  ["Comida / restaurantes", "Restaurante"],
  ["Comida / restaurantes", "Cena fuera"],
  ["Comida / restaurantes", "Café"],
  ["Comida / restaurantes", "Otros restaurantes"],
  ["Supermercado", "Compra semanal"],
  ["Supermercado", "Compra puntual"],
  ["Coche / transporte", "Gasolina"],
  ["Coche / transporte", "Parking"],
  ["Coche / transporte", "Transporte público"],
  ["Coche / transporte", "Mantenimiento"],
  ["Ocio", "Cine"],
  ["Ocio", "Concierto"],
  ["Ocio", "Planes"],
  ["Ocio", "Otros ocio"],
  ["Casa", "Alquiler / hipoteca"],
  ["Casa", "Luz"],
  ["Casa", "Agua"],
  ["Casa", "Internet"],
  ["Suscripciones", "Streaming"],
  ["Suscripciones", "Apps"],
  ["Salud", "Farmacia"],
  ["Salud", "Médico"],
  ["Ropa", "Ropa"],
  ["Tecnología", "Electrónica"],
  ["Viajes", "Alojamiento"],
  ["Viajes", "Transporte"],
  ["Ingresos", "Nómina"],
  ["Ingresos", "Ingreso extra"],
  ["Ingresos", "Bizum recibido"],
  ["Inversión", "Aportación mensual"],
] as const;

const travelIncomeSubcategories = new Set<string>();

type SeedRecurringItem = {
  amount: number;
  category: string;
  include_in_living_expenses?: boolean;
  is_investment?: boolean;
  is_travel_income?: boolean;
  name: string;
  subcategory?: string;
  type: "income" | "expense";
};

const recurringItems: readonly SeedRecurringItem[] = [];

const quickActions = [
  { category: "Comida / restaurantes", icon: "utensils", label: "Restaurante", subcategory: "Restaurante" },
  { category: "Comida / restaurantes", icon: "coffee", label: "Café", subcategory: "Café" },
  { category: "Supermercado", icon: "shopping-cart", label: "Supermercado" },
  { category: "Coche / transporte", icon: "fuel", label: "Gasolina", subcategory: "Gasolina" },
  { category: "Coche / transporte", icon: "square-parking", label: "Parking", subcategory: "Parking" },
  { category: "Ocio", icon: "music", label: "Ocio", subcategory: "Planes" },
  { category: "Casa", icon: "home", label: "Casa" },
  { category: "Suscripciones", icon: "repeat", label: "Suscripción" },
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

  throwIfSupabaseError(error);

  return Number(count ?? 0) > 0;
}

export async function initializeUserData(
  userId: string,
  supabaseClient?: Supabase,
) {
  const supabase = supabaseClient ?? (await createSupabaseServerClient());

  const { error: accountsUpsertError } = await supabase.from("accounts").upsert(
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

  throwIfSupabaseError(accountsUpsertError);

  const { error: categoriesUpsertError } = await supabase
    .from("categories")
    .upsert(
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

  throwIfSupabaseError(categoriesUpsertError);

  const { data: accountRows, error: accountsError } = await supabase
    .from("accounts")
    .select("id,name")
    .eq("user_id", userId);
  const { data: categoryRows, error: categoriesError } = await supabase
    .from("categories")
    .select("id,name")
    .eq("user_id", userId);

  throwIfSupabaseError(accountsError);
  throwIfSupabaseError(categoriesError);

  const accountsByName = byName(accountRows);
  const categoriesByName = byName(categoryRows);
  const defaultAccount = accountsByName.get("Cuenta normal");

  const { error: subcategoriesUpsertError } = await supabase
    .from("subcategories")
    .upsert(
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

  throwIfSupabaseError(subcategoriesUpsertError);

  const { data: subcategoryRows, error: subcategoriesError } = await supabase
    .from("subcategories")
    .select("id,name,category_id")
    .eq("user_id", userId);

  throwIfSupabaseError(subcategoriesError);

  const subcategoriesByCategoryAndName = new Map(
    (subcategoryRows ?? []).map((subcategory) => [
      subcategoryKey(subcategory.category_id, subcategory.name),
      subcategory,
    ]),
  );

  const { error: recurringItemsUpsertError } = await supabase
    .from("recurring_items")
    .upsert(
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
          auto_create: true,
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

  throwIfSupabaseError(recurringItemsUpsertError);

  const { error: quickActionsUpsertError } = await supabase
    .from("quick_actions")
    .upsert(
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

  throwIfSupabaseError(quickActionsUpsertError);

  const { error: preferencesUpsertError } = await supabase
    .from("user_preferences")
    .upsert(
    {
      currency: "EUR",
      default_account_id: defaultAccount?.id ?? null,
      default_month: getMonthKey(),
      financial_month_label_mode: "same",
      financial_month_start_day: 1,
      hide_investment_from_living_expenses: true,
      user_id: userId,
    },
    { ignoreDuplicates: true, onConflict: "user_id" },
  );

  throwIfSupabaseError(preferencesUpsertError);

  try {
    await ensureDefaultSavingsBuckets(userId, supabase);
  } catch (error) {
    if (!isSupabaseSchemaMissingError(error)) {
      throw error;
    }
  }
}

export async function ensureDefaultSavingsBuckets(
  userId: string,
  supabaseClient?: Supabase,
) {
  if (savingsBuckets.length === 0) {
    return;
  }

  const supabase = supabaseClient ?? (await createSupabaseServerClient());
  const { error } = await supabase.from("savings_buckets").upsert(
    savingsBuckets.map<TablesInsert<"savings_buckets">>((bucket) => ({
      color: bucket.color,
      current_balance: 0,
      icon: bucket.icon,
      initial_balance: 0,
      is_active: true,
      name: bucket.name,
      sort_order: bucket.sort_order,
      target_amount: null,
      user_id: userId,
    })),
    { ignoreDuplicates: true, onConflict: "user_id,name" },
  );

  throwIfSupabaseError(error);
}
