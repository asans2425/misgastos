"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMonthKey, parseMoneyInput } from "@/lib/finance";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BucketMovementType } from "@/types/database";

export type BucketFormState = {
  error?: string;
};

function redirectWithStatus(status: string): never {
  redirect(`/app/settings/buckets?status=${status}`);
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

function isChecked(formData: FormData, name: string) {
  return formData.getAll(name).includes("on");
}

export async function saveBucket(
  _previousState: BucketFormState,
  formData: FormData,
): Promise<BucketFormState> {
  const { supabase, userId } = await getCurrentUser();
  const bucketId = String(formData.get("bucketId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();
  const initialBalance = parseMoneyInput(formData.get("initialBalance")) ?? 0;
  const targetAmount = parseMoneyInput(formData.get("targetAmount"));
  const isActive = isChecked(formData, "isActive");

  if (!name) {
    return { error: "Pon un nombre para la hucha." };
  }

  if (initialBalance < 0) {
    return { error: "El saldo inicial debe ser mayor o igual a 0." };
  }

  if (targetAmount !== null && targetAmount < 0) {
    return { error: "El objetivo debe ser mayor o igual a 0." };
  }

  let movementBalance = 0;

  if (bucketId) {
    const { data: movements, error: movementsError } = await supabase
      .from("bucket_movements")
      .select("amount,type")
      .eq("bucket_id", bucketId)
      .eq("user_id", userId);

    if (movementsError) {
      return { error: movementsError.message };
    }

    movementBalance = (movements ?? []).reduce((total, movement) => {
      return total + (movement.type === "contribution" ? movement.amount : -movement.amount);
    }, 0);
  }

  const payload = {
    color: color || null,
    current_balance: initialBalance + movementBalance,
    icon: icon || null,
    initial_balance: initialBalance,
    is_active: isActive,
    name,
    target_amount: targetAmount,
    user_id: userId,
  };

  if (bucketId) {
    const { error } = await supabase
      .from("savings_buckets")
      .update(payload)
      .eq("id", bucketId)
      .eq("user_id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/app");
    revalidatePath("/app/settings/buckets");
    redirectWithStatus("updated");
  }

  const { error } = await supabase.from("savings_buckets").insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings/buckets");
  redirectWithStatus("created");
}

export async function deleteBucket(formData: FormData) {
  const { supabase, userId } = await getCurrentUser();
  const bucketId = String(formData.get("bucketId") ?? "").trim();

  if (bucketId) {
    const { error } = await supabase
      .from("savings_buckets")
      .delete()
      .eq("id", bucketId)
      .eq("user_id", userId);

    if (error) {
      redirectWithStatus("delete-error");
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/settings/buckets");
  redirectWithStatus("deleted");
}

export async function createBucketMovement(
  _previousState: BucketFormState,
  formData: FormData,
): Promise<BucketFormState> {
  const { supabase, userId } = await getCurrentUser();
  const bucketId = String(formData.get("bucketId") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim() as BucketMovementType;
  const date = String(formData.get("date") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const amount = parseMoneyInput(formData.get("amount"));

  if (!bucketId) {
    return { error: "Selecciona una hucha." };
  }

  if (type !== "contribution" && type !== "withdrawal") {
    return { error: "Selecciona aportar o retirar." };
  }

  if (amount === null) {
    return { error: "El importe es obligatorio." };
  }

  if (amount <= 0) {
    return { error: "El importe debe ser mayor que 0." };
  }

  if (!date) {
    return { error: "La fecha es obligatoria." };
  }

  const { data: bucket, error: bucketError } = await supabase
    .from("savings_buckets")
    .select("id,current_balance")
    .eq("id", bucketId)
    .eq("user_id", userId)
    .single();

  if (bucketError || !bucket) {
    return { error: "La hucha seleccionada no es valida." };
  }

  const delta = type === "contribution" ? amount : -amount;
  const nextBalance = bucket.current_balance + delta;
  const { error: insertError } = await supabase.from("bucket_movements").insert({
    amount,
    bucket_id: bucket.id,
    date,
    description: description || null,
    month: getMonthKey(date),
    type,
    user_id: userId,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  const { error: updateError } = await supabase
    .from("savings_buckets")
    .update({ current_balance: nextBalance })
    .eq("id", bucket.id)
    .eq("user_id", userId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings/buckets");
  redirectWithStatus(type === "contribution" ? "contributed" : "withdrawn");
}
