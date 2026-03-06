import type { PivotAggregation, PivotFieldDefinition } from './types';
import { ALL_ZONES, type PivotZone, type AxisZone, type ParsedDnDIdentifier, type ValueZoneItem } from './pivotModel';
import { DEFAULT_ALLOWED_AGGREGATIONS, EMPTY_VALUE_LABEL } from './pivotConstants';

export const isPivotZone = (value: string): value is PivotZone =>
  (ALL_ZONES as readonly string[]).includes(value);

export const isAxisZone = (zone: PivotZone): zone is AxisZone =>
  zone === 'rows' || zone === 'columns' || zone === 'filters';

export const parseDnDIdentifier = (raw: string): ParsedDnDIdentifier | null => {
  const parts = raw.split('|');
  if (parts.length === 2 && parts[0] === 'container' && isPivotZone(parts[1])) {
    return { kind: 'container', zone: parts[1] };
  }
  if (parts.length === 3 && parts[0] === 'item' && isPivotZone(parts[1]) && parts[2]) {
    return { kind: 'item', zone: parts[1], key: parts[2] };
  }
  return null;
};

export const normalizeDimensionValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return EMPTY_VALUE_LABEL;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value);
};

export const encodeTupleKey = (values: string[]): string => JSON.stringify(values);

export const tupleCompare = (a: string[], b: string[]): number => {
  const left = a.join('\u0001');
  const right = b.join('\u0001');
  return left.localeCompare(right, undefined, { sensitivity: 'base' });
};

const parseNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const aggregateRows = (rows: Record<string, unknown>[], fieldId: string, aggregation: PivotAggregation): number => {
  if (aggregation === 'count') {
    return rows.length;
  }

  const values = rows
    .map((row) => parseNumber(row[fieldId]))
    .filter((value): value is number => value !== null);

  if (values.length === 0) {
    return 0;
  }

  if (aggregation === 'sum') {
    return values.reduce((acc, value) => acc + value, 0);
  }
  if (aggregation === 'avg') {
    return values.reduce((acc, value) => acc + value, 0) / values.length;
  }
  if (aggregation === 'min') {
    return Math.min(...values);
  }
  return Math.max(...values);
};

export const sanitizeAxisFields = (input: string[] | undefined, validSet: Set<string>): string[] => {
  if (!input || input.length === 0) {
    return [];
  }
  const seen = new Set<string>();
  const result: string[] = [];
  input.forEach((fieldId) => {
    if (!validSet.has(fieldId) || seen.has(fieldId)) {
      return;
    }
    seen.add(fieldId);
    result.push(fieldId);
  });
  return result;
};

export const arraysEqual = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => value === right[index]);
};

export const recordsEqual = (left: Record<string, string[]>, right: Record<string, string[]>): boolean => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  return leftKeys.every((key) => {
    const a = left[key] ?? [];
    const b = right[key] ?? [];
    return arraysEqual(a, b);
  });
};

export const valueItemsEqual = (left: ValueZoneItem[], right: ValueZoneItem[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((item, index) => {
    const target = right[index];
    return item.tokenId === target.tokenId && item.fieldId === target.fieldId && item.aggregation === target.aggregation;
  });
};

export const getAllowedAggregations = (field: PivotFieldDefinition | undefined): PivotAggregation[] => {
  if (!field?.aggregations || field.aggregations.length === 0) {
    return DEFAULT_ALLOWED_AGGREGATIONS;
  }
  return field.aggregations;
};

export const normalizeAggregation = (
  requested: PivotAggregation | undefined,
  field: PivotFieldDefinition | undefined,
): PivotAggregation => {
  const allowed = getAllowedAggregations(field);
  if (requested && allowed.includes(requested)) {
    return requested;
  }
  if (field?.type === 'number' && allowed.includes('sum')) {
    return 'sum';
  }
  if (allowed.includes('count')) {
    return 'count';
  }
  return allowed[0];
};

export const formatAggregatedValue = (
  value: number,
  valueItem: ValueZoneItem,
  fieldMap: Map<string, PivotFieldDefinition>,
): string => {
  const field = fieldMap.get(valueItem.fieldId);
  if (field?.formatValue) {
    return field.formatValue(value);
  }
  if (valueItem.aggregation === 'count') {
    return Math.round(value).toLocaleString();
  }
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};
