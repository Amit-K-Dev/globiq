"use client";

import React, { useState } from "react";
import MetricChart from "./metric-chart";
import MetricMap from "./metric-map";
import { BarChart3, Globe2 } from "lucide-react";

export default function MetricViewTabs({ trendData, mapData, metric }) {
  const [activeTab, setActiveTab] = useState("chart");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b pb-4">
        <button
          onClick={() => setActiveTab("chart")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "chart"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-muted text-muted-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Historical Trend
        </button>
        <button
          onClick={() => setActiveTab("map")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "map"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-muted text-muted-foreground"
          }`}
        >
          <Globe2 className="w-4 h-4" />
          Global Map
        </button>
      </div>

      <div className="min-h-100">
        {activeTab === "chart" ? (
          trendData.data.length > 0 ? (
            <MetricChart
              data={trendData.data}
              countries={trendData.countries}
              metric={metric}
            />
          ) : (
            <div className="p-12 text-center bg-muted/20 rounded-xl border border-dashed h-100 flex items-center justify-center">
              <p className="text-muted-foreground">Historical data not available for this metric.</p>
            </div>
          )
        ) : (
          <MetricMap data={mapData} metric={metric} />
        )}
      </div>
    </div>
  );
}
