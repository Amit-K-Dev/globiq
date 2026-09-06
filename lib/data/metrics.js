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

export async function getHistoricalTrendByMetric(metricId, limit = 5) {
  const db = getDb();
  
  // 1. Get top N countries for this metric in 2023
  const topCountriesRows = db.prepare(`
    SELECT c.id, c.name, v.value
    FROM historical_values v
    JOIN countries c ON v.country_id = c.id
    WHERE v.metric_id = ? AND v.year = 2023
    ORDER BY v.value DESC
    LIMIT ?
  `).all(metricId, limit);

  if (!topCountriesRows.length) return { data: [], countries: [] };

  const topCountryIds = topCountriesRows.map(r => r.id);
  const placeholders = topCountryIds.map(() => '?').join(',');

  // 2. Fetch all historical data for these countries and this metric
  const historicalRows = db.prepare(`
    SELECT c.name, v.year, v.value
    FROM historical_values v
    JOIN countries c ON v.country_id = c.id
    WHERE v.metric_id = ? AND v.country_id IN (${placeholders})
    ORDER BY v.year ASC
  `).all(metricId, ...topCountryIds);

  // 3. Pivot data for Recharts: [{ year: 2021, "United States": 100, "China": 80 }, { year: 2022, ... }]
  const dataByYear = {};
  for (const row of historicalRows) {
    if (!dataByYear[row.year]) {
      dataByYear[row.year] = { year: row.year.toString() };
    }
    dataByYear[row.year][row.name] = row.value;
  }

  return {
    data: Object.values(dataByYear),
    countries: topCountriesRows.map(r => r.name)
  };
}
