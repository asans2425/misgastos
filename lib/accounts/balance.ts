import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TransactionType } from "@/types/database";

type BalanceTransaction = {
  account_id?: string | null;
  amount: number;
  type: TransactionType;
};

function getBalanceDelta(transaction: BalanceTransaction) {
  if (transaction.type === "income") {
    return transaction.amount;
  }

  if (transaction.type === "expense") {
    return -transaction.amount;
  }

  return 0;
}

async function adjustAccountBalance(
  supabase: SupabaseClient<Database>,
  userId: string,
  accountId: string,
  delta: number,
) {
  if (delta === 0) {
    return null;
  }

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id,current_balance")
    .eq("id", accountId)
    .eq("user_id", userId)
    .single();

  if (accountError || !account) {
    return accountError ?? new Error("No se ha encontrado la cuenta.");
  }

  const { error: updateError } = await supabase
    .from("accounts")
    .update({ current_balance: account.current_balance + delta })
    .eq("id", account.id)
    .eq("user_id", userId);

  return updateError;
}

export async function applyTransactionToAccountBalance(
  supabase: SupabaseClient<Database>,
  userId: string,
  transaction: BalanceTransaction,
) {
  if (!transaction.account_id) {
    return null;
  }

  return adjustAccountBalance(
    supabase,
    userId,
    transaction.account_id,
    getBalanceDelta(transaction),
  );
}

export async function revertTransactionFromAccountBalance(
  supabase: SupabaseClient<Database>,
  userId: string,
  transaction: BalanceTransaction,
) {
  if (!transaction.account_id) {
    return null;
  }

  return adjustAccountBalance(
    supabase,
    userId,
    transaction.account_id,
    -getBalanceDelta(transaction),
  );
}

export async function replaceTransactionInAccountBalance(
  supabase: SupabaseClient<Database>,
  userId: string,
  previous: BalanceTransaction,
  next: BalanceTransaction,
) {
  const previousDelta = previous.account_id ? -getBalanceDelta(previous) : 0;
  const nextDelta = next.account_id ? getBalanceDelta(next) : 0;

  if (previous.account_id && previous.account_id === next.account_id) {
    return adjustAccountBalance(
      supabase,
      userId,
      previous.account_id,
      previousDelta + nextDelta,
    );
  }

  if (previous.account_id) {
    const previousError = await adjustAccountBalance(
      supabase,
      userId,
      previous.account_id,
      previousDelta,
    );

    if (previousError) {
      return previousError;
    }
  }

  if (next.account_id) {
    return adjustAccountBalance(supabase, userId, next.account_id, nextDelta);
  }

  return null;
}
