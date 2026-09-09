"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function CompareSelector({ selectedIds = [], countries = [], selectedMetrics = [], metrics = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openCountry, setOpenCountry] = useState(false);
  const [openMetric, setOpenMetric] = useState(false);

  // Available countries are those not already selected
  const availableCountries = countries.filter((c) => !selectedIds.includes(c.id));
  const availableMetrics = metrics.filter((m) => !selectedMetrics.includes(m.id));

  const updateUrl = (newCountryIds, newMetricIds) => {
    const params = new URLSearchParams(searchParams);
    
    if (newCountryIds.length > 0) {
      params.set("countries", newCountryIds.join(","));
    } else {
      params.delete("countries");
    }
    
    if (newMetricIds.length > 0) {
      params.set("metrics", newMetricIds.join(","));
    } else {
      params.delete("metrics");
    }
    
    router.push(`/compare?${params.toString()}`);
  };

  const addCountry = (id) => {
    if (selectedIds.length >= 4) return;
    setOpenCountry(false);
    updateUrl([...selectedIds, id], selectedMetrics);
  };

  const removeCountry = (id) => {
    updateUrl(selectedIds.filter((cid) => cid !== id), selectedMetrics);
  };

  const addMetric = (id) => {
    setOpenMetric(false);
    updateUrl(selectedIds, [...selectedMetrics, id]);
  };

  const removeMetric = (id) => {
    updateUrl(selectedIds, selectedMetrics.filter((mid) => mid !== id));
  };

  const clearMetrics = () => {
    updateUrl(selectedIds, []);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Countries Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Countries (Max 4)</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && selectedIds.map((id) => {
            const country = countries.find((c) => c.id === id);
            if (!country) return null;
            return (
              <div key={id} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <button
                  onClick={() => removeCountry(id)}
                  className="ml-1 hover:text-destructive focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          
          {selectedIds.length < 4 && (
            <Popover open={openCountry} onOpenChange={setOpenCountry}>
              <PopoverTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 border-dashed")}>
                Add Country...
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-75 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {availableCountries.map((country) => (
                        <CommandItem
                          key={country.id}
                          value={country.name}
                          onSelect={() => addCountry(country.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedIds.includes(country.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="mr-2">{country.flag}</span>
                          {country.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Metrics Section */}
      <div className="flex flex-col gap-3 pt-4 border-t">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Compare specific metrics (optional)</h3>
          {selectedMetrics.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearMetrics} className="h-8 text-xs text-muted-foreground">
              Clear All Metrics
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedMetrics.length > 0 ? (
            selectedMetrics.map((id) => {
              const metric = metrics.find((m) => m.id === id);
              if (!metric) return null;
              return (
                <div key={id} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  <span>{metric.name}</span>
                  <button
                    onClick={() => removeMetric(id)}
                    className="ml-1 hover:text-destructive focus:outline-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-muted-foreground italic mr-2">
              Showing all available metrics.
            </div>
          )}

          <Popover open={openMetric} onOpenChange={setOpenMetric}>
            <PopoverTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 border-dashed")}>
              Add Metric...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search metrics..." />
                <CommandList>
                  <CommandEmpty>No metric found.</CommandEmpty>
                  <CommandGroup>
                    {availableMetrics.map((metric) => (
                      <CommandItem
                        key={metric.id}
                        value={metric.name}
                        onSelect={() => addMetric(metric.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedMetrics.includes(metric.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {metric.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
