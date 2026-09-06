import { Suspense } from "react";
import { getRankingsByMetric, getMetricById } from "@/lib/data/metrics";
import IndicatorSelector from "@/components/globiq/indicator-selector";
import Link from "next/link";

export default async function RankingsPage({ searchParams }) {
  const params = await searchParams;
  // Default to population if no indicator specified
  const indicatorId = params.indicator || "population";
  
  const indicator = await getMetricById(indicatorId);
  const rankings = await getRankingsByMetric(indicatorId);
  const metrics = await import("@/lib/data/metrics").then(m => m.getMetrics());

  return (
    <div className="container px-4 py-8 md:py-12 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Global Rankings</h1>
        <p className="text-muted-foreground max-w-3xl">
          Compare all countries across specific metrics. Select an indicator below to view its global ranking.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <Suspense fallback={<div className="h-10 w-70 animate-pulse bg-muted rounded"></div>}>
            <IndicatorSelector currentIndicator={indicatorId} metrics={metrics} />
          </Suspense>
        </div>
      </div>

      {indicator ? (
        <div className="rounded-md border">
          <div className="p-4 bg-muted/50 border-b">
            <h2 className="text-xl font-semibold">{indicator.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{indicator.description}</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background border-b">
                <tr>
                  <th className="p-4 font-medium text-muted-foreground w-16 text-center">#</th>
                  <th className="p-4 font-medium text-muted-foreground">Country</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">{indicator.unit || "Value"}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rankings.map((item, index) => (
                  <tr key={item.country.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-center text-muted-foreground">{index + 1}</td>
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.country.flag}</span>
                        <Link href={`/country/${item.country.id}`} className="hover:underline">
                          {item.country.name}
                        </Link>
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {item.formattedValue}
                    </td>
                  </tr>
                ))}
                {rankings.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted-foreground">
                      No data available for this indicator.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center border rounded-md bg-muted/20">
          <p className="text-muted-foreground">Indicator not found. Please select a valid indicator.</p>
        </div>
      )}
    </div>
  );
}
