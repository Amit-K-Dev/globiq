import { getDb } from "../db/index.js";
import { getCountriesWithLatestMetrics } from "./countries.js";

export async function getMetrics() {
  const db = getDb();
  return db.prepare("SELECT * FROM metrics").all();
}

export async function getMetricById(id) {
  const db = getDb();
  return db.prepare("SELECT * FROM metrics WHERE id = ?").get(id) || null;
}

export async function searchMetrics(query) {
  if (!query) return [];
  const q = `%${query.toLowerCase()}%`;
  const db = getDb();
  return db.prepare("SELECT * FROM metrics WHERE name LIKE ? OR description LIKE ?").all(q, q);
}

export async function getRankingsByMetric(metricId) {
  const metric = await getMetricById(metricId);
  if (!metric) return [];
  
  const countries = await getCountriesWithLatestMetrics();
  const sortKey = metricId === 'gdp-growth' ? 'gdpGrowth' : metricId;

  const sorted = countries.sort((a, b) => {
    return (b[sortKey] || 0) - (a[sortKey] || 0);
  });
  
  return sorted.map(country => ({
    country,
    formattedValue: formatMetricValue(country[sortKey], metric)
  }));
}

export function formatMetricValue(value, metric) {
  if (value === undefined || value === null) return "N/A";
  if (!metric) return value.toString();

  if (metric.format_type === "currency") {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    return `$${value.toLocaleString()}`;
  }
  if (metric.format_type === "percentage") {
    return `${value > 0 ? '+' : ''}${value}%`;
  }
  if (metric.format_type === "number") {
    let numStr = "";
    if (value >= 1e9) numStr = `${(value / 1e9).toFixed(2)}B`;
    else if (value >= 1e6) numStr = `${(value / 1e6).toFixed(2)}M`;
    else numStr = value.toLocaleString();
    return metric.unit ? `${numStr} ${metric.unit}` : numStr;
  }
  return value.toString();
}
