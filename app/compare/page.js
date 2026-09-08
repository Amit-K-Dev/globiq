import { Suspense } from "react";
import CompareSelector from "@/components/globiq/compare-selector";
import ComparisonChart from "@/components/globiq/comparison-chart";
import { getCountries, getCountryWithLatestMetrics } from "@/lib/data/countries";
import { getMetrics, getHistoricalComparison, getRankingsByMetric } from "@/lib/data/metrics";
import { formatMetricValue } from "@/lib/utils/format";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function ComparePage({ searchParams }) {
  const params = await searchParams;
  const countryIds = params.countries ? params.countries.split(",").filter(Boolean) : [];
  
  // Enforce max 4
  const limitedIds = countryIds.slice(0, 4);
  const selectedCountries = await Promise.all(
    limitedIds.map(id => getCountryWithLatestMetrics(id))
  ).then(res => res.filter(Boolean));

  const allCountries = await getCountries();
  const metrics = await getMetrics();

  // Fetch historical data for all metrics
  const historicalDataPromises = metrics.map(async (m) => {
    const data = await getHistoricalComparison(m.id, limitedIds);
    return { metricId: m.id, ...data };
  });
  
  const historicalDataList = await Promise.all(historicalDataPromises);
  const historicalDataMap = historicalDataList.reduce((acc, curr) => {
    acc[curr.metricId] = curr;
    return acc;
  }, {});

  // Resolve dynamic latest year, value, and rank
  const resolvedData = {};
  await Promise.all(metrics.map(async (metric) => {
    resolvedData[metric.id] = {};
    const chartData = historicalDataMap[metric.id];
    
    const yearNeeds = new Set();
    const countryLatest = {};
    
    selectedCountries.forEach((country) => {
      let latestYear = null;
      let latestValue = null;
      if (chartData && chartData.data) {
        for (let i = chartData.data.length - 1; i >= 0; i--) {
          const point = chartData.data[i];
          if (point[country.name] !== undefined && point[country.name] !== null) {
            latestYear = point.year;
            latestValue = point[country.name];
            break;
          }
        }
      }
      countryLatest[country.id] = { year: latestYear, value: latestValue };
      if (latestYear) yearNeeds.add(latestYear);
    });
    
    const rankingsByYear = {};
    for (const yr of yearNeeds) {
      rankingsByYear[yr] = await getRankingsByMetric(metric.id, "all", "all", yr);
    }
    
    selectedCountries.forEach((country) => {
      const { year, value } = countryLatest[country.id];
      let rank = null;
      if (year && value !== null) {
        const rankings = rankingsByYear[year];
        const rankIndex = rankings.findIndex(r => r.country.id === country.id);
        if (rankIndex >= 0) rank = rankIndex + 1;
      }
      resolvedData[metric.id][country.id] = { value, year, rank };
    });
  }));

  return (
    <div className="container px-4 py-8 md:py-12 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Compare Countries</h1>
        <p className="text-muted-foreground max-w-3xl">
          Select up to 4 countries to compare their key economic and demographic indicators side-by-side.
        </p>
      </div>

      <div className="mb-12 relative z-10">
        <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted rounded"></div>}>
          <CompareSelector selectedIds={limitedIds} countries={allCountries} />
        </Suspense>
      </div>

      {selectedCountries.length > 0 ? (
        <div className="space-y-12">
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4 font-medium text-muted-foreground w-1/4">Indicator (Latest)</th>
                  {selectedCountries.map((country) => (
                    <th key={country.id} className="p-4 font-semibold text-foreground w-1/4 min-w-37.5 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="text-2xl">{country.flag}</span>
                        <Link href={`/country/${country.id}`} className="hover:underline inline-flex items-center gap-1">
                          {country.name}
                        </Link>
                        <div className="text-xs text-muted-foreground font-normal mt-1">
                          {country.region}<br />
                          {country.income_group || country.incomeGroup || 'Unknown'}
                        </div>
                      </div>
                    </th>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - selectedCountries.length) }).map((_, i) => (
                    <th key={`empty-header-${i}`} className="p-4 text-muted-foreground/50 font-normal w-1/4 min-w-37.5">
                      Select a country
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {metrics.map((metric) => (
                  <tr key={metric.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium align-top">
                      <div>{metric.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 font-normal">{metric.unit}</div>
                    </td>
                    {selectedCountries.map((country) => {
                      const data = resolvedData[metric.id][country.id];
                      return (
                        <td key={`${country.id}-${metric.id}`} className="p-4 align-top">
                          {data.value !== null ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-base">{formatMetricValue(data.value, metric)}</span>
                              <span className="text-xs text-muted-foreground">Year: {data.year}</span>
                              {data.rank && <span className="text-xs text-muted-foreground">Rank: #{data.rank}</span>}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50 text-sm">No data</span>
                          )}
                        </td>
                      );
                    })}
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

          <div className="space-y-8 pt-4">
            <h2 className="text-2xl font-bold tracking-tight">Historical Trends</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {metrics.map(metric => {
                const chartData = historicalDataMap[metric.id];
                return (
                  <div key={`chart-${metric.id}`} className="border rounded-lg p-6 bg-card shadow-sm min-w-0">
                    <h3 className="text-lg font-semibold mb-1">{metric.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{metric.description} ({metric.unit})</p>
                    <ComparisonChart 
                      data={chartData?.data || []} 
                      countries={chartData?.countries || []} 
                      metric={metric} 
                    />
                  </div>
                );
              })}
            </div>
          </div>
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
