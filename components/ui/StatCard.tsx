import { cn } from "@/lib/utils/cn";

type StatCardProps = Readonly<{
  label: string;
  tone?: "accent" | "danger" | "neutral" | "positive";
  value: string;
}>;

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  accent: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-900",
  neutral: "border-border-soft bg-surface text-foreground",
  positive: "border-teal-200 bg-teal-50 text-teal-900",
};

export function StatCard({ label, tone = "neutral", value }: StatCardProps) {
  return (
    <article
      className={cn("rounded-lg border p-4 shadow-sm", toneClasses[tone])}
    >
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </article>
  );
}
