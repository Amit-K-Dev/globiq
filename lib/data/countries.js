import { getDb } from "../db/index.js";
import { formatMetricValue } from "./metrics.js";

export function formatLargeNumber(num, isCurrency = false) {
  if (num === undefined || num === null) return "N/A";
  let formatted = "";
  if (num >= 1e12) {
    formatted = (num / 1e12).toFixed(2) + "T";
  } else if (num >= 1e9) {
    formatted = (num / 1e9).toFixed(2) + "B";
  } else if (num >= 1e6) {
    formatted = (num / 1e6).toFixed(2) + "M";
  } else {
    formatted = num.toLocaleString();
  }
  return isCurrency ? "$" + formatted : formatted;
}

export async function getCountries() {
  const db = getDb();
  return db.prepare("SELECT * FROM countries ORDER BY name ASC").all();
}

export async function getCountryById(id) {
  const db = getDb();
  return db.prepare("SELECT * FROM countries WHERE id = ?").get(id) || null;
}

export async function getCountriesByIds(ids) {
  if (!ids || !ids.length) return [];
  const db = getDb();
  const placeholders = ids.map(() => '?').join(',');
  return db.prepare(`SELECT * FROM countries WHERE id IN (${placeholders})`).all(...ids);
}

export async function searchCountries(query) {
  if (!query) return [];
  const q = `%${query.toLowerCase()}%`;
  const db = getDb();
  return db.prepare("SELECT * FROM countries WHERE name LIKE ? OR region LIKE ?").all(q, q);
}

export async function getCountriesWithLatestMetrics() {
  const countries = await getCountries();
  const db = getDb();
  const latestValues = db.prepare(`
    SELECT v.country_id, m.id as metric_id, v.value 
    FROM historical_values v
    JOIN metrics m ON v.metric_id = m.id
    WHERE v.year = 2023
  `).all();

  const metricsByCountry = {};
  for (const v of latestValues) {
    if (!metricsByCountry[v.country_id]) metricsByCountry[v.country_id] = {};
    metricsByCountry[v.country_id][v.metric_id] = v.value;
    // Map gdp-growth for UI backward compatibility
    if (v.metric_id === 'gdp-growth') {
      metricsByCountry[v.country_id].gdpGrowth = v.value;
    }
  }

  return countries.map(c => ({ ...c, ...(metricsByCountry[c.id] || {}) }));
}

export async function getCountryWithLatestMetrics(id) {
  const country = await getCountryById(id);
  if (!country) return null;
  const db = getDb();
  const latestValues = db.prepare(`
    SELECT m.id as metric_id, v.value 
    FROM historical_values v
    JOIN metrics m ON v.metric_id = m.id
    WHERE v.country_id = ? AND v.year = 2023
  `).all(id);

  latestValues.forEach(v => {
    country[v.metric_id] = v.value;
    if (v.metric_id === 'gdp-growth') {
      country.gdpGrowth = v.value;
    }
  });
  return country;
}
