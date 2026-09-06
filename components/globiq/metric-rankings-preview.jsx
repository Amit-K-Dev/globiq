import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function MetricRankingsPreview({ rankings, metric }) {
  // Show top 10
  const previewRankings = rankings.slice(0, 10);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Top Countries</CardTitle>
        <CardDescription>Latest rankings for {metric.name}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="space-y-1">
          {previewRankings.map((r, i) => (
            <Link 
              key={r.country.id} 
              href={`/country/${r.country.id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-5 text-sm font-medium text-right">{i + 1}.</span>
                <span className="text-xl">{r.country.flag}</span>
                <span className="font-medium group-hover:text-primary transition-colors">{r.country.name}</span>
              </div>
              <span className="font-semibold text-sm sm:text-base">{r.formattedValue}</span>
            </Link>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <Link 
          href={`/rankings?indicator=${metric.id}`}
          className="w-full flex items-center justify-center py-2 text-sm text-primary font-medium hover:underline"
        >
          View Full Rankings
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
