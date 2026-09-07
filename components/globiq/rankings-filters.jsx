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
        <SelectTrigger className="w-36 md:w-44">
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

const INCOME_GROUPS = [
  "High income",
  "Upper middle income",
  "Lower middle income",
  "Low income",
  "Not classified"
];

export function IncomeGroupFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentGroup = searchParams.get("incomeGroup") || "all";

  const onGroupChange = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("incomeGroup");
    } else {
      params.set("incomeGroup", value);
    }
    params.delete("limit");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Income:</span>
      <Select value={currentGroup} onValueChange={onGroupChange}>
        <SelectTrigger className="w-36 md:w-44">
          <SelectValue placeholder="All Incomes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Incomes</SelectItem>
          {INCOME_GROUPS.map(g => (
            <SelectItem key={g} value={g}>{g}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const YEARS = ["2023", "2022", "2021"];

export function YearFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentYear = searchParams.get("year") || "2023";

  const onYearChange = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value === "2023") {
      params.delete("year");
    } else {
      params.set("year", value);
    }
    params.delete("limit");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Year:</span>
      <Select value={currentYear} onValueChange={onYearChange}>
        <SelectTrigger className="w-24 md:w-32">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map(y => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
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

