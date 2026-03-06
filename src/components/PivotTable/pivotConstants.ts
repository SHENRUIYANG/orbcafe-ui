import type { AxisZone } from './pivotModel';
import type { PivotAggregation } from './types';

export const EMPTY_VALUE_LABEL = '(blank)';
export const ROW_RESULT_LABEL = 'Result';
export const GRAND_TOTAL_LABEL = 'Grand Total';

export const AGGREGATION_LABEL: Record<PivotAggregation, string> = {
  sum: 'Sum',
  count: 'Count',
  avg: 'Average',
  min: 'Min',
  max: 'Max',
};

export const DEFAULT_ALLOWED_AGGREGATIONS: PivotAggregation[] = ['sum', 'count', 'avg', 'min', 'max'];

export const zoneTitleMap: Record<AxisZone | 'values', string> = {
  rows: 'Rows',
  columns: 'Columns',
  filters: 'Filters',
  values: 'Values',
};

export const zoneHintMap: Record<AxisZone | 'values', string> = {
  rows: 'Drag fields here to build row hierarchy',
  columns: 'Drag fields here to build column hierarchy',
  filters: 'Drag fields here for report filters',
  values: 'Drag numeric fields here for aggregation',
};
