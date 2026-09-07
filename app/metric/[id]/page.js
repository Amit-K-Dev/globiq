import { notFound } from "next/navigation";
import { getMetricById, getRankingsByMetric, getHistoricalTrendByMetric } from "@/lib/data/metrics";
import MetricHeader from "@/components/globiq/metric-header";
import MetricViewTabs from "@/components/globiq/metric-view-tabs";
import MetricRankingsPreview from "@/components/globiq/metric-rankings-preview";

export async function generateMetadata({ params }) {
  const p = await params;
  const metric = await getMetricById(p.id);
  if (!metric) return { title: 'Not Found' };
  
  return {
    title: `${metric.name} Data & Rankings | GLOBIQ`,
    description: metric.description,
  };
}

export default async function MetricPage({ params }) {
  const p = await params;
  const metric = await getMetricById(p.id);
  
  if (!metric) {
    notFound();
  }

  // Fetch trend and rankings in parallel
  const [trendData, rankings] = await Promise.all([
    getHistoricalTrendByMetric(metric.id, 5),
    getRankingsByMetric(metric.id)
  ]);

  const mapData = rankings.map(r => ({
    country_name: r.country.name,
    value: r.country[metric.id === 'gdp-growth' ? 'gdpGrowth' : metric.id]
  }));

  return (
    <div className="container px-4 py-8 md:py-12 mx-auto max-w-7xl animate-in fade-in duration-500">
      <MetricHeader metric={metric} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-8">
          <MetricViewTabs trendData={trendData} mapData={mapData} metric={metric} />
          
          <div className="bg-muted/10 rounded-xl p-6 border text-sm text-muted-foreground leading-relaxed">
            <h3 className="font-semibold text-foreground mb-2 text-base">About this metric</h3>
            <p className="mb-4">
              This data represents the {metric.description.toLowerCase()} across global nations. 
              Values are measured in {metric.unit || metric.format_type}. 
              Monitoring {metric.name.toLowerCase()} is crucial for understanding global trends and comparing international performance.
            </p>
            <p>
              Source: <strong>World Bank</strong> (2021-2023). Data is subject to periodic revisions.
            </p>
          </div>
        </div>
        
        <div className="xl:col-span-1">
          {rankings.length > 0 ? (
            <MetricRankingsPreview rankings={rankings} metric={metric} />
          ) : (
            <div className="p-12 text-center bg-muted/20 rounded-xl border border-dashed">
              <p className="text-muted-foreground">Ranking data not available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
