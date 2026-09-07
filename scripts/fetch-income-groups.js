const fs = require('fs');
const path = require('path');
const https = require('https');

const url = 'https://api.worldbank.org/v2/country?format=json&per_page=300';
const outputPath = path.join(__dirname, '..', 'data', 'raw', 'income-groups.json');

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 1) {
        const countries = parsed[1];
        const incomeMap = {};
        countries.forEach(c => {
          if (c.id && c.incomeLevel && c.incomeLevel.value && c.incomeLevel.value !== "Aggregates") {
            incomeMap[c.id] = c.incomeLevel.value;
          }
        });
        fs.writeFileSync(outputPath, JSON.stringify(incomeMap, null, 2));
        console.log(`Saved income groups for ${Object.keys(incomeMap).length} countries to ${outputPath}`);
      } else {
        console.error('Unexpected response format:', data.substring(0, 200));
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
}).on('error', (e) => {
  console.error('Fetch error:', e);
});
