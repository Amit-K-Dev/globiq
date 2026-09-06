import { Search, Globe, Landmark, Users, Zap, Leaf, TrendingUp } from "lucide-react";
import CategoryCard from "@/components/globiq/category-card";
import TrendingCard from "@/components/globiq/trending-card";
import CountryCard from "@/components/globiq/country-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getCountriesWithLatestMetrics } from "@/lib/data/countries";
import { getCategories } from "@/lib/data/categories";
import { getRankingsByMetric } from "@/lib/data/metrics";
import Link from "next/link";

const getIcon = (name) => {
  const icons = { Landmark, Users, Leaf, Zap, Globe, TrendingUp };
  return icons[name] || Globe;
};

export default async function Home() {
  const countries = await getCountriesWithLatestMetrics();
  const topics = await getCategories();
  const featuredCountries = countries.slice(0, 6);
  const gdpRankings = (await getRankingsByMetric("gdp")).slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 lg:py-48 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center text-center">
          <Badge className="mb-4" variant="secondary">Beta Release</Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
            The world. <span className="text-primary">In numbers.</span>
          </h1>
          <p className="max-w-[700px] text-lg md:text-xl text-muted-foreground mb-8">
            Explore, compare, and understand countries, economies, people, environment, trade, and global culture through data.
          </p>
          <form action="/search" className="w-full max-w-2xl relative flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              name="q"
              type="search"
              placeholder="Search for countries, regions, or indicators..."
              className="w-full h-14 pl-12 pr-4 rounded-full border border-border bg-background/50 backdrop-blur-sm text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
          </form>
        </div>
      </section>

      {/* Trending Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Trending Indicators</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TrendingCard 
              title="Global GDP" 
              value="$105 Trillion" 
              trend="+3.2%" 
              trendValue="vs last year"
              isPositive={true}
              href="/rankings?indicator=gdp" 
            />
            <TrendingCard 
              title="World Population" 
              value="8.1 Billion" 
              trend="+0.8%" 
              trendValue="vs last year"
              isPositive={true}
              href="/rankings?indicator=population" 
            />
            <TrendingCard 
              title="Global Inflation" 
              value="5.8%" 
              trend="-1.2%" 
              trendValue="vs last year"
              isPositive={false}
              href="/rankings?indicator=inflation" 
            />
            <TrendingCard 
              title="CO2 Emissions" 
              value="37.4 Gt" 
              trend="+1.1%" 
              trendValue="vs last year"
              isPositive={false}
              href="/rankings?indicator=co2" 
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full py-16 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Explore Topics</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map(t => (
              <CategoryCard 
                key={t.id}
                title={t.name} 
                description={t.description}
                icon={getIcon(t.icon)}
                href={`/explore#${t.id}`} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Explore Countries Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Featured Countries</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCountries.map(c => (
              <CountryCard 
                key={c.id}
                name={c.name} 
                flag={c.flag} 
                region={c.region} 
                population={(c.population / 1e6).toFixed(1) + "M"} 
                gdp={"$" + (c.gdp / 1e12).toFixed(1) + "T"} 
                href={`/country/${c.id}`} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Global Rankings Section */}
      <section className="w-full py-16 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold tracking-tight mb-8">Largest Economies (GDP)</h2>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[80px]">Rank</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-right">GDP (USD)</TableHead>
                      <TableHead className="text-right">Growth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gdpRankings.map((item, index) => (
                      <TableRow key={item.country.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <Link href={`/country/${item.country.id}`} className="hover:underline">
                            {item.country.name} {item.country.flag}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">{item.formattedValue}</TableCell>
                        <TableCell className={`text-right ${item.country.gdpGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {item.country.gdpGrowth > 0 ? "+" : ""}{item.country.gdpGrowth}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="flex-1 bg-primary/5 rounded-2xl p-8 flex flex-col justify-center items-center text-center border border-primary/10">
              <div className="mb-6 p-4 bg-background rounded-full shadow-sm">
                <Globe className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Compare Nations</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Select up to 4 countries and compare them across hundreds of economic, demographic, and environmental indicators.
              </p>
              <Link href="/compare" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Start Comparison
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
