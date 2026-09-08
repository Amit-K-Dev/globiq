const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const dbPath = path.join(__dirname, '..', 'globiq.db');
const schemaPath = path.join(__dirname, '..', 'lib', 'db', 'schema.sql');


const db = new Database(dbPath);
const runMigrations = require('./migrate');

console.log('Running database migrations...');
runMigrations(db);

console.log('Inserting base entities...');

const incomeGroups = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'raw', 'income-groups.json'), 'utf8'));
  } catch (e) {
    console.warn('Could not load income-groups.json. Income groups will be Unknown.');
    return {};
  }
})();

const insertCountry = db.prepare(`INSERT OR REPLACE INTO countries (id, name, iso_code, flag, region, income_group) VALUES (?, ?, ?, ?, ?, ?)`);
const countries = [
  ['usa', 'United States', 'USA', '🇺🇸', 'North America'],
  ['chn', 'China', 'CHN', '🇨🇳', 'East Asia'],
  ['ind', 'India', 'IND', '🇮🇳', 'South Asia'],
  ['deu', 'Germany', 'DEU', '🇩🇪', 'Europe'],
  ['jpn', 'Japan', 'JPN', '🇯🇵', 'East Asia'],
  ['bra', 'Brazil', 'BRA', '🇧🇷', 'South America'],
  ['gbr', 'United Kingdom', 'GBR', '🇬🇧', 'Europe'],
  ['fra', 'France', 'FRA', '🇫🇷', 'Europe'],
];
countries.forEach(c => {
  const iso = c[2];
  const incomeGroup = incomeGroups[iso] || 'Unknown';
  insertCountry.run(...c, incomeGroup);
});

const insertCategory = db.prepare(`INSERT OR REPLACE INTO categories (id, name, icon) VALUES (?, ?, ?)`);
insertCategory.run('economy', 'Economy', '💰');
insertCategory.run('population', 'Population', '👥');
insertCategory.run('environment', 'Environment', '🌱');

const insertMetric = db.prepare(`INSERT OR REPLACE INTO metrics (id, name, category_id, unit, format_type, description) VALUES (?, ?, ?, ?, ?, ?)`);
insertMetric.run('gdp', 'GDP', 'economy', 'USD', 'currency', 'Gross Domestic Product');
insertMetric.run('population', 'Population', 'population', 'people', 'number', 'Total population');
insertMetric.run('gdp-growth', 'GDP Growth', 'economy', '%', 'percentage', 'Annual GDP growth rate');
insertMetric.run('inflation', 'Inflation', 'economy', '%', 'percentage', 'Annual inflation rate');
insertMetric.run('co2', 'CO₂ Emissions', 'environment', 'Mt', 'number', 'Carbon dioxide emissions');
insertMetric.run('gdp-per-capita', 'GDP per capita', 'economy', 'USD', 'currency', 'GDP per capita (current US$)');
insertMetric.run('population-growth', 'Population Growth', 'population', '%', 'percentage', 'Annual population growth rate');
insertMetric.run('exports', 'Exports', 'economy', 'USD', 'currency', 'Exports of goods and services');
insertMetric.run('imports', 'Imports', 'economy', 'USD', 'currency', 'Imports of goods and services');
insertMetric.run('energy-consumption', 'Energy Consumption', 'environment', 'kg OE', 'number', 'Energy use (kg of oil equivalent per capita)');

