import { searchCountries } from "@/lib/data/countries";
import { searchCategories } from "@/lib/data/categories";
import { searchMetrics } from "@/lib/data/metrics";
import CountryCard from "@/components/globiq/country-card";
import CategoryCard from "@/components/globiq/category-card";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Landmark, Users, Leaf, Zap, Globe, TrendingUp } from "lucide-react";

// Helper to get lucide icon component by name
const getIcon = (name) => {
  const icons = { Landmark, Users, Leaf, Zap, Globe, TrendingUp };
  return icons[name] || Globe;
};

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params.q || "";

  const countryResults = await searchCountries(query);
  const topicResults = await searchCategories(query);
  const indicatorResults = await searchMetrics(query);

  const hasResults = countryResults.length > 0 || topicResults.length > 0 || indicatorResults.length > 0;

  return (
    <div className="container px-4 py-8 md:py-12 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Search Results</h1>
        <p className="text-muted-foreground">
          Showing results for <span className="font-semibold text-foreground">&quot;{query}&quot;</span>
        </p>
      </div>

      {!hasResults && query && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">No results found</h2>
          <p className="text-muted-foreground max-w-md">
            We couldn&apos;t find anything matching &quot;{query}&quot;. Try searching for a different country, region, or indicator like &quot;GDP&quot; or &quot;Population&quot;.
          </p>
        </div>
      )}

      {hasResults && (
        <div className="flex flex-col gap-12">
          {countryResults.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-6 border-b pb-2">Countries</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {countryResults.map((c) => (
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
            </section>
          )}

          {topicResults.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-6 border-b pb-2">Topics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {topicResults.map((t) => (
                  <CategoryCard
                    key={t.id}
                    title={t.name}
                    description={t.description}
                    icon={getIcon(t.icon)}
                    href={`/explore#${t.id}`}
                  />
                ))}
              </div>
            </section>
          )}

          {indicatorResults.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-6 border-b pb-2">Indicators</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {indicatorResults.map((i) => (
                  <Link href={`/metric/${i.id}`} key={i.id}>
                    <Card className="h-full hover:bg-muted/50 transition-colors">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{i.name}</CardTitle>
                        </div>
                        <CardDescription className="mt-2 line-clamp-2">
                          {i.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
