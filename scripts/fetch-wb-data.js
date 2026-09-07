const fs = require('fs');
const path = require('path');
const https = require('https');

const COUNTRIES = [
  { code: 'USA', name: 'United States' },
  { code: 'CHN', name: 'China' },
  { code: 'IND', name: 'India' },
  { code: 'DEU', name: 'Germany' },
  { code: 'JPN', name: 'Japan' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'GBR', name: 'United Kingdom' },
  { code: 'FRA', name: 'France' },
];

const INDICATORS = [
  { id: 'gdp-per-capita', code: 'NY.GDP.PCAP.CD', name: 'GDP per capita (current US$)' },
  { id: 'population-growth', code: 'SP.POP.GROW', name: 'Population growth (annual %)' },
  { id: 'exports', code: 'NE.EXP.GNFS.CD', name: 'Exports of goods and services (current US$)' },
  { id: 'imports', code: 'NE.IMP.GNFS.CD', name: 'Imports of goods and services (current US$)' },
  { id: 'energy-consumption', code: 'EG.USE.PCAP.KG.OE', name: 'Energy use (kg of oil equivalent per capita)' },
  { id: 'gdp-growth', code: 'NY.GDP.MKTP.KD.ZG', name: 'GDP growth (annual %)' },
  { id: 'inflation', code: 'FP.CPI.TOTL.ZG', name: 'Inflation, consumer prices (annual %)' },
  { id: 'co2', code: 'EN.GHG.CO2.MT.CE.AR5', name: 'Carbon dioxide (CO2) emissions (total) excluding LULUCF (Mt CO2e)' }
];

const YEARS = [2021, 2022, 2023];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchIndicatorData(indicator) {
  const countryCodes = COUNTRIES.map(c => c.code).join(';');
  const url = `https://api.worldbank.org/v2/country/${countryCodes}/indicator/${indicator.code}?format=json&date=2021:2023&per_page=1000`;
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (!parsed || !parsed[1]) {
            reject(new Error(`Invalid response for ${indicator.id}`));
            return;
          }
          resolve(parsed[1]);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', err => reject(err));
  });
}

async function main() {
  const outDir = path.join(__dirname, '..', 'data', 'raw');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Fetching World Bank API data...');

  for (const indicator of INDICATORS) {
    console.log(`\nFetching ${indicator.name}...`);
    try {
      const apiData = await fetchIndicatorData(indicator);
      
      let csvContent = `"Country Name","Country Code","Indicator Name","Indicator Code","2021","2022","2023"\n`;
      let hasMissingData = false;

      for (const country of COUNTRIES) {
        const countryData = apiData.filter(d => d.countryiso3code === country.code);
        
        const val2021 = countryData.find(d => d.date === '2021')?.value;
        const val2022 = countryData.find(d => d.date === '2022')?.value;
        const val2023 = countryData.find(d => d.date === '2023')?.value;

        if (val2021 == null || val2022 == null || val2023 == null) {
          console.warn(`⚠️  WARNING: Missing data for ${country.name} in ${indicator.id}`);
          console.warn(`   2021: ${val2021}, 2022: ${val2022}, 2023: ${val2023}`);
          hasMissingData = true;
        }

        const csvVal2021 = val2021 != null ? val2021 : '';
        const csvVal2022 = val2022 != null ? val2022 : '';
        const csvVal2023 = val2023 != null ? val2023 : '';

        csvContent += `"${country.name}","${country.code}","${indicator.name}","${indicator.code}","${csvVal2021}","${csvVal2022}","${csvVal2023}"\n`;
      }

      const filePath = path.join(outDir, `${indicator.id}.csv`);
      fs.writeFileSync(filePath, csvContent);
      console.log(`✅ Saved to ${filePath}`);
      if (hasMissingData) {
        console.log(`❗ Note: ${indicator.id} has some missing real data from WB API.`);
      }

      await delay(1000); // Wait 1 second before next request

    } catch (e) {
      console.error(`Failed to fetch ${indicator.id}:`, e);
    }
  }
}

main().catch(console.error);
