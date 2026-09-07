export function formatMetricValue(value, metric) {
  if (value === undefined || value === null) return "N/A";
  if (!metric) return value.toString();

  if (metric.format_type === "currency") {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    return `$${value.toLocaleString()}`;
  }
  if (metric.format_type === "percentage") {
    return `${value > 0 ? '+' : ''}${value}%`;
  }
  if (metric.format_type === "number") {
    let numStr = "";
    if (value >= 1e9) numStr = `${(value / 1e9).toFixed(2)}B`;
    else if (value >= 1e6) numStr = `${(value / 1e6).toFixed(2)}M`;
    else numStr = value.toLocaleString();
    return metric.unit ? `${numStr} ${metric.unit}` : numStr;
  }
  return value.toString();
}
