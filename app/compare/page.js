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
  
  const startYearParam = parseInt(params.startYear, 10);
  const endYearParam = parseInt(params.endYear, 10);
  
  let startYear = !isNaN(startYearParam) ? startYearParam : null;
  let endYear = !isNaN(endYearParam) ? endYearParam : null;

  if (startYear !== null && endYear !== null && startYear > endYear) {
    const temp = startYear;
    startYear = endYear;
    endYear = temp;
  }
  
  // Enforce max 4
  const limitedIds = countryIds.slice(0, 4);
  const selectedCountries = await Promise.all(
    limitedIds.map(id => getCountryWithLatestMetrics(id))
  ).then(res => res.filter(Boolean));

  const allCountries = await getCountries();
  const allMetrics = await getMetrics();
  let metrics = allMetrics;

  // Filter metrics if specified in URL
  const metricIds = params.metrics ? params.metrics.split(",").filter(Boolean) : [];
  if (metricIds.length > 0) {
    metrics = metrics.filter(m => metricIds.includes(m.id));
  }

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

  const allAvailableYears = new Set();
  Object.values(historicalDataMap).forEach(chart => {
    if (chart && chart.data) {
      chart.data.forEach(p => {
        if (p.year) allAvailableYears.add(Number(p.year));
      });
    }
  });
  const sortedYears = Array.from(allAvailableYears).sort((a, b) => b - a);

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
      let startValue = null;
      let foundEnd = false;
      
      if (chartData && chartData.data) {
        for (let i = chartData.data.length - 1; i >= 0; i--) {
          const point = chartData.data[i];
          const val = point[country.name];
          if (val !== undefined && val !== null) {
            if (endYear !== null) {
              if (Number(point.year) === endYear) {
                latestYear = point.year;
                latestValue = val;
                foundEnd = true;
              }
            } else {
              if (latestYear === null) {
                latestYear = point.year;
                latestValue = val;
                foundEnd = true;
              }
            }
            if (startYear !== null) {
              if (Number(point.year) === startYear) {
                startValue = val;
              }
            }
          }
        }
      }
      
      if (endYear !== null && !foundEnd) {
        latestYear = endYear.toString();
        latestValue = null;
      }

      countryLatest[country.id] = { year: latestYear, value: latestValue, startValue };
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
      
      let absoluteDelta = undefined;
      let percentageDelta = undefined;
      
      if (selectedCountries.length > 1) {
        const baselineId = selectedCountries[0].id;
        if (country.id !== baselineId) {
          const baselineValue = countryLatest[baselineId]?.value;
          if (typeof value === 'number' && typeof baselineValue === 'number') {
            absoluteDelta = value - baselineValue;
            if (baselineValue === 0) {
              percentageDelta = null; // Use null to indicate N/A
            } else {
              percentageDelta = ((value - baselineValue) / baselineValue) * 100;
            }
          }
        }
      }
      
      let histAbsoluteDelta = undefined;
      let histPercentageDelta = undefined;
      const startValue = countryLatest[country.id]?.startValue;
      
      if (startYear !== null && typeof value === 'number' && typeof startValue === 'number') {
        histAbsoluteDelta = value - startValue;
        if (startValue === 0) {
          histPercentageDelta = null;
        } else {
          histPercentageDelta = ((value - startValue) / startValue) * 100;
        }
      }
      
      resolvedData[metric.id][country.id] = { value, year, rank, absoluteDelta, percentageDelta, histAbsoluteDelta, histPercentageDelta, startValue };
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
          <CompareSelector 
            selectedIds={limitedIds} 
            countries={allCountries} 
            selectedMetrics={metricIds} 
            metrics={allMetrics}
            availableYears={sortedYears}
            currentStartYear={startYear}
            currentEndYear={endYear}
          />
        </Suspense>
      </div>

      {selectedCountries.length > 0 ? (
        <div className="space-y-12">
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4 font-medium text-muted-foreground w-1/4">Indicator {endYear ? `(${endYear})` : '(Latest)'}</th>
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
                      const isRate = metric.format_type === 'percentage' || metric.unit === '%';
                      
                      let deltaColorClass = "text-muted-foreground font-medium";
                      let pctColorClass = "text-muted-foreground";
                      if (data.absoluteDelta > 0) {
                        deltaColorClass = metric.is_higher_better ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium";
                        pctColorClass = metric.is_higher_better ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
                      } else if (data.absoluteDelta < 0) {
                        deltaColorClass = metric.is_higher_better ? "text-red-600 dark:text-red-400 font-medium" : "text-green-600 dark:text-green-400 font-medium";
                        pctColorClass = metric.is_higher_better ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400";
                      }

                      let histDeltaColorClass = "text-muted-foreground font-medium";
                      let histPctColorClass = "text-muted-foreground";
                      if (data.histAbsoluteDelta > 0) {
                        histDeltaColorClass = metric.is_higher_better ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium";
                        histPctColorClass = metric.is_higher_better ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
                      } else if (data.histAbsoluteDelta < 0) {
                        histDeltaColorClass = metric.is_higher_better ? "text-red-600 dark:text-red-400 font-medium" : "text-green-600 dark:text-green-400 font-medium";
                        histPctColorClass = metric.is_higher_better ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400";
                      }

                      return (
                        <td key={`${country.id}-${metric.id}`} className="p-4 align-top">
                          {data.value !== null ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-base">{formatMetricValue(data.value, metric)}</span>
                              
                              {country.id !== selectedCountries[0].id && selectedCountries.length > 1 && (
                                <div className="text-xs mt-0.5">
                                  {data.absoluteDelta !== undefined ? (
                                    <>
                                      <span className={deltaColorClass}>
                                        {data.absoluteDelta > 0 ? "+" : ""}
                                        {isRate ? `${data.absoluteDelta.toLocaleString(undefined, { maximumFractionDigits: 2 })} pp` : formatMetricValue(data.absoluteDelta, metric)}
                                      </span>
                                      {!isRate && data.percentageDelta !== null ? (
                                        <span className={`ml-1 ${pctColorClass}`}>
                                          ({data.percentageDelta > 0 ? "+" : ""}{data.percentageDelta.toFixed(1)}%)
                                        </span>
                                      ) : (!isRate && (
                                        <span className="ml-1 text-muted-foreground">(N/A)</span>
                                      ))}
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground">(N/A)</span>
                                  )}
                                </div>
                              )}
                              {startYear !== null && (
                                <div className="text-xs mt-2 border-t pt-2 border-muted/50">
                                  <div className="text-muted-foreground mb-0.5">vs {startYear}:</div>
                                  {data.startValue !== null && data.value !== null ? (
                                    <div>
                                      <span className={histDeltaColorClass}>
                                        {data.histAbsoluteDelta > 0 ? "+" : ""}
                                        {formatMetricValue(data.histAbsoluteDelta, metric, true)}
                                        {isRate && " pp"}
                                      </span>
                                      {data.histPercentageDelta !== null ? (
                                        !isRate && (
                                          <span className={`ml-1 ${histPctColorClass}`}>
                                            ({data.histPercentageDelta > 0 ? "+" : ""}
                                            {data.histPercentageDelta.toLocaleString(undefined, { maximumFractionDigits: 2 })}%)
                                          </span>
                                        )
                                      ) : (!isRate && (
                                        <span className="ml-1 text-muted-foreground">(N/A)</span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">(N/A)</span>
                                  )}
                                </div>
                              )}
                              
                              <span className="text-xs text-muted-foreground mt-2 inline-block">Year: {data.year}</span>
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
                let chartPoints = chartData?.data || [];
                
                if (startYear !== null || endYear !== null) {
                  chartPoints = chartPoints.filter(p => {
                    const yr = Number(p.year);
                    if (startYear !== null && yr < startYear) return false;
                    if (endYear !== null && yr > endYear) return false;
                    return true;
                  });
                }
                
                return (
                  <div key={`chart-${metric.id}`} className="border rounded-lg p-6 bg-card shadow-sm min-w-0">
                    <h3 className="text-lg font-semibold mb-1">{metric.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{metric.description} ({metric.unit})</p>
                    <ComparisonChart 
                      data={chartPoints} 
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
