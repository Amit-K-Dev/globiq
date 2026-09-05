import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CountryCard({ name, flag, region, population, gdp, href }) {
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:bg-muted/50 border-border group overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-2xl shadow-sm">
            {flag}
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-lg">{name}</CardTitle>
            <span className="text-sm text-muted-foreground">{region}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Population</span>
              <span className="font-medium">{population}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">GDP</span>
              <span className="font-medium">{gdp}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
