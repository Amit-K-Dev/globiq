const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const csv = require('csv-parser');

const dbPath = path.join(__dirname, 'globiq.db');
const db = new Database(dbPath);

const metrics = ['gdp', 'population', 'gdp-per-capita', 'population-growth', 'exports', 'imports', 'energy-consumption', 'gdp-growth', 'inflation', 'co2'];

async function getCsvData(metric) {
  return new Promise((resolve) => {
    const results = [];
    fs.createReadStream(path.join(__dirname, 'data', 'raw', `${metric}.csv`))
      .pipe(csv())
      .on('data', (data) => {
        if (data['Country Code'] === 'USA') {
          results.push(data);
        }
      })
      .on('end', () => resolve(results[0]));
  });
}

async function verify() {
  console.log("=== Verification for USA (2021-2023) ===\n");
  
  for (const metric of metrics) {
    console.log(`Metric: ${metric}`);
    const csvData = await getCsvData(metric);
    console.log(`  CSV Data:`);
    console.log(`    2021: ${csvData['2021']}`);
    console.log(`    2022: ${csvData['2022']}`);
    console.log(`    2023: ${csvData['2023']}`);
    
    const dbData = db.prepare(`SELECT year, value FROM historical_values WHERE country_id = 'usa' AND metric_id = ? ORDER BY year ASC`).all(metric);
    console.log(`  Database Data:`);
    for (const row of dbData) {
      console.log(`    ${row.year}: ${row.value}`);
    }
    
    // Compare
    const matched = 
      parseFloat(csvData['2021']) === dbData.find(d => d.year === 2021)?.value &&
      parseFloat(csvData['2022']) === dbData.find(d => d.year === 2022)?.value &&
      parseFloat(csvData['2023']) === dbData.find(d => d.year === 2023)?.value;
      
    console.log(`  Match: ${matched ? '✅ YES' : '❌ NO'}\n`);
  }
}

verify().catch(console.error);
