"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const previewData = [
  { amount: 0, category: "Casa" },
  { amount: 0, category: "Comida" },
  { amount: 0, category: "Transporte" },
  { amount: 0, category: "Ocio" },
];

export function MonthPreviewChartCanvas() {
  return (
    <ResponsiveContainer height="100%" width="100%">
      <BarChart data={previewData}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="category" tickLine={false} />
        <YAxis allowDecimals={false} tickLine={false} />
        <Tooltip cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey="amount" fill="#0f766e" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
