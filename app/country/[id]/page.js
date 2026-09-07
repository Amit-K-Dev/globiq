import { getCountries, getCountryWithLatestMetrics } from "@/lib/data/countries";
import { getMetrics } from "@/lib/data/metrics";
import { formatMetricValue } from "@/lib/utils/format";
import { getHistoricalDataForCountry } from "@/lib/data/values";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CSVExportButton from "@/components/globiq/csv-export-button";

import CountryHistoryChart from "@/components/globiq/country-history-chart";

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

  const csvData = stats.map(stat => ({
    metric: stat.label,
    value: stat.value,
    unit: stat.metric.unit || stat.metric.format_type,
  }));

  const csvColumns = [
    { label: "Metric", key: "metric" },
    { label: "Value", key: "value" },
    { label: "Unit", key: "unit" },
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
        <div className="flex flex-col sm:flex-row gap-3">
          <CSVExportButton 
            data={csvData} 
            filename={`${country.name.toLowerCase().replace(/\s+/g, '-')}-data`} 
            columns={csvColumns} 
          />
          <Link href={`/compare?countries=${country.id}`} className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Compare
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <Card key={i} className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex justify-between">
                <span>{stat.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CountryHistoryChart stats={stats} />
    </div>
  );
}
