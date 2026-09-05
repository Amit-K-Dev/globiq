import { countries } from "./countries";

export const indicators = [
  {
    id: "population",
    name: "Total Population",
    category: "Demographics",
    description: "The total number of people living in a country.",
    format: "number",
  },
  {
    id: "gdp",
    name: "Gross Domestic Product (GDP)",
    category: "Economy",
    description: "The total monetary or market value of all the finished goods and services produced within a country's borders.",
    format: "currency",
  },
  {
    id: "gdpGrowth",
    name: "GDP Growth Rate",
    category: "Economy",
    description: "Annual percentage growth rate of GDP at market prices based on constant local currency.",
    format: "percentage",
  },
  {
    id: "inflation",
    name: "Inflation Rate",
    category: "Economy",
    description: "Inflation as measured by the consumer price index reflects the annual percentage change in the cost to the average consumer.",
    format: "percentage",
  },
  {
    id: "co2",
    name: "CO2 Emissions",
    category: "Environment",
    description: "Carbon dioxide emissions are those stemming from the burning of fossil fuels and the manufacture of cement.",
    format: "number",
    unit: "Mt",
  },
];

export function getIndicatorById(id) {
  return indicators.find((i) => i.id === id);
}

export function getRankingsByIndicator(indicatorId) {
  const indicator = getIndicatorById(indicatorId);
  if (!indicator) return [];
  
  const sorted = [...countries].sort((a, b) => {
    // Sort descending by default
    return (b[indicatorId] || 0) - (a[indicatorId] || 0);
  });
  
  return sorted.map(country => ({
    country,
    formattedValue: formatIndicatorValue(country[indicatorId], indicatorId)
  }));
}

export function searchIndicators(query) {
  if (!query) return [];
  const q = query.toLowerCase();
  return indicators.filter(
    (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
  );
}

export function formatIndicatorValue(value, indicatorId) {
  if (value === undefined || value === null) return "N/A";
  const indicator = getIndicatorById(indicatorId);
  if (!indicator) return value.toString();

  if (indicator.format === "currency") {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    return `$${value.toLocaleString()}`;
  }
  if (indicator.format === "percentage") {
    return `${value > 0 ? '+' : ''}${value}%`;
  }
  if (indicator.format === "number") {
    let numStr = "";
    if (value >= 1e9) numStr = `${(value / 1e9).toFixed(2)}B`;
    else if (value >= 1e6) numStr = `${(value / 1e6).toFixed(2)}M`;
    else numStr = value.toLocaleString();
    return indicator.unit ? `${numStr} ${indicator.unit}` : numStr;
  }
  
  return value.toString();
}
