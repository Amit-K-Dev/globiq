const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const dbPath = path.join(__dirname, '..', 'globiq.db');
const schemaPath = path.join(__dirname, '..', 'lib', 'db', 'schema.sql');

try {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
} catch (e) {
  console.warn('Could not delete db file, it might be locked. Proceeding anyway.');
}

const db = new Database(dbPath);

console.log('Initializing database schema...');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

console.log('Inserting base entities...');

const insertCountry = db.prepare(`INSERT OR REPLACE INTO countries (id, name, iso_code, flag, region) VALUES (?, ?, ?, ?, ?)`);
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
countries.forEach(c => insertCountry.run(...c));

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

const insertSource = db.prepare(`INSERT OR REPLACE INTO sources (id, name, url, license) VALUES (?, ?, ?, ?)`);
insertSource.run('wb', 'World Bank', 'https://data.worldbank.org', 'CC BY 4.0');

const insertHistoricalValue = db.prepare(`INSERT OR REPLACE INTO historical_values (country_id, metric_id, year, value) VALUES (?, ?, ?, ?)`);

async function processCSV(filePath, metricId) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const isoCode = row['Country Code'];
        const country = db.prepare('SELECT id FROM countries WHERE iso_code = ?').get(isoCode);
        if (country) {
          const years = ['2021', '2022', '2023'];
          years.forEach(year => {
            const val = parseFloat(row[year]);
            if (!isNaN(val)) {
              insertHistoricalValue.run(country.id, metricId, parseInt(year), val);
            }
          });
        }
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

  console.log('Database seeding complete. globiq.db is ready.');
}

seed().catch(console.error);
