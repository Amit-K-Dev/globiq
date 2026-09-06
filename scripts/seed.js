const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const dbPath = path.join(__dirname, '..', 'globiq.db');
const schemaPath = path.join(__dirname, '..', 'lib', 'db', 'schema.sql');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new Database(dbPath);

console.log('Initializing database schema...');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

console.log('Inserting base entities...');

const insertCountry = db.prepare(`INSERT INTO countries (id, name, iso_code, flag, region) VALUES (?, ?, ?, ?, ?)`);
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

const insertCategory = db.prepare(`INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)`);
insertCategory.run('economy', 'Economy', '💰');
insertCategory.run('population', 'Population', '👥');
insertCategory.run('environment', 'Environment', '🌱');

const insertMetric = db.prepare(`INSERT INTO metrics (id, name, category_id, unit, format_type, description) VALUES (?, ?, ?, ?, ?, ?)`);
insertMetric.run('gdp', 'GDP', 'economy', 'USD', 'currency', 'Gross Domestic Product');
insertMetric.run('population', 'Population', 'population', 'people', 'number', 'Total population');
insertMetric.run('gdp-growth', 'GDP Growth', 'economy', '%', 'percentage', 'Annual GDP growth rate');
insertMetric.run('inflation', 'Inflation', 'economy', '%', 'percentage', 'Annual inflation rate');
insertMetric.run('co2', 'CO₂ Emissions', 'environment', 'Mt', 'number', 'Carbon dioxide emissions');

const insertSource = db.prepare(`INSERT INTO sources (id, name, url, license) VALUES (?, ?, ?, ?)`);
insertSource.run('wb', 'World Bank', 'https://data.worldbank.org', 'CC BY 4.0');

const insertHistoricalValue = db.prepare(`INSERT OR IGNORE INTO historical_values (country_id, metric_id, year, value) VALUES (?, ?, ?, ?)`);

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
  
  // Static dummy values for remaining metrics for 2021-2023
  const years = [2021, 2022, 2023];
  const otherMetrics = ['gdp-growth', 'inflation', 'co2'];
  
  const allCountries = db.prepare('SELECT id FROM countries').all();
  for (const c of allCountries) {
    for (const m of otherMetrics) {
      for (const y of years) {
         let val = 0;
         if (m === 'gdp-growth') val = (Math.random() * 5).toFixed(1);
         if (m === 'inflation') val = (Math.random() * 6).toFixed(1);
         if (m === 'co2') val = Math.floor(100 + Math.random() * 4000);
         insertHistoricalValue.run(c.id, m, y, parseFloat(val));
      }
    }
  }

  console.log('Database seeding complete. globiq.db is ready.');
}

seed().catch(console.error);
