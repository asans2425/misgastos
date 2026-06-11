import { SettingsChecklist } from "@/components/settings/SettingsChecklist";
import { PageShell } from "@/components/ui/PageShell";

export default function SettingsPage() {
  return (
    <PageShell
      description="Espacio preparado para perfil, preferencias y conexion con Supabase."
      title="Ajustes"
    >
      <SettingsChecklist />
    </PageShell>
  );
}
