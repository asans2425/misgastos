import { redirect } from "next/navigation";
import { BucketsManager } from "@/components/settings/buckets/BucketsManager";
import { PageShell } from "@/components/ui/PageShell";
import { ensureDefaultSavingsBuckets } from "@/lib/auth/initialization";
import {
  isSupabaseSchemaMissingError,
  throwIfSupabaseError,
} from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BucketsSettingsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function BucketsSettingsPage({
  searchParams,
}: BucketsSettingsPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    await ensureDefaultSavingsBuckets(user.id, supabase);
  } catch (error) {
    if (isSupabaseSchemaMissingError(error)) {
      return (
        <PageShell
          description="Falta aplicar la migracion de huchas en Supabase."
          title="Huchas"
        >
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <h2 className="text-base font-semibold text-amber-950">
              Falta crear las tablas de huchas
            </h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              La app ya esta preparada, pero tu Supabase remoto todavia no tiene
              `savings_buckets` y `bucket_movements`. Aplica esta migracion en
              el SQL Editor de Supabase y recarga esta pagina.
            </p>
            <code className="mt-4 block break-all rounded-md bg-amber-950 p-3 text-sm text-amber-50">
              supabase/migrations/20260830123000_add_savings_buckets.sql
            </code>
          </section>
        </PageShell>
      );
    }

    throw error;
  }

  const { data: bucketRows, error: bucketsError } = await supabase
    .from("savings_buckets")
    .select("id,name,target_amount,initial_balance,current_balance,color,icon,is_active,sort_order")
    .eq("user_id", user.id)
    .order("is_active", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  try {
    throwIfSupabaseError(bucketsError);
  } catch (error) {
    if (isSupabaseSchemaMissingError(error)) {
      return (
        <PageShell
          description="Falta aplicar la migracion de huchas en Supabase."
          title="Huchas"
        >
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <h2 className="text-base font-semibold text-amber-950">
              Falta crear las tablas de huchas
            </h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              Aplica la migracion de huchas en Supabase y vuelve a cargar.
            </p>
            <code className="mt-4 block break-all rounded-md bg-amber-950 p-3 text-sm text-amber-50">
              supabase/migrations/20260830123000_add_savings_buckets.sql
            </code>
          </section>
        </PageShell>
      );
    }

    throw error;
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <PageShell
      description="Aparta dinero en huchas sin que cuente como gasto."
      title="Huchas"
    >
      <BucketsManager
        buckets={(bucketRows ?? []).map((bucket) => ({
          color: bucket.color,
          currentBalance: bucket.current_balance,
          icon: bucket.icon,
          id: bucket.id,
          initialBalance: bucket.initial_balance,
          isActive: bucket.is_active,
          name: bucket.name,
          targetAmount: bucket.target_amount,
        }))}
        defaultDate={today}
        status={params.status}
      />
    </PageShell>
  );
}
