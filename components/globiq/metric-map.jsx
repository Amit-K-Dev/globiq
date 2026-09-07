"use client";

import React, { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";

const geoUrl = "/features.json";

// Handle name mismatches between our DB and TopoJSON
const nameMappings = {
  USA: "United States of America",
  "United States": "United States of America",
  UK: "United Kingdom",
  "South Korea": "South Korea", // topojson has "South Korea"
  Russia: "Russia",
  // Add more as needed
};

export default function MetricMap({ data, metric }) {
  const [tooltipContent, setTooltipContent] = useState("");

  const { colorScale, maxValue, minValue } = useMemo(() => {
    if (!data || data.length === 0)
      return { colorScale: () => "#e5e7eb", maxValue: 0, minValue: 0 };

    const values = data
      .map((d) => d.value)
      .filter((v) => v !== null && v !== undefined);
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Using our theme primary color roughly (hsl(221.2 83.2% 53.3%))
    // We'll use a scale from light blue to dark blue, or red for negative if needed.
    // For simplicity, a light primary to dark primary scale.
    const colorScale = scaleLinear()
      .domain([min, max])
      .range(["#eff6ff", "#1d4ed8"]); // Tailwind blue-50 to blue-700

    return { colorScale, maxValue: max, minValue: min };
  }, [data]);

  // Create a lookup dictionary for fast access
  const dataLookup = useMemo(() => {
    const lookup = {};
    if (data) {
      data.forEach((d) => {
        lookup[d.country_name] = d;
        // Also map standard name if it exists in our mapping
        if (nameMappings[d.country_name]) {
          lookup[nameMappings[d.country_name]] = d;
        }
      });
    }
    return lookup;
  }, [data]);

  const formatTooltip = (countryName, value) => {
    if (value === undefined || value === null) return `${countryName}: No data`;

    // Quick format based on magnitude
    let formatted = value;
    if (value >= 1e12) formatted = (value / 1e12).toFixed(2) + "T";
    else if (value >= 1e9) formatted = (value / 1e9).toFixed(2) + "B";
    else if (value >= 1e6) formatted = (value / 1e6).toFixed(2) + "M";
    else formatted = value.toLocaleString();

    return `${countryName}: ${formatted}`;
  };

  return (
    <div className="w-full relative h-96 md:h-125 bg-muted/20 rounded-lg overflow-hidden border">
      {tooltipContent && (
        <div className="absolute top-4 left-4 z-10 bg-popover text-popover-foreground px-3 py-1.5 rounded-md shadow-md border text-sm font-medium">
          {tooltipContent}
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
        }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup center={[0, 20]} zoom={1} minZoom={1} maxZoom={4}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoName = geo.properties.name;
                const countryData = dataLookup[geoName];
                const value = countryData ? countryData.value : null;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      setTooltipContent(formatTooltip(geoName, value));
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    fill={value !== null ? colorScale(value) : "#e5e7eb"}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        fill: value !== null ? "#3b82f6" : "#d1d5db",
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
