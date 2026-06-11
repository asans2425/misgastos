import { MonthPreviewChart } from "@/components/charts/MonthPreviewChart";
import { PageShell } from "@/components/ui/PageShell";

export default function AnalysisPage() {
  return (
    <PageShell
      description="Base para graficas mensuales y comparativas."
      title="Analisis"
    >
      <MonthPreviewChart />
    </PageShell>
  );
}
