"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CSVExportButton({ data, filename, columns }) {
  const handleDownload = () => {
    if (!data || data.length === 0) return;

    // Build header row
    const headerRow = columns.map(col => `"${col.label}"`).join(",");
    
    // Build data rows
    const dataRows = data.map(item => {
      return columns.map(col => {
        let val = item[col.key || col.value];
        // Escape quotes
        val = val !== null && val !== undefined ? String(val).replace(/"/g, '""') : "";
        return `"${val}"`;
      }).join(",");
    });

    const csvContent = [headerRow, ...dataRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload} disabled={!data || data.length === 0}>
      <Download className="w-4 h-4" />
      Export CSV
    </Button>
  );
}