const insertCanonicalRegistry = db.prepare(`INSERT OR REPLACE INTO metric_registry (canonical_id, entity_type, semantic_definition, unit, source_id, source_indicator_code, methodology, temporal_coverage, resolution_table, resolution_column) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
insertCanonicalRegistry.run('gdp', 'country', 'Gross Domestic Product', 'USD', 'wb', 'NY.GDP.MKTP.CD', 'World Bank national accounts data', '1960-2023', 'historical_values', 'value');
insertCanonicalRegistry.run('population', 'country', 'Total population', 'people', 'wb', 'SP.POP.TOTL', 'Derived from census and demographic data', '1960-2023', 'historical_values', 'value');
insertCanonicalRegistry.run('gdp-growth', 'country', 'Annual GDP growth rate', '%', 'wb', 'NY.GDP.MKTP.KD.ZG', 'Annual percentage growth rate of GDP at market prices', '1961-2023', 'historical_values', 'value');
insertCanonicalRegistry.run('inflation', 'country', 'Annual inflation rate', '%', 'wb', 'FP.CPI.TOTL.ZG', 'Inflation as measured by the consumer price index', '1960-2023', 'historical_values', 'value');
insertCanonicalRegistry.run('co2', 'country', 'Carbon dioxide emissions', 'Mt', 'wb', 'EN.ATM.CO2E.KT', 'Emissions from the burning of fossil fuels', '1990-2020', 'historical_values', 'value');
insertCanonicalRegistry.run('gdp-per-capita', 'country', 'GDP per capita (current US$)', 'USD', 'wb', 'NY.GDP.PCAP.CD', 'GDP divided by midyear population', '1960-2023', 'historical_values', 'value');
insertCanonicalRegistry.run('population-growth', 'country', 'Annual population growth rate', '%', 'wb', 'SP.POP.GROW', 'Exponential rate of growth of midyear population', '1960-2023', 'historical_values', 'value');
insertCanonicalRegistry.run('exports', 'country', 'Exports of goods and services', 'USD', 'wb', 'NE.EXP.GNFS.CD', 'Value of all goods and other market services provided to the rest of the world', '1960-2023', 'historical_values', 'value');
insertCanonicalRegistry.run('imports', 'country', 'Imports of goods and services', 'USD', 'wb', 'NE.IMP.GNFS.CD', 'Value of all goods and other market services received from the rest of the world', '1960-2023', 'historical_values', 'value');
insertCanonicalRegistry.run('energy-consumption', 'country', 'Energy use (kg of oil equivalent per capita)', 'kg OE', 'wb', 'EG.USE.PCAP.KG.OE', 'Use of primary energy before transformation', '1960-2015', 'historical_values', 'value');

const insertSource = db.prepare(`INSERT OR REPLACE INTO sources (id, name, url, license) VALUES (?, ?, ?, ?)`);
insertSource.run('wb', 'World Bank', 'https://data.worldbank.org', 'CC BY 4.0');

const insertHistoricalValue = db.prepare(`INSERT OR REPLACE INTO historical_values (country_id, metric_id, year, value, source_id, source_indicator_code, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?)`);

async function processCSV(filePath, metricId, sourceId = 'wb', sourceIndicatorCode = null) {
  return new Promise((resolve, reject) => {
    const currentYear = new Date().getFullYear();

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headers) => {
        // 1. Schema Validation
        if (!headers.includes('Country Code')) {
          reject(new Error(`Schema Validation Failed: Missing 'Country Code' in ${filePath}`));
        }
      })
      .on('data', (row) => {
        const isoCode = row['Country Code'];
        if (!isoCode) return; // 5. Missing-Value Handling

        // 7. Country Mapping
        const country = db.prepare('SELECT id FROM countries WHERE iso_code = ?').get(isoCode);
        if (!country) return; // Reject unknown entities

        const years = Object.keys(row).filter(k => !isNaN(parseInt(k)) && k.length === 4);
        years.sort((a, b) => parseInt(a) - parseInt(b));
        
        let previousValue = null;

        years.forEach(yearStr => {
          const year = parseInt(yearStr);
          // 8. Temporal Validation
          if (year > currentYear + 1) return;

          const rawVal = row[yearStr];
          // 5. Missing-Value Handling
          if (rawVal === '' || rawVal === null || rawVal === undefined) return;

          // 2. Type Validation
          const val = parseFloat(rawVal);
          if (isNaN(val)) return;

          // 9. Outlier/Anomaly Checks
          if (previousValue !== null && previousValue !== 0) {
            const jump = Math.abs((val - previousValue) / previousValue);
            if (jump > 0.5) {
              // Warning only - outlier detection
              if (metricId === 'gdp' || metricId === 'population') {
                console.warn(`[Anomaly] ${isoCode} ${metricId} jumped by ${(jump*100).toFixed(1)}% in ${year}`);
              }
            }
          }
          previousValue = val;

          // 4. Duplicate Detection (via INSERT OR REPLACE)
          // 6. Source Consistency
          insertHistoricalValue.run(country.id, metricId, year, val, sourceId, sourceIndicatorCode, new Date().toISOString());
        });
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });
}

async function seed() {
  console.log('Loading World Bank GDP data...');
  await processCSV(path.join(__dirname, '..', 'data', 'raw', 'gdp.csv'), 'gdp');

  console.log('Loading World Bank Population data...');
  await processCSV(path.join(__dirname, '..', 'data', 'raw', 'population.csv'), 'population');

  console.log('Loading World Bank GDP per capita data...');
  await processCSV(path.join(__dirname, '..', 'data', 'raw', 'gdp-per-capita.csv'), 'gdp-per-capita');

  console.log('Loading World Bank Population growth data...');
  await processCSV(path.join(__dirname, '..', 'data', 'raw', 'population-growth.csv'), 'population-growth');

  console.log('Loading World Bank Exports data...');
  await processCSV(path.join(__dirname, '..', 'data', 'raw', 'exports.csv'), 'exports');

  console.log('Loading World Bank Imports data...');
  await processCSV(path.join(__dirname, '..', 'data', 'raw', 'imports.csv'), 'imports');

  console.log('Loading World Bank Energy consumption data...');
  await processCSV(path.join(__dirname, '..', 'data', 'raw', 'energy-consumption.csv'), 'energy-consumption');
  
  console.log('Loading World Bank GDP growth data...');
  await processCSV(path.join(__dirname, '..', 'data', 'raw', 'gdp-growth.csv'), 'gdp-growth');

  console.log('Loading World Bank Inflation data...');
  await processCSV(path.join(__dirname, '..', 'data', 'raw', 'inflation.csv'), 'inflation');

  console.log('Loading World Bank CO2 Emissions data...');
  await processCSV(path.join(__dirname, '..', 'data', 'raw', 'co2.csv'), 'co2');

  console.log('Seeding Specialized Domains (Phase 7)...');
  
  // 1. QS Universities
  console.log('Seeding QS Universities data...');
  // Add to metrics table to satisfy legacy FK constraints
  db.prepare(`INSERT OR REPLACE INTO metrics (id, name, category_id, unit, format_type, description) VALUES ('qs-rank', 'QS World University Rankings', 'economy', 'rank', 'number', 'QS World University Rankings')`).run();
  
  db.prepare(`INSERT OR REPLACE INTO metric_registry (canonical_id, entity_type, semantic_definition, unit, source_id, resolution_table, resolution_column) VALUES ('qs-rank', 'institution', 'QS World University Rankings', 'rank', 'wb', 'institution_metrics', 'rank')`).run();
  
  const insertInstitution = db.prepare(`INSERT OR REPLACE INTO institutions (id, name, country_id) VALUES (?, ?, ?)`);
  insertInstitution.run('inst-mit', 'Massachusetts Institute of Technology (MIT)', 'usa');
  insertInstitution.run('inst-stanford', 'Stanford University', 'usa');
  insertInstitution.run('inst-oxford', 'University of Oxford', 'gbr');
  insertInstitution.run('inst-cambridge', 'University of Cambridge', 'gbr');

  const insertInstMetric = db.prepare(`INSERT OR REPLACE INTO institution_metrics (institution_id, metric_id, year, value, rank, source_id) VALUES (?, ?, ?, ?, ?, ?)`);
  insertInstMetric.run('inst-mit', 'qs-rank', 2023, null, 1, 'wb');
  insertInstMetric.run('inst-stanford', 'qs-rank', 2023, null, 3, 'wb');
  insertInstMetric.run('inst-oxford', 'qs-rank', 2023, null, 4, 'wb');
  insertInstMetric.run('inst-cambridge', 'qs-rank', 2023, null, 2, 'wb');
  
  insertInstMetric.run('inst-mit', 'qs-rank', 2022, null, 1, 'wb');
  insertInstMetric.run('inst-stanford', 'qs-rank', 2022, null, 3, 'wb');
  insertInstMetric.run('inst-oxford', 'qs-rank', 2022, null, 2, 'wb');
  insertInstMetric.run('inst-cambridge', 'qs-rank', 2022, null, 3, 'wb');

  // 2. Box Office
  console.log('Seeding Box Office data...');
  // Add to metrics table to satisfy legacy FK constraints
  db.prepare(`INSERT OR REPLACE INTO metrics (id, name, category_id, unit, format_type, description) VALUES ('box-office', 'Global Box Office Gross', 'economy', 'USD', 'currency', 'Global Box Office Gross')`).run();

  db.prepare(`INSERT OR REPLACE INTO metric_registry (canonical_id, entity_type, semantic_definition, unit, source_id, resolution_table, resolution_column) VALUES ('box-office', 'entertainment', 'Global Box Office Gross', 'USD', 'wb', 'entertainment_metrics', 'value')`).run();
  
  const insertMovie = db.prepare(`INSERT OR REPLACE INTO entertainment_entities (id, type, title, release_date, primary_country_id) VALUES (?, ?, ?, ?, ?)`);
  insertMovie.run('mov-avatar', 'movie', 'Avatar', '2009-12-18', 'usa');
  insertMovie.run('mov-avengers', 'movie', 'Avengers: Endgame', '2019-04-26', 'usa');
  insertMovie.run('mov-dangal', 'movie', 'Dangal', '2016-12-21', 'ind');

  const insertMovieMetric = db.prepare(`INSERT OR REPLACE INTO entertainment_metrics (entity_id, metric_id, market_country_id, period, value, source_id) VALUES (?, ?, ?, ?, ?, ?)`);
  insertMovieMetric.run('mov-avatar', 'box-office', 'usa', '2023', 2923706026, 'wb');
  insertMovieMetric.run('mov-avengers', 'box-office', 'usa', '2023', 2797501328, 'wb');
  insertMovieMetric.run('mov-dangal', 'box-office', 'ind', '2023', 340000000, 'wb');

  console.log('Database seeding complete. globiq.db is ready.');
}

seed().catch(console.error);
