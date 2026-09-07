"use client";

import React, { useState, useSyncExternalStore } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatMetricValue } from "@/lib/utils/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";

// Subscribe to window resize to fix recharts hydration issues with responsive container
const subscribe = (callback) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', callback);
    return () => window.removeEventListener('resize', callback);
  }
  return () => {};
};

const getSnapshot = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth;
  }
  return 1024; // Default SSR width
};

const getServerSnapshot = () => 1024;

export default function CountryHistoryChart({ stats }) {
  const [activeMetricId, setActiveMetricId] = useState(stats[0]?.metric.id || "");
  const width = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { theme, systemTheme } = useTheme();
  
  const activeStat = stats.find(s => s.metric.id === activeMetricId);
  
  if (!activeStat) return null;

  const data = activeStat.history;
  const metric = activeStat.metric;

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <div className="bg-card rounded-xl border p-6 flex flex-col w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-semibold">Historical Trend</h3>
          <p className="text-sm text-muted-foreground">Select an indicator to view its performance over time.</p>
        </div>
        
        <Select value={activeMetricId} onValueChange={setActiveMetricId}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select indicator" />
          </SelectTrigger>
          <SelectContent>
            {stats.map(s => (
              <SelectItem key={s.metric.id} value={s.metric.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-80 w-full mt-4">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#e5e5e5"} />
              <XAxis 
                dataKey="year" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#888" : "#666", fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#888" : "#666", fontSize: 12 }}
                tickFormatter={(value) => formatMetricValue(value, { ...metric, format_type: 'number' })} // Keep labels concise
                width={80}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? "#1e293b" : "#fff",
                  borderColor: isDark ? "#334155" : "#e2e8f0",
                  borderRadius: '8px',
                  color: isDark ? "#f8fafc" : "#0f172a",
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value) => [formatMetricValue(value, metric), metric.name]}
                labelStyle={{ fontWeight: 'bold', color: isDark ? "#f8fafc" : "#0f172a", marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                name={metric.name}
                stroke={isDark ? "#3b82f6" : "#2563eb"} 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: isDark ? "#1e293b" : "#fff", stroke: isDark ? "#3b82f6" : "#2563eb" }}
                activeDot={{ r: 6, strokeWidth: 0, fill: isDark ? "#60a5fa" : "#1d4ed8" }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No historical data available for {metric.name}.</p>
          </div>
        )}
      </div>
    </div>
  );
}

