import { cn } from "@/lib/utils/cn";

type DashboardMetricCardProps = Readonly<{
  accent?: "amber" | "blue" | "emerald" | "rose" | "slate" | "teal";
  helper?: string;
  label: string;
  value: string;
}>;

const accents: Record<NonNullable<DashboardMetricCardProps["accent"]>, string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-950",
  blue: "border-sky-200 bg-sky-50 text-sky-950",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
  rose: "border-rose-200 bg-rose-50 text-rose-950",
  slate: "border-slate-200 bg-white text-slate-950",
  teal: "border-teal-200 bg-teal-50 text-teal-950",
};

export function DashboardMetricCard({
  accent = "slate",
  helper,
  label,
  value,
}: DashboardMetricCardProps) {
  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border p-2 shadow-sm sm:p-5",
        accents[accent],
      )}
    >
      <p className="truncate text-[10px] font-semibold uppercase leading-tight text-current opacity-70 sm:text-sm sm:normal-case">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold tracking-tight sm:mt-3 sm:text-3xl">
        {value}
      </p>
      {helper ? (
        <p className="mt-2 hidden text-xs font-medium uppercase tracking-wide opacity-60 sm:block">
          {helper}
        </p>
      ) : null}
    </article>
  );
}
