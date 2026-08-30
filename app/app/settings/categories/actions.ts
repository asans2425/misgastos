"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CategoryType, DestinationType } from "@/types/database";

export type CategoryFormState = {
  error?: string;
};

function redirectWithStatus(status: string): never {
  redirect(`/app/settings/categories?status=${status}`);
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

export async function saveCategory(
  _previousState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const { supabase, userId } = await getCurrentUser();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim() as CategoryType;
  const icon = String(formData.get("icon") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const isActive = isChecked(formData, "isActive");

  if (!name) {
    return { error: "Pon un nombre para la categoria." };
  }

  if (type !== "income" && type !== "expense") {
    return { error: "Selecciona si es de ingresos o gastos." };
  }

  const payload = {
    color: color || null,
    icon: icon || null,
    is_active: isActive,
    is_system: false,
    name,
    type,
    user_id: userId,
  };

  if (categoryId) {
    const { error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", categoryId)
      .eq("user_id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/app/settings/categories");
    redirectWithStatus("category-updated");
  }

  const { error } = await supabase.from("categories").insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings/categories");
  redirectWithStatus("category-created");
}

export async function saveSubcategory(
  _previousState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const { supabase, userId } = await getCurrentUser();
  const subcategoryId = String(formData.get("subcategoryId") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const defaultDestination = String(
    formData.get("defaultDestination") ?? "normal",
  ) as DestinationType;
  const isInvestment = isChecked(formData, "isInvestment");
  const isActive = isChecked(formData, "isActive");

  if (!categoryId) {
    return { error: "Selecciona una categoria." };
  }

  if (!name) {
    return { error: "Pon un nombre para la subcategoria." };
  }

  if (!["normal", "ahorros", "viajes"].includes(defaultDestination)) {
    return { error: "Destino por defecto no valido." };
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id,type")
    .eq("id", categoryId)
    .eq("user_id", userId)
    .single();

  if (categoryError || !category) {
    return { error: "La categoria seleccionada no es valida." };
  }

  const payload = {
    category_id: category.id,
    default_destination: category.type === "income" ? defaultDestination : "normal",
    is_active: isActive,
    is_investment: category.type === "expense" ? isInvestment : false,
    is_travel_income: false,
    name,
    user_id: userId,
  };

  if (subcategoryId) {
    const { error } = await supabase
      .from("subcategories")
      .update(payload)
      .eq("id", subcategoryId)
      .eq("user_id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/app/settings/categories");
    redirectWithStatus("subcategory-updated");
  }

  const { error } = await supabase.from("subcategories").insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings/categories");
  redirectWithStatus("subcategory-created");
}

export async function deleteCategory(formData: FormData) {
  const { supabase, userId } = await getCurrentUser();
  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (categoryId) {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("user_id", userId);

    if (error) {
      redirectWithStatus("delete-error");
    }
  }

  revalidatePath("/app/settings/categories");
  redirectWithStatus("category-deleted");
}

export async function deleteSubcategory(formData: FormData) {
  const { supabase, userId } = await getCurrentUser();
  const subcategoryId = String(formData.get("subcategoryId") ?? "").trim();

  if (subcategoryId) {
    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("id", subcategoryId)
      .eq("user_id", userId);

    if (error) {
      redirectWithStatus("delete-error");
    }
  }

  revalidatePath("/app/settings/categories");
  redirectWithStatus("subcategory-deleted");
}
