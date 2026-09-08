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

export async function getRankingsByMetric(metricId, region = null, incomeGroup = null, year = null, limit = null) {
  const metric = await getMetricById(metricId);
  if (!metric) return [];
  
  const rawEntities = globiqDb.getRankingsDynamic(metricId, year, limit);

  let filtered = rawEntities;
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

  return filtered.map(entity => {
    const sortKey = metricId === 'gdp-growth' ? 'gdpGrowth' : metricId;
    const entityObj = { ...entity };
    entityObj[sortKey] = entity.value;
    // Map title -> name for entertainment entities so UI doesn't break
    if (entityObj.title && !entityObj.name) {
      entityObj.name = entityObj.title;
    }
    
    return {
      country: entityObj,
      formattedValue: formatMetricValue(entity.value, metric)
    };
  });
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
