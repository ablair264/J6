/**
 * Canonical chart point contract used across all chart-based cards.
 */
export interface ChartDataPoint {
  /** X-axis label (date, category, bucket name, etc.). */
  name: string;
  /** Numeric value rendered on the chart Y-axis. */
  value: number;
}

/**
 * Lightweight adapter to map provider rows into `ChartDataPoint[]`.
 */
export function mapRowsToChartData<T>(
  rows: T[],
  getName: (row: T) => string,
  getValue: (row: T) => number,
): ChartDataPoint[] {
  return rows.map((row) => ({
    name: getName(row),
    value: getValue(row),
  }));
}
