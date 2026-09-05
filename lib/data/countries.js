export const countries = [
  {
    id: "usa",
    name: "United States",
    flag: "🇺🇸",
    region: "North America",
    population: 339900000,
    gdp: 27360000000000,
    gdpGrowth: 2.5,
    inflation: 3.4,
    co2: 4800,
  },
  {
    id: "chn",
    name: "China",
    flag: "🇨🇳",
    region: "East Asia",
    population: 1410000000,
    gdp: 17700000000000,
    gdpGrowth: 5.2,
    inflation: 0.2,
    co2: 11400,
  },
  {
    id: "ind",
    name: "India",
    flag: "🇮🇳",
    region: "South Asia",
    population: 1420000000,
    gdp: 3730000000000,
    gdpGrowth: 7.6,
    inflation: 5.1,
    co2: 2800,
  },
  {
    id: "deu",
    name: "Germany",
    flag: "🇩🇪",
    region: "Europe",
    population: 83200000,
    gdp: 4430000000000,
    gdpGrowth: -0.3,
    inflation: 2.5,
    co2: 600,
  },
  {
    id: "jpn",
    name: "Japan",
    flag: "🇯🇵",
    region: "East Asia",
    population: 123900000,
    gdp: 4210000000000,
    gdpGrowth: 1.9,
    inflation: 2.8,
    co2: 1000,
  },
  {
    id: "bra",
    name: "Brazil",
    flag: "🇧🇷",
    region: "South America",
    population: 216400000,
    gdp: 2100000000000,
    gdpGrowth: 2.9,
    inflation: 4.5,
    co2: 450,
  },
  {
    id: "gbr",
    name: "United Kingdom",
    flag: "🇬🇧",
    region: "Europe",
    population: 67700000,
    gdp: 3300000000000,
    gdpGrowth: 0.1,
    inflation: 3.2,
    co2: 320,
  },
  {
    id: "fra",
    name: "France",
    flag: "🇫🇷",
    region: "Europe",
    population: 68000000,
    gdp: 3000000000000,
    gdpGrowth: 0.9,
    inflation: 2.4,
    co2: 300,
  },
];

export function getCountryById(id) {
  return countries.find((c) => c.id === id);
}

export function getCountriesByIds(ids) {
  if (!ids || !ids.length) return [];
  return ids.map(id => getCountryById(id)).filter(Boolean);
}

export function searchCountries(query) {
  if (!query) return [];
  const q = query.toLowerCase();
  return countries.filter(
    (c) => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q)
  );
}

export function formatLargeNumber(num, isCurrency = false) {
  if (!num) return "N/A";
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
