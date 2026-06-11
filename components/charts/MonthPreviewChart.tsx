"use client";

import dynamic from "next/dynamic";

const MonthPreviewChartCanvas = dynamic(
  () =>
    import("@/components/charts/MonthPreviewChartCanvas").then(
      (mod) => mod.MonthPreviewChartCanvas,
    ),
  {
    loading: () => <div className="h-full rounded-md bg-surface-muted" />,
    ssr: false,
  },
);

export function MonthPreviewChart() {
  return (
    <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
      <div className="h-64 w-full">
        <MonthPreviewChartCanvas />
      </div>
    </section>
  );
}
