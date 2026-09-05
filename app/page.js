import { Search, Globe, Landmark, Users, Zap, Leaf, TrendingUp } from "lucide-react";
import CategoryCard from "@/components/globiq/category-card";
import TrendingCard from "@/components/globiq/trending-card";
import CountryCard from "@/components/globiq/country-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Home() {
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
          <div className="w-full max-w-2xl relative flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search for countries, regions, or indicators..."
              className="w-full h-14 pl-12 pr-4 rounded-full border border-border bg-background/50 backdrop-blur-sm text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
          </div>
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
              href="/indicator/gdp" 
            />
            <TrendingCard 
              title="World Population" 
              value="8.1 Billion" 
              trend="+0.8%" 
              trendValue="vs last year"
              isPositive={true}
              href="/indicator/population" 
            />
            <TrendingCard 
              title="Global Inflation" 
              value="5.8%" 
              trend="-1.2%" 
              trendValue="vs last year"
              isPositive={false}
              href="/indicator/inflation" 
            />
            <TrendingCard 
              title="CO2 Emissions" 
              value="37.4 Gt" 
              trend="+1.1%" 
              trendValue="vs last year"
              isPositive={false}
              href="/indicator/co2" 
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
            <CategoryCard 
              title="Economy" 
              description="GDP, inflation, unemployment, trade, and economic growth."
              icon={Landmark}
              href="/topic/economy" 
            />
            <CategoryCard 
              title="Demographics" 
              description="Population, age distribution, life expectancy, and migration."
              icon={Users}
              href="/topic/demographics" 
            />
            <CategoryCard 
              title="Environment" 
              description="CO2 emissions, renewable energy, climate, and geography."
              icon={Leaf}
              href="/topic/environment" 
            />
            <CategoryCard 
              title="Energy" 
              description="Energy production, consumption, electricity access, and fossil fuels."
              icon={Zap}
              href="/topic/energy" 
            />
            <CategoryCard 
              title="Global Trade" 
              description="Exports, imports, tariffs, and trade balance."
              icon={Globe}
              href="/topic/trade" 
            />
            <CategoryCard 
              title="Development" 
              description="HDI, education, poverty, and healthcare access."
              icon={TrendingUp}
              href="/topic/development" 
            />
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
            <CountryCard 
              name="United States" 
              flag="🇺🇸" 
              region="North America" 
              population="339.9M" 
              gdp="$27.3T" 
              href="/country/usa" 
            />
            <CountryCard 
              name="China" 
              flag="🇨🇳" 
              region="East Asia" 
              population="1.41B" 
              gdp="$17.7T" 
              href="/country/chn" 
            />
            <CountryCard 
              name="India" 
              flag="🇮🇳" 
              region="South Asia" 
              population="1.42B" 
              gdp="$3.7T" 
              href="/country/ind" 
            />
            <CountryCard 
              name="Germany" 
              flag="🇩🇪" 
              region="Europe" 
              population="83.2M" 
              gdp="$4.4T" 
              href="/country/deu" 
            />
            <CountryCard 
              name="Japan" 
              flag="🇯🇵" 
              region="East Asia" 
              population="123.9M" 
              gdp="$4.2T" 
              href="/country/jpn" 
            />
            <CountryCard 
              name="Brazil" 
              flag="🇧🇷" 
              region="South America" 
              population="216.4M" 
              gdp="$2.1T" 
              href="/country/bra" 
            />
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
                    <TableRow>
                      <TableCell className="font-medium">1</TableCell>
                      <TableCell>United States 🇺🇸</TableCell>
                      <TableCell className="text-right">$27.36 Trillion</TableCell>
                      <TableCell className="text-right text-green-500">+2.5%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">2</TableCell>
                      <TableCell>China 🇨🇳</TableCell>
                      <TableCell className="text-right">$17.70 Trillion</TableCell>
                      <TableCell className="text-right text-green-500">+5.2%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">3</TableCell>
                      <TableCell>Germany 🇩🇪</TableCell>
                      <TableCell className="text-right">$4.43 Trillion</TableCell>
                      <TableCell className="text-right text-red-500">-0.3%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">4</TableCell>
                      <TableCell>Japan 🇯🇵</TableCell>
                      <TableCell className="text-right">$4.21 Trillion</TableCell>
                      <TableCell className="text-right text-green-500">+1.9%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">5</TableCell>
                      <TableCell>India 🇮🇳</TableCell>
                      <TableCell className="text-right">$3.73 Trillion</TableCell>
                      <TableCell className="text-right text-green-500">+7.6%</TableCell>
                    </TableRow>
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
              <button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Start Comparison
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
