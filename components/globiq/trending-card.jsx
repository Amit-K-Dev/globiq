import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TrendingCard({ title, value, trend, trendValue, isPositive, href }) {
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:bg-muted/50 border-border">
        <CardHeader className="pb-2">
          <Badge variant="secondary" className="w-fit mb-2">Trending</Badge>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          <div className="flex items-center text-sm mt-2 text-muted-foreground">
            <span className={`flex items-center mr-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              <TrendIcon className="mr-1 h-4 w-4" />
              {trend}
            </span>
            {trendValue}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
