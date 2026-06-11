import { MonthlySnapshot } from "@/components/dashboard/MonthlySnapshot";
import { PageShell } from "@/components/ui/PageShell";

export default function AppHomePage() {
  return (
    <PageShell
      description="Vista privada inicial preparada para conectar datos reales en la siguiente fase."
      title="Resumen mensual"
    >
      <MonthlySnapshot />
    </PageShell>
  );
}
