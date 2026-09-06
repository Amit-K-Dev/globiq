import { Card, CardContent } from "@/components/ui/card";
import { Landmark, Users, Leaf, Globe } from "lucide-react";

const categoryIconMap = {
  economy: Landmark,
  population: Users,
  environment: Leaf,
};

export default function MetricHeader({ metric }) {
  const Icon = categoryIconMap[metric.category_id] || Globe;

  return (
    <Card className="mb-8 overflow-hidden border-none shadow-md bg-linear-to-br from-card to-muted/20">
      <CardContent className="p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            {metric.name}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            {metric.description}
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5 bg-background/50 px-3 py-1 rounded-full border">
              Unit: {metric.unit}
            </span>
            <span className="flex items-center gap-1.5 bg-background/50 px-3 py-1 rounded-full border">
              Category: <span className="capitalize">{metric.category_id}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
