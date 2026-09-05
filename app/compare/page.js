import { Suspense } from "react";
import CompareSelector from "@/components/globiq/compare-selector";
import { getCountriesByIds } from "@/lib/data/countries";
import { formatIndicatorValue } from "@/lib/data/indicators";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function ComparePage({ searchParams }) {
  const params = await searchParams;
  const countryIds = params.countries ? params.countries.split(",").filter(Boolean) : [];
  
  // Enforce max 4
  const limitedIds = countryIds.slice(0, 4);
  const selectedCountries = getCountriesByIds(limitedIds);

  const metrics = [
    { id: "population", name: "Population" },
    { id: "gdp", name: "GDP (USD)" },
    { id: "gdpGrowth", name: "GDP Growth (%)" },
    { id: "inflation", name: "Inflation (%)" },
    { id: "co2", name: "CO2 Emissions (kt)" },
  ];

  return (
    <div className="container px-4 py-8 md:py-12 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Compare Countries</h1>
        <p className="text-muted-foreground max-w-3xl">
          Select up to 4 countries to compare their key economic and demographic indicators side-by-side.
        </p>
      </div>

      <div className="mb-12">
        <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted rounded"></div>}>
          <CompareSelector selectedIds={limitedIds} />
        </Suspense>
      </div>

      {selectedCountries.length > 0 ? (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-4 font-medium text-muted-foreground w-1/4">Indicator</th>
                {selectedCountries.map((country) => (
                  <th key={country.id} className="p-4 font-semibold text-foreground w-1/4 min-w-[150px]">
                    <div className="flex flex-col gap-1">
                      <span className="text-2xl">{country.flag}</span>
                      <Link href={`/country/${country.id}`} className="hover:underline inline-flex items-center gap-1">
                        {country.name}
                      </Link>
                    </div>
                  </th>
                ))}
                {Array.from({ length: Math.max(0, 4 - selectedCountries.length) }).map((_, i) => (
                  <th key={`empty-header-${i}`} className="p-4 text-muted-foreground/50 font-normal w-1/4 min-w-[150px]">
                    Select a country
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {metrics.map((metric) => (
                <tr key={metric.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{metric.name}</td>
                  {selectedCountries.map((country) => (
                    <td key={`${country.id}-${metric.id}`} className="p-4">
                      {formatIndicatorValue(country[metric.id], metric.id)}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - selectedCountries.length) }).map((_, i) => (
                    <td key={`empty-cell-${metric.id}-${i}`} className="p-4 text-muted-foreground/30">
                      -
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center border rounded-lg bg-muted/20 border-dashed">
          <div className="text-4xl mb-4 opacity-80">⚖️</div>
          <h2 className="text-xl font-semibold mb-2">No countries selected</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Use the search box above to add countries and start comparing their data.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-sm text-muted-foreground">Try comparing:</span>
            <Link href="/compare?countries=usa,chn" className="text-sm text-primary hover:underline font-medium">
              USA vs China
            </Link>
            <span className="text-sm text-muted-foreground">or</span>
            <Link href="/compare?countries=bra,ind,zaf" className="text-sm text-primary hover:underline font-medium">
              Brazil, India & South Africa
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
