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

export default function CompareSelector({ selectedIds = [], countries = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  // Available countries are those not already selected
  const availableCountries = countries.filter((c) => !selectedIds.includes(c.id));

  const addCountry = (id) => {
    if (selectedIds.length >= 4) return;
    
    const newIds = [...selectedIds, id];
    const params = new URLSearchParams(searchParams);
    params.set("countries", newIds.join(","));
    
    setOpen(false);
    router.push(`/compare?${params.toString()}`);
  };

  const removeCountry = (id) => {
    const newIds = selectedIds.filter((cid) => cid !== id);
    const params = new URLSearchParams(searchParams);
    
    if (newIds.length > 0) {
      params.set("countries", newIds.join(","));
    } else {
      params.delete("countries");
    }
    
    router.push(`/compare?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id) => {
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
        </div>
      )}

      {selectedIds.length < 4 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            role="combobox"
            aria-expanded={open}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full md:w-75 justify-between"
            )}
          >
            Add country to compare...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-75 p-0">
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

      {selectedIds.length >= 4 && (
        <p className="text-sm text-muted-foreground">
          Maximum of 4 countries can be compared at once.
        </p>
      )}
    </div>
  );
}
