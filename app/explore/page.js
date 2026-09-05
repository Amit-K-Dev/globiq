import { countries } from "@/lib/data/countries";
import { topics } from "@/lib/data/topics";
import CountryCard from "@/components/globiq/country-card";
import CategoryCard from "@/components/globiq/category-card";
import { Landmark, Users, Leaf, Zap, Globe, TrendingUp } from "lucide-react";

const getIcon = (name) => {
  const icons = { Landmark, Users, Leaf, Zap, Globe, TrendingUp };
  return icons[name] || Globe;
};

export default function ExplorePage() {
  return (
    <div className="container px-4 py-8 md:py-12 mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Explore Data</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Browse by topic to find specific indicators, or explore our featured countries to see their comprehensive data profiles.
        </p>
      </div>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Topics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((t) => (
            <CategoryCard
              key={t.id}
              title={t.name}
              description={t.description}
              icon={getIcon(t.icon)}
              href={`/rankings?topic=${t.id}`}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">All Featured Countries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {countries.map((c) => (
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
    </div>
  );
}
