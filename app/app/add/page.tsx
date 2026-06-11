import { TransactionDraftForm } from "@/components/forms/TransactionDraftForm";
import { PageShell } from "@/components/ui/PageShell";

export default function AddTransactionPage() {
  return (
    <PageShell
      description="Formulario visual inicial, sin persistencia todavia."
      title="Nuevo movimiento"
    >
      <TransactionDraftForm />
    </PageShell>
  );
}
