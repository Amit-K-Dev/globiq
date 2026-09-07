import { getDb } from "../db/index.js";
import { getCountriesWithLatestMetrics } from "./countries.js";
import { formatMetricValue } from "../utils/format.js";

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

export async function getRankingsByMetric(metricId, region = null, limit = null) {
  const metric = await getMetricById(metricId);
  if (!metric) return [];
  
  const countries = await getCountriesWithLatestMetrics();
  const sortKey = metricId === 'gdp-growth' ? 'gdpGrowth' : metricId;

  let filtered = countries;
  if (region && region !== "all") {
    filtered = filtered.filter(c => c.region === region);
  }

  const sorted = filtered.sort((a, b) => {
    return (b[sortKey] || 0) - (a[sortKey] || 0);
  });
  
  const result = limit ? sorted.slice(0, limit) : sorted;

  return result.map(country => ({
    country,
    formattedValue: formatMetricValue(country[sortKey], metric)
  }));
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
