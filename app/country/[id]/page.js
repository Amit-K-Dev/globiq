import { getCountries, getCountryWithLatestMetrics } from "@/lib/data/countries";
import { formatMetricValue, getMetrics } from "@/lib/data/metrics";
import { getHistoricalDataForCountry } from "@/lib/data/values";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function MiniChart({ data, metric }) {
  if (!data || data.length === 0) return null;
  const startYear = Math.min(...data.map(d => d.year));
  const endYear = Math.max(...data.map(d => d.year));
  
  const fullData = [];
  for (let y = startYear; y <= endYear; y++) {
    const point = data.find(d => d.year === y);
    fullData.push(point || { year: y, value: null });
  }

  const values = data.map(d => d.value);
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const range = Math.max(max - min, 1);
  const zeroLinePct = (Math.abs(min) / range) * 100;

  return (
    <div className="flex items-stretch gap-1 h-16 mt-4 relative border-b">
      {min < 0 && (
        <div 
          className="absolute left-0 right-0 border-t border-dashed border-muted-foreground/30 pointer-events-none"
          style={{ bottom: `${zeroLinePct}%` }}
        />
      )}
      
      {fullData.map(point => {
        if (point.value === null) {
          return <div key={point.year} className="flex-1 opacity-0" />;
        }
        
        const isNegative = point.value < 0;
        const heightPct = (Math.abs(point.value) / range) * 100;
        const minHeight = Math.max(heightPct, 2);

        return (
          <div key={point.year} className="flex-1 relative group">
            <div 
              className={`absolute w-full rounded-sm transition-colors ${isNegative ? 'bg-destructive/50 group-hover:bg-destructive' : 'bg-primary/50 group-hover:bg-primary'}`} 
              style={{ 
                height: `${minHeight}%`,
                ...(isNegative 
                  ? { top: `${100 - zeroLinePct}%` } 
                  : { bottom: `${zeroLinePct}%` }
                )
              }}
            />
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 shadow-sm border">
              {point.year}: {formatMetricValue(point.value, metric)}
            </div>
            <div className="absolute inset-0 z-0 cursor-crosshair" />
          </div>
        );
      })}
    </div>
  );
}

export async function generateStaticParams() {
  const allCountries = await getCountries();
  return allCountries.map((c) => ({
    id: c.id,
  }));
}

export default async function CountryPage({ params }) {
  const p = await params;
  const country = await getCountryWithLatestMetrics(p.id);

  if (!country) {
    notFound();
  }

  const allMetrics = await getMetrics();
  const historicalData = await getHistoricalDataForCountry(p.id);

  const stats = allMetrics.map((metric) => ({
    metric: metric,
    label: metric.name,
    value: formatMetricValue(country[metric.id], metric),
    history: historicalData[metric.id] || []
  }));

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
          <Card key={i} className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex justify-between">
                <span>{stat.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="text-3xl font-bold">{stat.value}</div>
              <MiniChart data={stat.history} metric={stat.metric} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
