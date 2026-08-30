"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMonthKey, parseMoneyInput } from "@/lib/finance";
import { isInvestmentCategoryOrSubcategory } from "@/lib/finance/transactionRules";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
  redirect("/login");
}

export type QuickExpenseState = {
  error?: string;
  success?: boolean;
  successMessage?: string;
};

export async function createQuickExpense(
  _previousState: QuickExpenseState,
  formData: FormData,
): Promise<QuickExpenseState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const quickActionId = String(formData.get("quickActionId") ?? "").trim();
  const accountId = String(formData.get("accountId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const amount = parseMoneyInput(formData.get("amount"));

  if (!quickActionId) {
    return { error: "No se ha encontrado la accion rapida." };
  }

  if (amount === null) {
    return { error: "El importe es obligatorio." };
  }

  if (amount < 0) {
    return { error: "El importe debe ser mayor o igual a 0." };
  }

  if (!accountId) {
    return { error: "No se ha encontrado la cuenta por defecto." };
  }

  if (!date) {
    return { error: "La fecha es obligatoria." };
  }

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id,name")
    .eq("id", accountId)
    .eq("user_id", user.id)
    .single();

  if (accountError || !account) {
    return { error: "La cuenta por defecto no es valida." };
  }

  const { data: quickAction, error: quickActionError } = await supabase
    .from("quick_actions")
    .select("id,label,category_id,subcategory_id,type,is_active")
    .eq("id", quickActionId)
    .eq("user_id", user.id)
    .single();

  if (
    quickActionError ||
    !quickAction ||
    !quickAction.is_active ||
    quickAction.type !== "expense"
  ) {
    return { error: "La accion rapida no es valida." };
  }

  if (!quickAction.category_id) {
    return { error: "La accion rapida no tiene categoria asignada." };
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id,name,type")
    .eq("id", quickAction.category_id)
    .eq("user_id", user.id)
    .single();

  if (categoryError || !category || category.type !== "expense") {
    return { error: "La categoria de la accion rapida no es valida." };
  }

  let subcategoryId: string | null = null;
  let subcategoryName: string | null = null;

  if (quickAction.subcategory_id) {
    const { data: subcategory, error: subcategoryError } = await supabase
      .from("subcategories")
      .select("id,name")
      .eq("id", quickAction.subcategory_id)
      .eq("category_id", category.id)
      .eq("user_id", user.id)
      .single();

    if (subcategoryError || !subcategory) {
      return { error: "La subcategoria de la accion rapida no es valida." };
    }

    subcategoryId = subcategory.id;
    subcategoryName = subcategory.name;
  }

  const isInvestment = isInvestmentCategoryOrSubcategory(
    category.name,
    subcategoryName,
  );
  const { error } = await supabase.from("transactions").insert({
    account_id: account.id,
    amount,
    category_id: category.id,
    counts_for_savings: true,
    date,
    description: quickAction.label,
    include_in_living_expenses: !isInvestment,
    is_fixed: false,
    is_investment: isInvestment,
    is_recurring: false,
    is_travel_income: false,
    merchant: null,
    month: getMonthKey(date),
    status: "confirmed",
    subcategory_id: subcategoryId,
    type: "expense",
    user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");

  return {
    success: true,
    successMessage: `${quickAction.label} guardado correctamente.`,
  };
}
