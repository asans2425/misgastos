"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectWithStatus(status: string): never {
  redirect(`/app/settings?status=${status}`);
}

export async function saveMonthPreferences(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const startDay = Number(formData.get("financialMonthStartDay"));
  const labelMode = startDay >= 16 ? "next" : "same";

  if (!Number.isInteger(startDay) || startDay < 1 || startDay > 31) {
    redirectWithStatus("invalid-financial-month");
  }

  const { error } = await supabase
    .from("user_preferences")
    .upsert(
      {
        financial_month_label_mode: labelMode,
        financial_month_start_day: startDay,
        user_id: user.id,
      },
      { onConflict: "user_id" },
    );

  if (error) {
    redirectWithStatus("preferences-error");
  }

  revalidatePath("/app");
  revalidatePath("/app/transactions");
  revalidatePath("/app/settings");
  redirectWithStatus("preferences-updated");
}
