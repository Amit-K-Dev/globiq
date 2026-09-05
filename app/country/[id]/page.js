import { getCountryById, countries } from "@/lib/data/countries";
import { formatIndicatorValue } from "@/lib/data/indicators";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  return countries.map((c) => ({
    id: c.id,
  }));
}

export default async function CountryPage({ params }) {
  const p = await params;
  const country = getCountryById(p.id);

  if (!country) {
    notFound();
  }

  const stats = [
    { label: "Population", value: formatIndicatorValue(country.population, "population") },
    { label: "GDP (USD)", value: formatIndicatorValue(country.gdp, "gdp") },
    { label: "GDP Growth", value: formatIndicatorValue(country.gdpGrowth, "gdpGrowth") },
    { label: "Inflation", value: formatIndicatorValue(country.inflation, "inflation") },
    { label: "CO2 Emissions", value: formatIndicatorValue(country.co2, "co2") },
  ];

  return (
    <div className="container px-4 py-8 md:py-12 mx-auto">
      <div className="mb-6">
        <Link href="/explore" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Explore
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b pb-8">
        <div className="flex items-center gap-6">
          <div className="text-6xl md:text-8xl rounded-lg border bg-muted shadow-sm px-4 py-2 flex items-center justify-center">
            {country.flag}
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{country.name}</h1>
            <p className="text-xl text-muted-foreground">{country.region}</p>
          </div>
        </div>
        <div>
          <Link href={`/compare?countries=${country.id}`} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Compare
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
