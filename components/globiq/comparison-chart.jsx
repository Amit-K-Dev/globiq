"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { formatMetricValue } from "@/lib/utils/format";

const COLORS = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#dc2626", // red-600
  "#ca8a04", // yellow-600
  "#9333ea", // purple-600
];

export default function ComparisonChart({ data, countries, metric }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground bg-muted/20 rounded-md">No historical data available</div>;
  }

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis 
            dataKey="year" 
            tick={{ fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={{ stroke: "var(--border)" }}
          />
          <YAxis 
            tick={{ fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
            tickFormatter={(val) => formatMetricValue(val, metric, true)}
            width={80}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "var(--background)", 
              borderColor: "var(--border)",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
            }}
            formatter={(value, name) => [formatMetricValue(value, metric), name]}
            labelStyle={{ color: "var(--foreground)", fontWeight: "bold", marginBottom: "0.25rem" }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "1rem" }}
          />
          {countries.map((country, idx) => (
            <Line 
              key={country}
              type="monotone" 
              dataKey={country} 
              stroke={COLORS[idx % COLORS.length]} 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
