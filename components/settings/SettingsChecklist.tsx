import { CheckCircle2, CircleDashed } from "lucide-react";

const items = [
  { done: true, label: "Proyecto Next.js configurado" },
  { done: true, label: "Tailwind CSS activo" },
  { done: true, label: "Dependencias base instaladas" },
  { done: false, label: "Autenticacion Supabase" },
  { done: false, label: "Modelo de datos y migraciones" },
];

export function SettingsChecklist() {
  return (
    <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
      <ul className="space-y-3">
        {items.map((item) => {
          const Icon = item.done ? CheckCircle2 : CircleDashed;

          return (
            <li className="flex items-center gap-3 text-sm" key={item.label}>
              <Icon
                aria-hidden="true"
                className={item.done ? "text-brand" : "text-slate-400"}
                size={18}
              />
              <span className={item.done ? "text-foreground" : "text-slate-500"}>
                {item.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
