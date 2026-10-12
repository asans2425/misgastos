"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyTrendPoint } from "@/lib/analysis";
import { formatMoney } from "@/lib/finance";
import { cn } from "@/lib/utils/cn";

type Metric = "balance" | "expenses" | "income";

const metrics: Array<{ label: string; value: Metric }> = [
  { label: "Gastos", value: "expenses" },
  { label: "Ingresos", value: "income" },
  { label: "Ahorrado", value: "balance" },
];

function formatAxisValue(value: number) {
  return String(Math.round(Number(value)));
}

function formatMonthTick(value: string) {
  const [month, year] = value.split(" ");

  return year ? `${month} ${year.slice(-2)}` : value;
}

export function MonthlyTrendChart({
  data,
}: {
  data: readonly MonthlyTrendPoint[];
}) {
  const [metric, setMetric] = useState<Metric>("expenses");
  const [selectedIndex, setSelectedIndex] = useState(Math.max(data.length - 1, 0));
  const activeIndex = Math.min(selectedIndex, Math.max(data.length - 1, 0));
  const selectedPoint = data[activeIndex];
  const currentMonthKey = [
    new Date().getFullYear(),
    String(new Date().getMonth() + 1).padStart(2, "0"),
  ].join("-");
  const metricColor = metric === "expenses" ? "#d97706" : "#0f766e";

  return (
    <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Evolución</h2>
          <p className="text-sm text-slate-500">
            Comportamiento mensual del periodo.
          </p>
        </div>
        <div className="grid grid-cols-3 rounded-md bg-surface-muted p-1">
          {metrics.map((item) => (
            <button
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold text-slate-500",
                item.value === metric && "bg-white text-brand shadow-sm",
              )}
              key={item.value}
              onClick={() => setMetric(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {selectedPoint ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md bg-surface-muted px-3 py-2">
          <button
            aria-label="Mes anterior del gráfico"
            className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border-soft bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={activeIndex === 0}
            onClick={() => setSelectedIndex((index) => Math.max(index - 1, 0))}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {selectedPoint.label}
            </p>
            <p className="text-lg font-semibold text-slate-950">
              {formatMoney(selectedPoint[metric])}
            </p>
          </div>
          <button
            aria-label="Mes siguiente del gráfico"
            className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border-soft bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={activeIndex === data.length - 1}
            onClick={() =>
              setSelectedIndex((index) => Math.min(index + 1, data.length - 1))
            }
            type="button"
          >
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </div>
      ) : null}

      {data.every((point) => point.expenses === 0 && point.income === 0) ? (
        <p className="rounded-md bg-surface-muted p-4 text-sm text-slate-500">
          Añade algunos movimientos para ver la evolución mensual.
        </p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              data={data}
              margin={{ bottom: 6, left: 8, right: 12, top: 12 }}
              barCategoryGap="18%"
            >
              <CartesianGrid horizontal={true} vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis
                axisLine={false}
                dataKey="label"
                angle={-45}
                dy={12}
                height={72}
                interval={0}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={formatMonthTick}
                tickLine={false}
                textAnchor="end"
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={formatAxisValue}
                tickLine={false}
                width={56}
              />
              <Tooltip
                formatter={(value) => [formatMoney(Number(value)), ""]}
                labelClassName="font-semibold text-slate-950"
              />
              <Bar
                dataKey={metric}
                fill={metricColor}
                radius={[5, 5, 0, 0]}
              >
                {data.map((point, index) => (
                  <Cell
                    fill={point.month === currentMonthKey ? "#0f766e" : metricColor}
                    key={point.month}
                    stroke={index === activeIndex ? "#0f172a" : "none"}
                    strokeWidth={index === activeIndex ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
