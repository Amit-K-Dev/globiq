import Database from "better-sqlite3";
import path from "path";

let dbInstance = null;

export function getDb() {
  if (!dbInstance) {
    const dbPath = path.join(process.cwd(), "globiq.db");
    const isProd = process.env.NODE_ENV === "production";
    
    // Open as readonly in production to prevent write attempts on Vercel's read-only FS
    dbInstance = new Database(dbPath, { readonly: isProd });
    
    // Only use WAL mode locally since it creates -wal and -shm files
    if (!isProd) {
      dbInstance.pragma("journal_mode = WAL");
    }
  }
  return dbInstance;
}

export class GlobiqDB {
  constructor(db) {
    this.db = db;
  }

  // --- Common Metrics (Phase 6 + Provenance) ---

  getCountries(region = null, incomeGroup = null) {
    let query = "SELECT * FROM countries WHERE 1=1";
    const params = [];
    if (region) {
      query += " AND region = ?";
      params.push(region);
    }
    if (incomeGroup) {
      query += " AND income_group = ?";
      params.push(incomeGroup);
    }
    query += " ORDER BY name ASC";
    return this.db.prepare(query).all(...params);
  }

  getCountry(id) {
    return this.db.prepare("SELECT * FROM countries WHERE id = ?").get(id);
  }

  getCategories() {
    return this.db.prepare("SELECT * FROM categories ORDER BY name ASC").all();
  }

  getCategory(id) {
    return this.db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
  }

  getMetrics(categoryId = null) {
    if (categoryId) {
      return this.db.prepare("SELECT * FROM metrics WHERE category_id = ?").all(categoryId);
    }
    return this.db.prepare("SELECT * FROM metrics").all();
  }

  getMetric(id) {
    return this.db.prepare("SELECT * FROM metrics WHERE id = ?").get(id);
  }

  getHistoricalData(countryId, metricId) {
    return this.db.prepare(`
      SELECT year, value, source_id, source_indicator_code, last_updated 
      FROM historical_values 
      WHERE country_id = ? AND metric_id = ? 
      ORDER BY year DESC
    `).all(countryId, metricId);
  }

  // --- Specialized Domains (Phase 7) ---

  getInstitutions(countryId = null) {
    if (countryId) {
      return this.db.prepare("SELECT * FROM institutions WHERE country_id = ?").all(countryId);
    }
    return this.db.prepare("SELECT * FROM institutions").all();
  }

  getInstitutionMetrics(institutionId, metricId) {
    return this.db.prepare(`
      SELECT year, value, rank, source_id, source_indicator_code, last_updated 
      FROM institution_metrics 
      WHERE institution_id = ? AND metric_id = ? 
      ORDER BY year DESC
    `).all(institutionId, metricId);
  }

  getEntertainmentEntities(type = null) {
    if (type) {
      return this.db.prepare("SELECT * FROM entertainment_entities WHERE type = ?").all(type);
    }
    return this.db.prepare("SELECT * FROM entertainment_entities").all();
  }

  getEntertainmentMetrics(entityId, metricId) {
    return this.db.prepare(`
      SELECT market_country_id, period, value, source_id, source_indicator_code, last_updated 
      FROM entertainment_metrics 
      WHERE entity_id = ? AND metric_id = ?
    `).all(entityId, metricId);
  }

  getCommodities(category = null) {
    if (category) {
      return this.db.prepare("SELECT * FROM commodities WHERE category = ?").all(category);
    }
    return this.db.prepare("SELECT * FROM commodities").all();
  }

  getCommodityData(countryId, commodityId) {
    return this.db.prepare(`
      SELECT year, production_volume, export_value_usd, import_value_usd, reserves_volume, source_id, last_updated 
      FROM commodity_trade_production 
      WHERE country_id = ? AND commodity_id = ? 
      ORDER BY year DESC
    `).all(countryId, commodityId);
  }
}

// Export a singleton instance of the abstraction wrapper
export const globiqDb = new GlobiqDB(getDb());
