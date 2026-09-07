"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const REGIONS = [
  "all",
  "Asia",
  "Europe",
  "Africa",
  "Americas",
  "Oceania"
];

export function RegionFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentRegion = searchParams.get("region") || "all";

  const onRegionChange = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("region");
    } else {
      params.set("region", value);
    }
    // Reset limit on filter change
    params.delete("limit");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Region:</span>
      <Select value={currentRegion} onValueChange={onRegionChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Regions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Regions</SelectItem>
          {REGIONS.filter(r => r !== "all").map(r => (
            <SelectItem key={r} value={r}>{r}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ShowMoreButton({ currentLimit, totalAvailable }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // If we already show all available (or more), don't show the button
  if (totalAvailable <= currentLimit) return null;

  const handleShowMore = () => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", (currentLimit + 50).toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex justify-center p-4">
      <Button variant="outline" onClick={handleShowMore}>
        Show More
      </Button>
    </div>
  );
}

