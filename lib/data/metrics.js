import { getDb, globiqDb } from "../db/index.js";
import { getCountriesWithLatestMetrics, getCountriesWithMetricsForYear } from "./countries.js";
import { formatMetricValue } from "../utils/format.js";

export async function getMetrics() {
  return globiqDb.getMetrics();
}

export async function getMetricById(id) {
  return globiqDb.getMetric(id) || null;
}

export async function searchMetrics(query) {
  if (!query) return [];
  const q = `%${query.toLowerCase()}%`;
  const db = getDb();
  return db.prepare("SELECT * FROM metrics WHERE name LIKE ? OR description LIKE ?").all(q, q);
}

export async function getRankingsByMetric(metricId, region = null, incomeGroup = null, year = 2023, limit = null) {
  const metric = await getMetricById(metricId);
  if (!metric) return [];
  
  const countries = await getCountriesWithMetricsForYear(year);
  const sortKey = metricId === 'gdp-growth' ? 'gdpGrowth' : metricId;

  let filtered = countries;
  if (region && region !== "all") {
    filtered = filtered.filter(c => {
      if (!c.region) return false;
      if (region === "Americas") return c.region.includes("America");
      return c.region.includes(region);
    });
  }
  if (incomeGroup && incomeGroup !== "all") {
    filtered = filtered.filter(c => c.income_group === incomeGroup);
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
  const result = globiqDb.getHistoricalTrendDynamic(metricId, limit, 'country');
  return {
    data: result.data,
    countries: result.entities
  };
}

export async function getHistoricalComparison(metricId, countryIds) {
  if (!countryIds || !countryIds.length) return { data: [], countries: [] };
  const result = globiqDb.getHistoricalComparisonDynamic(metricId, countryIds, 'country');
  return {
    data: result.data,
    countries: result.entities
  };
}
