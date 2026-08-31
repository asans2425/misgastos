"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { applyTransactionToAccountBalance } from "@/lib/accounts/balance";
import {
  getDateForFinancialMonthDay,
  getMonthKey,
  parseMoneyInput,
} from "@/lib/finance";
import {
  isInvestmentCategoryOrSubcategory,
} from "@/lib/finance/transactionRules";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { RecurringItemType, TablesInsert } from "@/types/database";

export type RecurringFormState = {
  error?: string;
};

function redirectWithStatus(status: string): never {
  redirect(`/app/settings/recurring?status=${status}`);
}

function isChecked(formData: FormData, name: string) {
  return formData.getAll(name).includes("on");
}

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

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, userId: user.id };
}

export async function saveRecurringItem(
  _previousState: RecurringFormState,
  formData: FormData,
): Promise<RecurringFormState> {
  const { supabase, userId } = await getCurrentUser();
  const recurringId = String(formData.get("recurringId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim() as RecurringItemType;
  const accountId = String(formData.get("accountId") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const subcategoryId = String(formData.get("subcategoryId") ?? "").trim();
  const dayOfMonth = Number(formData.get("dayOfMonth"));
  const amount = parseMoneyInput(formData.get("amount"));

  if (!name) {
    return { error: "Pon un nombre para el fijo." };
  }

  if (type !== "income" && type !== "expense") {
    return { error: "Selecciona si es ingreso o gasto." };
  }

  if (amount === null) {
    return { error: "El importe es obligatorio." };
  }

  if (amount < 0) {
    return { error: "El importe debe ser mayor o igual a 0." };
  }

  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    return { error: "El dia del mes debe estar entre 1 y 31." };
  }

  if (!accountId) {
    return { error: "Selecciona una cuenta." };
  }

  if (!categoryId) {
    return { error: "Selecciona una categoria." };
  }

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id")
    .eq("id", accountId)
    .eq("user_id", userId)
    .single();

  if (accountError || !account) {
    return { error: "La cuenta seleccionada no es valida." };
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id,name,type")
    .eq("id", categoryId)
    .eq("user_id", userId)
    .single();

  if (categoryError || !category || category.type !== type) {
    return { error: "La categoria seleccionada no encaja con el tipo." };
  }

  let validatedSubcategoryId: string | null = null;
  let subcategoryName: string | null = null;

  if (subcategoryId) {
    const { data: subcategory, error: subcategoryError } = await supabase
      .from("subcategories")
      .select("id,name")
      .eq("id", subcategoryId)
      .eq("category_id", category.id)
      .eq("user_id", userId)
      .single();

    if (subcategoryError || !subcategory) {
      return { error: "La subcategoria seleccionada no es valida." };
    }

    validatedSubcategoryId = subcategory.id;
    subcategoryName = subcategory.name;
  }

  const isInvestment =
    type === "expense" &&
    isInvestmentCategoryOrSubcategory(category.name, subcategoryName);
  const payload = {
    account_id: account.id,
    amount,
    auto_create: true,
    category_id: category.id,
    day_of_month: dayOfMonth,
    frequency: "monthly",
    include_in_living_expenses: type === "expense" ? !isInvestment : true,
    is_active: isChecked(formData, "isActive"),
    is_investment: isInvestment,
    is_travel_income: false,
    name,
    subcategory_id: validatedSubcategoryId,
    type,
    user_id: userId,
  };

  if (recurringId) {
    const { error } = await supabase
      .from("recurring_items")
      .update(payload)
      .eq("id", recurringId)
      .eq("user_id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/app/settings/recurring");
    redirectWithStatus("updated");
  }

  const { error } = await supabase.from("recurring_items").insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings/recurring");
  redirectWithStatus("created");
}

export async function deleteRecurringItem(formData: FormData) {
  const { supabase, userId } = await getCurrentUser();
  const recurringId = String(formData.get("recurringId") ?? "").trim();

  if (recurringId) {
    await supabase
      .from("recurring_items")
      .delete()
      .eq("id", recurringId)
      .eq("user_id", userId);
  }

  revalidatePath("/app/settings/recurring");
  redirectWithStatus("deleted");
}

export async function generateRecurringTransactions(formData: FormData) {
  const { supabase, userId } = await getCurrentUser();
  const month = String(formData.get("month") ?? getMonthKey()).trim();

  if (!/^\d{4}-\d{2}$/.test(month)) {
    redirectWithStatus("invalid-month");
  }

  const { data: recurringItems } = await supabase
    .from("recurring_items")
    .select(
      "id,name,type,amount,category_id,subcategory_id,account_id,day_of_month,is_investment,is_travel_income,include_in_living_expenses",
    )
    .eq("user_id", userId)
    .eq("is_active", true);
  const { data: existingTransactions } = await supabase
    .from("transactions")
    .select("recurring_item_id")
    .eq("user_id", userId)
    .eq("generated_for_month", month)
    .not("recurring_item_id", "is", null);
  const existingRecurringIds = new Set(
    (existingTransactions ?? []).map((transaction) => transaction.recurring_item_id),
  );
  const financialMonthSettings = await getFinancialMonthSettings(
    supabase,
    userId,
  );
  const rows = (recurringItems ?? [])
    .filter((item) => item.amount > 0)
    .filter((item) => !existingRecurringIds.has(item.id))
    .map<TablesInsert<"transactions">>((item) => {
      const date = getDateForFinancialMonthDay(
        month,
        item.day_of_month,
        financialMonthSettings,
      );

      return {
        account_id: item.account_id,
        amount: item.amount,
        category_id: item.category_id,
        counts_for_savings: true,
        date,
        description: item.name,
        destination_account_id: null,
        generated_for_month: month,
        include_in_living_expenses:
          item.type === "expense" ? item.include_in_living_expenses : true,
        is_fixed: true,
        is_investment: item.type === "expense" ? item.is_investment : false,
        is_recurring: true,
        is_travel_income: item.type === "income" ? item.is_travel_income : false,
        merchant: null,
        month,
        recurring_item_id: item.id,
        status: "confirmed",
        subcategory_id: item.subcategory_id,
        type: item.type,
        user_id: userId,
      };
    });

  if (rows.length > 0) {
    const { error } = await supabase.from("transactions").insert(rows);

    if (error) {
      redirectWithStatus("generate-error");
    }

    for (const row of rows) {
      await applyTransactionToAccountBalance(supabase, userId, row);
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/transactions");
  revalidatePath("/app/settings/recurring");
  redirectWithStatus(`generated-${rows.length}`);
}
