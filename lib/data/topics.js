export const topics = [
  {
    id: "economy",
    name: "Economy",
    description: "GDP, inflation, unemployment, trade, and economic growth.",
    icon: "Landmark",
    indicators: ["gdp", "gdpGrowth", "inflation"],
  },
  {
    id: "demographics",
    name: "Demographics",
    description: "Population, age distribution, life expectancy, and migration.",
    icon: "Users",
    indicators: ["population"],
  },
  {
    id: "environment",
    name: "Environment",
    description: "CO2 emissions, renewable energy, climate, and geography.",
    icon: "Leaf",
    indicators: ["co2"],
  },
  {
    id: "energy",
    name: "Energy",
    description: "Energy production, consumption, electricity access, and fossil fuels.",
    icon: "Zap",
    indicators: [],
  },
  {
    id: "trade",
    name: "Global Trade",
    description: "Exports, imports, tariffs, and trade balance.",
    icon: "Globe",
    indicators: [],
  },
  {
    id: "development",
    name: "Development",
    description: "HDI, education, poverty, and healthcare access.",
    icon: "TrendingUp",
    indicators: [],
  },
];

export function getTopicById(id) {
  return topics.find((t) => t.id === id);
}

export function searchTopics(query) {
  if (!query) return [];
  const q = query.toLowerCase();
  return topics.filter(
    (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
  );
}
