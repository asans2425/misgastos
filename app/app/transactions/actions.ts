"use server";

import { redirect } from "next/navigation";
import {
  replaceTransactionInAccountBalance,
  revertTransactionFromAccountBalance,
} from "@/lib/accounts/balance";
import { getFinancialMonthKey, parseMoneyInput } from "@/lib/finance";
import {
  isInvestmentCategoryOrSubcategory,
  isTravelIncomeSubcategory,
} from "@/lib/finance/transactionRules";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TransactionStatus } from "@/types/database";

export type UpdateTransactionState = {
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

function withOutcome(returnTo: string, outcome: "deleted" | "updated") {
  const [pathname, query = ""] = returnTo.split("?");
  const params = new URLSearchParams(query);

  params.set(outcome, "1");

  return `${pathname}?${params.toString()}`;
}

export async function updateTransaction(
  _previousState: UpdateTransactionState,
  formData: FormData,
): Promise<UpdateTransactionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const transactionId = String(formData.get("transactionId") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "/app/transactions");
  const type = String(formData.get("type") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const subcategoryId = String(formData.get("subcategoryId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as TransactionStatus;
  const isReimbursement =
    type === "income" && formData.get("isReimbursement") === "on";
  const reimbursesTransactionId = String(
    formData.get("reimbursesTransactionId") ?? "",
  ).trim();
  const amount = parseMoneyInput(formData.get("amount"));

  if (!transactionId) {
    return { error: "No se ha encontrado el movimiento." };
  }

  if (type !== "expense" && type !== "income" && type !== "transfer") {
    return { error: "Tipo de movimiento no valido." };
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

  if (!["pending", "confirmed", "edited"].includes(status)) {
    return { error: "Estado no valido." };
  }

  const { data: existingTransaction, error: transactionError } = await supabase
    .from("transactions")
    .select("id,account_id,amount,type")
    .eq("id", transactionId)
    .eq("user_id", user.id)
    .single();

  if (transactionError || !existingTransaction) {
    return { error: "No se ha encontrado el movimiento." };
  }

  if (type === "expense" && !categoryId) {
    return { error: "Selecciona una categoria." };
  }

  if (type === "income" && !isReimbursement && !subcategoryId) {
    return { error: "Selecciona una subcategoria." };
  }

  if (isReimbursement && !reimbursesTransactionId) {
    return { error: "Selecciona el gasto asociado al reembolso." };
  }

  let nextCategoryId: string | null = null;
  let nextSubcategoryId: string | null = null;
  let isInvestment = false;
  let includeInLivingExpenses = true;
  let isTravelIncome = false;
  let nextReimbursesTransactionId: string | null = null;

  if (type === "expense") {
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id,name,type")
      .eq("id", categoryId)
      .eq("user_id", user.id)
      .single();

    if (categoryError || !category || category.type !== "expense") {
      return { error: "La categoria seleccionada no es valida." };
    }

    nextCategoryId = category.id;
    let subcategoryName: string | null = null;

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

      nextSubcategoryId = subcategory.id;
      subcategoryName = subcategory.name;
    }

    isInvestment = isInvestmentCategoryOrSubcategory(category.name, subcategoryName);
    includeInLivingExpenses = !isInvestment;
  }

  if (type === "income" && isReimbursement) {
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

    nextReimbursesTransactionId = reimbursedExpense.id;
    includeInLivingExpenses = false;
    isInvestment = false;
    isTravelIncome = false;
  }

  if (type === "income" && !isReimbursement) {
    const { data: subcategory, error: subcategoryError } = await supabase
      .from("subcategories")
      .select("id,name,category_id")
      .eq("id", subcategoryId)
      .eq("user_id", user.id)
      .single();

    if (subcategoryError || !subcategory) {
      return { error: "La subcategoria seleccionada no es valida." };
    }

    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id,type")
      .eq("id", subcategory.category_id)
      .eq("user_id", user.id)
      .single();

    if (categoryError || !category || category.type !== "income") {
      return { error: "La categoria del ingreso no es valida." };
    }

    nextCategoryId = category.id;
    nextSubcategoryId = subcategory.id;
    isTravelIncome = isTravelIncomeSubcategory(subcategory.name);
    includeInLivingExpenses = true;
    isInvestment = false;
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      amount,
      category_id: nextCategoryId,
      date,
      description: description || null,
      include_in_living_expenses: includeInLivingExpenses,
      is_investment: isInvestment,
      is_reimbursement: isReimbursement,
      is_travel_income: isTravelIncome,
      month: getFinancialMonthKey(
        date,
        await getFinancialMonthSettings(supabase, user.id),
      ),
      reimburses_transaction_id: nextReimbursesTransactionId,
      status,
      subcategory_id: nextSubcategoryId,
      type,
    })
    .eq("id", existingTransaction.id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  const balanceError = await replaceTransactionInAccountBalance(
    supabase,
    user.id,
    existingTransaction,
    {
      account_id: existingTransaction.account_id,
      amount,
      type,
    },
  );

  if (balanceError) {
    return { error: balanceError.message };
  }

  redirect(withOutcome(returnTo, "updated"));
}

export async function deleteTransaction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const transactionId = String(formData.get("transactionId") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "/app/transactions");

  if (!transactionId) {
    redirect(returnTo);
  }

  const { data: existingTransaction } = await supabase
    .from("transactions")
    .select("id,account_id,amount,type")
    .eq("id", transactionId)
    .eq("user_id", user.id)
    .single();

  const { data: linkedBucketMovement } = await supabase
    .from("bucket_movements")
    .select("id,bucket_id,amount,type")
    .eq("transaction_id", transactionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (linkedBucketMovement?.type === "contribution") {
    const { data: bucket } = await supabase
      .from("savings_buckets")
      .select("id,current_balance")
      .eq("id", linkedBucketMovement.bucket_id)
      .eq("user_id", user.id)
      .single();

    if (bucket) {
      const { error: bucketError } = await supabase
        .from("savings_buckets")
        .update({
          current_balance: bucket.current_balance - linkedBucketMovement.amount,
        })
        .eq("id", bucket.id)
        .eq("user_id", user.id);

      if (bucketError) {
        redirect(returnTo);
      }
    }
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", user.id);

  if (error) {
    redirect(returnTo);
  }

  if (existingTransaction) {
    await revertTransactionFromAccountBalance(
      supabase,
      user.id,
      existingTransaction,
    );
  }

  redirect(withOutcome(returnTo, "deleted"));
}
