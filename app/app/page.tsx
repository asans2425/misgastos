import { redirect } from "next/navigation";
import { MonthlySnapshot } from "@/components/dashboard/MonthlySnapshot";
import { StatCard } from "@/components/ui/StatCard";
import { PageShell } from "@/components/ui/PageShell";
import { getMonthKey } from "@/lib/finance";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function readCount(result: { count: number | null; error: { message: string } | null }) {
  if (result.error) {
    throw new Error(result.error.message);
  }

  return String(result.count ?? 0);
}

export default async function AppHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    accounts,
    categories,
    subcategories,
    recurringItems,
    quickActions,
  ] = await Promise.all([
    supabase.from("accounts").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase
      .from("subcategories")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("recurring_items")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("quick_actions")
      .select("id", { count: "exact", head: true }),
  ]);

  return (
    <PageShell
      description="Estado basico de autenticacion y datos iniciales del usuario."
      title="Resumen mensual"
    >
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Usuario" value={user.email ?? "Usuario"} />
        <StatCard label="Mes actual" tone="accent" value={getMonthKey()} />
        <StatCard label="Cuentas" tone="positive" value={readCount(accounts)} />
        <StatCard label="Categorias" value={readCount(categories)} />
        <StatCard label="Subcategorias" value={readCount(subcategories)} />
        <StatCard label="Recurrentes" value={readCount(recurringItems)} />
        <StatCard
          label="Acciones rapidas"
          tone="positive"
          value={readCount(quickActions)}
        />
      </section>

      <MonthlySnapshot />
    </PageShell>
  );
}
