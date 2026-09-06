"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function IndicatorSelector({ currentIndicator, metrics = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onSelect = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("indicator", value);
    router.push(`/rankings?${params.toString()}`);
  };

  return (
    <Select value={currentIndicator} onValueChange={onSelect}>
      <SelectTrigger className="w-full md:w-70">
        <SelectValue placeholder="Select an indicator" />
      </SelectTrigger>
      <SelectContent>
        {metrics.map((indicator) => (
          <SelectItem key={indicator.id} value={indicator.id}>
            {indicator.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
