import { getDb } from "../db/index.js";

export async function getHistoricalValues(countryId, metricId) {
  const db = getDb();
  return db.prepare(`
    SELECT year, value 
    FROM historical_values 
    WHERE country_id = ? AND metric_id = ? 
    ORDER BY year ASC
  `).all(countryId, metricId);
}

export async function getHistoricalDataForCountry(countryId) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT metric_id, year, value
    FROM historical_values
    WHERE country_id = ?
    ORDER BY year ASC
  `).all(countryId);

  const data = {};
  for (const row of rows) {
    if (!data[row.metric_id]) data[row.metric_id] = [];
    data[row.metric_id].push({ year: row.year, value: row.value });
  }
  return data;
}
