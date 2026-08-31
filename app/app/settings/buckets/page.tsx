import { BucketsManager } from "@/components/settings/buckets/BucketsManager";
import { PageShell } from "@/components/ui/PageShell";
import { ensureDefaultSavingsBuckets } from "@/lib/auth/initialization";
import { requireCurrentUser } from "@/lib/auth/currentUser";
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
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();

  try {
    await ensureDefaultSavingsBuckets(user.id, supabase);
  } catch (error) {
    if (isSupabaseSchemaMissingError(error)) {
      return (
        <PageShell
          description="Estamos preparando esta parte de la app."
          title="Huchas"
        >
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <h2 className="text-base font-semibold text-amber-950">
              Huchas no disponibles
            </h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              No hemos podido cargar tus huchas en este momento. Prueba a
              recargar en unos segundos.
            </p>
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
          description="Estamos preparando esta parte de la app."
          title="Huchas"
        >
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <h2 className="text-base font-semibold text-amber-950">
              Huchas no disponibles
            </h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              No hemos podido cargar tus huchas en este momento. Prueba a
              recargar en unos segundos.
            </p>
          </section>
        </PageShell>
      );
    }

    throw error;
  }

  const { data: accountRows, error: accountsError } = await supabase
    .from("accounts")
    .select("id,name,current_balance")
    .eq("user_id", user.id)
    .eq("type", "normal")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(1);

  throwIfSupabaseError(accountsError);

  const today = new Date().toISOString().slice(0, 10);
  const primaryAccount = accountRows?.[0] ?? null;

  return (
    <PageShell
      description="Controla tu cuenta principal y tus huchas sin afectar a las estadisticas."
      title="Patrimonio y huchas"
    >
      <BucketsManager
        primaryAccount={
          primaryAccount
            ? {
                balance: primaryAccount.current_balance,
                id: primaryAccount.id,
                name: primaryAccount.name,
              }
            : null
        }
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
