import type { ValueZoneItem } from '../pivotModel';
import type { PivotFieldDefinition } from '../types';
import { aggregateRows, normalizeDimensionValue } from '../pivotUtils';

export interface PivotChartDimensionOption {
  fieldId: string;
  label: string;
  zone: 'rows' | 'columns';
}

export interface PivotChartValueOption {
  fieldId: string;
  label: string;
  item: ValueZoneItem;
  field?: PivotFieldDefinition;
}

export interface PivotChartDatum {
  name: string;
  primaryValue: number;
  secondaryValue?: number;
}

export const buildPivotChartDimensionOptions = (
  rowFields: string[],
  columnFields: string[],
  fieldMap: Map<string, PivotFieldDefinition>,
): PivotChartDimensionOption[] => {
  const seen = new Set<string>();
  const options: PivotChartDimensionOption[] = [];

  rowFields.forEach((fieldId) => {
    if (seen.has(fieldId)) {
      return;
    }
    seen.add(fieldId);
    options.push({
      fieldId,
      label: fieldMap.get(fieldId)?.label ?? fieldId,
      zone: 'rows',
    });
  });

  columnFields.forEach((fieldId) => {
    if (seen.has(fieldId)) {
      return;
    }
    seen.add(fieldId);
    options.push({
      fieldId,
      label: fieldMap.get(fieldId)?.label ?? fieldId,
      zone: 'columns',
    });
  });

  return options;
};

export const buildPivotChartValueOptions = (
  valueFields: ValueZoneItem[],
  fieldMap: Map<string, PivotFieldDefinition>,
  getAggregationLabel: (aggregation: ValueZoneItem['aggregation']) => string,
): PivotChartValueOption[] =>
  valueFields.map((item) => {
    const field = fieldMap.get(item.fieldId);
    const fieldLabel = field?.label ?? item.fieldId;
    return {
      fieldId: item.fieldId,
      label: `${getAggregationLabel(item.aggregation)} · ${fieldLabel}`,
      item,
      field,
    };
  });

export const buildPivotChartData = ({
  rows,
  dimensionFieldId,
  primaryValue,
  secondaryValue,
}: {
  rows: Record<string, unknown>[];
  dimensionFieldId: string;
  primaryValue: ValueZoneItem;
  secondaryValue?: ValueZoneItem | null;
}): PivotChartDatum[] => {
  if (!dimensionFieldId) {
    return [];
  }

  const groupedRows = new Map<string, Record<string, unknown>[]>();

  rows.forEach((row) => {
    const key = normalizeDimensionValue(row[dimensionFieldId]);
    const bucket = groupedRows.get(key);
    if (bucket) {
      bucket.push(row);
      return;
    }
    groupedRows.set(key, [row]);
  });

  return Array.from(groupedRows.entries())
    .sort((left, right) => left[0].localeCompare(right[0], undefined, { sensitivity: 'base' }))
    .map(([name, bucket]) => ({
      name,
      primaryValue: aggregateRows(bucket, primaryValue.fieldId, primaryValue.aggregation),
      secondaryValue: secondaryValue
        ? aggregateRows(bucket, secondaryValue.fieldId, secondaryValue.aggregation)
        : undefined,
    }));
};
