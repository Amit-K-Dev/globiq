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
    const registry = this.db.prepare("SELECT * FROM metric_registry WHERE canonical_id = ?").get(metricId);
    if (!registry) return [];
    
    // Strict table validation
    const allowedTables = ['historical_values', 'institution_metrics', 'commodity_trade_production', 'events'];
    if (!allowedTables.includes(registry.resolution_table)) {
      throw new Error(`Invalid resolution table: ${registry.resolution_table}`);
    }

    // Dynamic resolution based on entity type and table
    if (registry.entity_type === 'country' && registry.resolution_table === 'historical_values') {
      return this.db.prepare(`
        SELECT year, ${registry.resolution_column} as value, source_id, source_indicator_code, last_updated 
        FROM historical_values 
        WHERE country_id = ? AND metric_id = ? 
        ORDER BY year DESC
      `).all(countryId, metricId);
    }
    
    return [];
  }

  // --- Dynamic Historical Trend/Comparison Methods ---
  getHistoricalComparisonDynamic(metricId, entityIds, entityType = 'country') {
    if (!entityIds || !entityIds.length) return { data: [], entities: [] };
    
    const registry = this.db.prepare("SELECT * FROM metric_registry WHERE canonical_id = ?").get(metricId);
    if (!registry) return { data: [], entities: [] };

    const allowedTables = ['historical_values', 'institution_metrics', 'commodity_trade_production', 'entertainment_metrics'];
    if (!allowedTables.includes(registry.resolution_table)) return { data: [], entities: [] };

    const placeholders = entityIds.map(() => '?').join(',');
    let rows = [];

    if (registry.entity_type === 'country' && entityType === 'country' && registry.resolution_table === 'historical_values') {
      rows = this.db.prepare(`
        SELECT c.name, v.year, v.${registry.resolution_column} as value
        FROM historical_values v
        JOIN countries c ON v.country_id = c.id
        WHERE v.metric_id = ? AND v.country_id IN (${placeholders})
        ORDER BY v.year ASC
      `).all(metricId, ...entityIds);
    } else if (registry.entity_type === 'institution' && entityType === 'institution' && registry.resolution_table === 'institution_metrics') {
      rows = this.db.prepare(`
        SELECT i.name, v.year, v.${registry.resolution_column} as value
        FROM institution_metrics v
        JOIN institutions i ON v.institution_id = i.id
        WHERE v.metric_id = ? AND v.institution_id IN (${placeholders})
        ORDER BY v.year ASC
      `).all(metricId, ...entityIds);
    } else if (registry.entity_type === 'entertainment' && entityType === 'entertainment' && registry.resolution_table === 'entertainment_metrics') {
      // For entertainment_metrics, the column is 'period' instead of 'year', but we alias to 'year' for consistency
      rows = this.db.prepare(`
        SELECT e.title as name, v.period as year, v.${registry.resolution_column} as value
        FROM entertainment_metrics v
        JOIN entertainment_entities e ON v.entity_id = e.id
        WHERE v.metric_id = ? AND v.entity_id IN (${placeholders})
        ORDER BY v.period ASC
      `).all(metricId, ...entityIds);
    }

    const dataByYear = {};
    const entityNames = new Set();
    
    for (const row of rows) {
      if (!dataByYear[row.year]) {
        dataByYear[row.year] = { year: row.year.toString() };
      }
      dataByYear[row.year][row.name] = row.value;
      entityNames.add(row.name);
    }

    return {
      data: Object.values(dataByYear),
      entities: Array.from(entityNames)
    };
  }

  getHistoricalTrendDynamic(metricId, limit = 5, entityType = 'country') {
    const registry = this.db.prepare("SELECT * FROM metric_registry WHERE canonical_id = ?").get(metricId);
    if (!registry) return { data: [], entities: [] };

    const allowedTables = ['historical_values', 'institution_metrics', 'commodity_trade_production', 'entertainment_metrics'];
    if (!allowedTables.includes(registry.resolution_table)) return { data: [], entities: [] };

    let topEntityRows = [];
    if (registry.entity_type === 'country' && entityType === 'country') {
      topEntityRows = this.db.prepare(`
        SELECT c.id, c.name, v.${registry.resolution_column} as value
        FROM historical_values v
        JOIN countries c ON v.country_id = c.id
        WHERE v.metric_id = ? AND v.year = 2023
        ORDER BY v.${registry.resolution_column} DESC
        LIMIT ?
      `).all(metricId, limit);
    } else if (registry.entity_type === 'institution' && entityType === 'institution') {
      topEntityRows = this.db.prepare(`
        SELECT i.id, i.name, v.${registry.resolution_column} as value
        FROM institution_metrics v
        JOIN institutions i ON v.institution_id = i.id
        WHERE v.metric_id = ? AND v.year = 2023
        ORDER BY v.${registry.resolution_column} DESC
        LIMIT ?
      `).all(metricId, limit);
    } else if (registry.entity_type === 'entertainment' && entityType === 'entertainment') {
      topEntityRows = this.db.prepare(`
        SELECT e.id, e.title as name, v.${registry.resolution_column} as value
        FROM entertainment_metrics v
        JOIN entertainment_entities e ON v.entity_id = e.id
        WHERE v.metric_id = ? AND v.period = '2023'
        ORDER BY v.${registry.resolution_column} DESC
        LIMIT ?
      `).all(metricId, limit);
    }

    if (!topEntityRows.length) return { data: [], entities: [] };

    const topEntityIds = topEntityRows.map(r => r.id);
    return this.getHistoricalComparisonDynamic(metricId, topEntityIds, entityType);
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
