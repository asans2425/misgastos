"use server";

import { redirect } from "next/navigation";
import { getMonthKey, parseMoneyInput } from "@/lib/finance";
import {
  isInvestmentCategoryOrSubcategory,
  isNormalIncomeSubcategory,
  isTravelIncomeSubcategory,
} from "@/lib/finance/transactionRules";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { IncomeDestinationMode, TransactionInsert } from "@/types/finance";

export type CreateTransactionState = {
  error?: string;
};

export async function createTransaction(
  _previousState: CreateTransactionState,
  formData: FormData,
): Promise<CreateTransactionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const type = String(formData.get("type") ?? "");
  const date = String(formData.get("date") ?? "").trim();
  const accountId = String(formData.get("accountId") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const subcategoryId = String(formData.get("subcategoryId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const incomeDestination = String(
    formData.get("incomeDestination") ?? "normal",
  ) as IncomeDestinationMode;
  const isInvestment = formData.get("isInvestment") === "on";
  const amount = parseMoneyInput(formData.get("amount"));

  if (type !== "expense" && type !== "income") {
    return { error: "Selecciona un tipo valido." };
  }

  if (amount === null) {
    return { error: "El importe es obligatorio." };
  }

  if (amount < 0) {
    return { error: "El importe debe ser mayor o igual a 0." };
  }

  if (!date) {
    return { error: "La fecha es obligatoria." };
  }

  if (!accountId) {
    return { error: "Selecciona una cuenta." };
  }

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id")
    .eq("id", accountId)
    .eq("user_id", user.id)
    .single();

  if (accountError || !account) {
    return { error: "La cuenta seleccionada no es valida." };
  }

  if (type === "expense" && !categoryId) {
    return { error: "Selecciona una categoria para el gasto." };
  }

  if (type === "income" && !subcategoryId) {
    return { error: "Selecciona una fuente de ingreso." };
  }

  let payload: TransactionInsert;

  if (type === "expense") {
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id,name")
      .eq("id", categoryId)
      .eq("user_id", user.id)
      .single();

    if (categoryError || !category) {
      return { error: "La categoria seleccionada no es valida." };
    }

    let validatedSubcategoryId: string | null = null;
    let validatedSubcategoryName: string | null = null;

    if (subcategoryId) {
      const { data: subcategory, error: subcategoryError } = await supabase
        .from("subcategories")
        .select("id,name")
        .eq("id", subcategoryId)
        .eq("category_id", category.id)
        .eq("user_id", user.id)
        .single();

      if (subcategoryError || !subcategory) {
        return { error: "La subcategoria seleccionada no es valida." };
      }

      validatedSubcategoryId = subcategory.id;
      validatedSubcategoryName = subcategory.name;
    }

    const inferredInvestment = isInvestmentCategoryOrSubcategory(
      category.name,
      validatedSubcategoryName,
    );
    const finalIsInvestment = isInvestment || inferredInvestment;

    payload = {
      account_id: account.id,
      amount,
      category_id: category.id,
      counts_for_savings: true,
      date,
      description: description || null,
      include_in_living_expenses: !finalIsInvestment,
      is_fixed: false,
      is_investment: finalIsInvestment,
      is_recurring: false,
      is_travel_income: false,
      merchant: null,
      month: getMonthKey(date),
      status: "confirmed",
      subcategory_id: validatedSubcategoryId,
      type: "expense",
      user_id: user.id,
    };
  } else {
    const { data: subcategory, error: subcategoryError } = await supabase
      .from("subcategories")
      .select("id,name,category_id")
      .eq("id", subcategoryId)
      .eq("user_id", user.id)
      .single();

    if (subcategoryError || !subcategory) {
      return { error: "La fuente seleccionada no es valida." };
    }

    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id,name,type")
      .eq("id", subcategory.category_id)
      .eq("user_id", user.id)
      .single();

    if (categoryError || !category || category.type !== "income") {
      return { error: "La categoria del ingreso no es valida." };
    }

    const inferredTravelIncome = isTravelIncomeSubcategory(subcategory.name);
    const inferredNormalIncome = isNormalIncomeSubcategory(subcategory.name);

    if (incomeDestination === "travel" && !inferredTravelIncome) {
      return { error: "La fuente elegida no pertenece a ingresos VIAJES." };
    }

    if (incomeDestination === "normal" && !inferredNormalIncome) {
      return { error: "La fuente elegida no pertenece a ingresos normales." };
    }

    payload = {
      account_id: account.id,
      amount,
      category_id: category.id,
      counts_for_savings: true,
      date,
      description: description || null,
      include_in_living_expenses: true,
      is_fixed: false,
      is_investment: false,
      is_recurring: false,
      is_travel_income: inferredTravelIncome,
      merchant: null,
      month: getMonthKey(date),
      status: "confirmed",
      subcategory_id: subcategory.id,
      type: "income",
      user_id: user.id,
    };
  }

  const { error } = await supabase.from("transactions").insert(payload);

  if (error) {
    return { error: error.message };
  }

  redirect("/app?created=1");
}
