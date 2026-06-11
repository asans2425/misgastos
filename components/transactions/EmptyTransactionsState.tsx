import Link from "next/link";
import { CirclePlus, ListChecks } from "lucide-react";

export function EmptyTransactionsState() {
  return (
    <section className="rounded-lg border border-dashed border-border-soft bg-surface p-6 text-center shadow-sm">
      <ListChecks
        aria-hidden="true"
        className="mx-auto mb-3 text-slate-400"
        size={32}
      />
      <h2 className="text-base font-semibold">Sin movimientos todavia</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Esta pantalla queda lista para listar gastos e ingresos cuando exista la
        capa de datos.
      </p>
      <Link
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong"
        href="/app/add"
      >
        <CirclePlus aria-hidden="true" size={18} />
        Anadir movimiento
      </Link>
    </section>
  );
}
