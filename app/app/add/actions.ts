"use server";

import { redirect } from "next/navigation";
import { applyTransactionToAccountBalance } from "@/lib/accounts/balance";
import { getFinancialMonthKey, parseMoneyInput } from "@/lib/finance";
import {
  isInvestmentCategoryOrSubcategory,
} from "@/lib/finance/transactionRules";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TransactionInsert } from "@/types/finance";

export type CreateTransactionState = {
  error?: string;
};

async function getFinancialMonthSettings(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
) {
  const { data } = await supabase
    .from("user_preferences")
    .select("financial_month_start_day,financial_month_label_mode")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    labelMode: data?.financial_month_label_mode ?? "same",
    startDay: data?.financial_month_start_day ?? 1,
  };
}

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
  const isInvestment = formData.get("isInvestment") === "on";
  const investmentBucketId = String(
    formData.get("investmentBucketId") ?? "",
  ).trim();
  const isReimbursement =
    type === "income" && formData.get("isReimbursement") === "on";
  const reimbursesTransactionId = String(
    formData.get("reimbursesTransactionId") ?? "",
  ).trim();
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

  if (type === "income" && !isReimbursement && !subcategoryId) {
    return { error: "Selecciona una fuente de ingreso." };
  }

  if (isReimbursement && !reimbursesTransactionId) {
    return { error: "Selecciona el gasto que te estan devolviendo." };
  }

  let payload: TransactionInsert;
  const financialMonthSettings = await getFinancialMonthSettings(
    supabase,
    user.id,
  );
  const transactionMonth = getFinancialMonthKey(date, financialMonthSettings);
  let investmentBucket: { id: string; current_balance: number } | null = null;

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

    if (investmentBucketId && !finalIsInvestment) {
      return { error: "La hucha de inversión solo se puede usar con inversiones." };
    }

    if (investmentBucketId && finalIsInvestment) {
      const { data: bucket, error: bucketError } = await supabase
        .from("savings_buckets")
        .select("id,current_balance")
        .eq("id", investmentBucketId)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (bucketError || !bucket) {
        return { error: "La hucha de inversión seleccionada no es valida." };
      }

      investmentBucket = bucket;
    }

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
      month: transactionMonth,
      status: "confirmed",
      subcategory_id: validatedSubcategoryId,
      type: "expense",
      user_id: user.id,
    };
  } else if (isReimbursement) {
    const { data: reimbursedExpense, error: reimbursedExpenseError } =
      await supabase
        .from("transactions")
        .select("id,type")
        .eq("id", reimbursesTransactionId)
        .eq("user_id", user.id)
        .eq("type", "expense")
        .single();

    if (reimbursedExpenseError || !reimbursedExpense) {
      return { error: "El gasto asociado no es valido." };
    }

    payload = {
      account_id: account.id,
      amount,
      category_id: null,
      counts_for_savings: false,
      date,
      description: description || "Reembolso",
      include_in_living_expenses: false,
      is_fixed: false,
      is_investment: false,
      is_reimbursement: true,
      is_recurring: false,
      is_travel_income: false,
      merchant: null,
      month: transactionMonth,
      reimburses_transaction_id: reimbursedExpense.id,
      status: "confirmed",
      subcategory_id: null,
      type: "income",
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
      is_reimbursement: false,
      is_recurring: false,
      is_travel_income: false,
      merchant: null,
      month: transactionMonth,
      reimburses_transaction_id: null,
      status: "confirmed",
      subcategory_id: subcategory.id,
      type: "income",
      user_id: user.id,
    };
  }

  const { data: createdTransaction, error } = await supabase
    .from("transactions")
    .insert(payload)
    .select("id")
    .single();

  if (error || !createdTransaction) {
    return { error: error?.message ?? "No se ha podido crear el movimiento." };
  }

  const balanceError = await applyTransactionToAccountBalance(
    supabase,
    user.id,
    payload,
  );

  if (balanceError) {
    return { error: balanceError.message };
  }

  if (type === "expense" && payload.is_investment && investmentBucketId) {
    const { error: movementError } = await supabase.from("bucket_movements").insert({
      amount: payload.amount,
      bucket_id: investmentBucketId,
      date: payload.date,
      description: payload.description || "Aportación para inversión",
      month: payload.month,
      transaction_id: createdTransaction.id,
      type: "contribution",
      user_id: user.id,
    });

    if (movementError) {
      return { error: movementError.message };
    }

    const { error: bucketUpdateError } = await supabase
      .from("savings_buckets")
      .update({ current_balance: (investmentBucket?.current_balance ?? 0) + payload.amount })
      .eq("id", investmentBucketId)
      .eq("user_id", user.id);

    if (bucketUpdateError) {
      return { error: bucketUpdateError.message };
    }
  }

  redirect("/app?created=1");
}
