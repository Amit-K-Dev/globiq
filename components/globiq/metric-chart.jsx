"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

const COLORS = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#dc2626", // red-600
  "#d97706", // amber-600
  "#9333ea", // purple-600
  "#0891b2", // cyan-600
  "#be123c", // rose-700
  "#15803d", // green-700
  "#4338ca", // indigo-700
  "#0f766e", // teal-700
];

export default function MetricChart({ data, countries, metric }) {
  const { theme, systemTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const formatValue = (val) => {
    if (val === undefined || val === null) return "N/A";
    if (metric.format_type === "currency") {
      if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
      if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
      return `$${val.toLocaleString()}`;
    }
    if (metric.format_type === "percentage") {
      return `${val > 0 ? '+' : ''}${val}%`;
    }
    if (metric.format_type === "number") {
      let numStr = "";
      if (val >= 1e9) numStr = `${(val / 1e9).toFixed(2)}B`;
      else if (val >= 1e6) numStr = `${(val / 1e6).toFixed(2)}M`;
      else numStr = val.toLocaleString();
      return metric.unit ? `${numStr} ${metric.unit}` : numStr;
    }
    return val.toString();
  };

  if (!mounted) {
    return (
      <Card className="col-span-full xl:col-span-2">
        <CardHeader>
          <CardTitle>Historical Trend</CardTitle>
          <CardDescription>Top countries over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-100 w-full bg-muted/20 animate-pulse rounded-md" />
        </CardContent>
      </Card>
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <Card className="col-span-full xl:col-span-2 shadow-sm">
      <CardHeader>
        <CardTitle>Historical Trend</CardTitle>
        <CardDescription>Top countries over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-100 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#e5e5e5"} vertical={false} />
              <XAxis 
                dataKey="year" 
                stroke={isDark ? "#888" : "#666"}
                tick={{ fill: isDark ? "#888" : "#666", fontSize: 13 }} 
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tickFormatter={formatValue} 
                stroke={isDark ? "#888" : "#666"}
                tick={{ fill: isDark ? "#888" : "#666", fontSize: 13 }}
                width={70}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value, name) => [formatValue(value), name]}
                contentStyle={{ 
                  backgroundColor: isDark ? "#1e293b" : "#fff",
                  borderColor: isDark ? "#334155" : "#e2e8f0",
                  color: isDark ? "#f8fafc" : "#0f172a",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                }}
                itemStyle={{
                  paddingTop: "4px"
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              {countries.map((country, index) => (
                <Line
                  key={country}
                  type="monotone"
                  dataKey={country}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  dot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
