import { EmptyTransactionsState } from "@/components/transactions/EmptyTransactionsState";
import { PageShell } from "@/components/ui/PageShell";

export default function TransactionsPage() {
  return (
    <PageShell
      description="Listado base para futuros filtros, busqueda y edicion."
      title="Movimientos"
    >
      <EmptyTransactionsState />
    </PageShell>
  );
}
