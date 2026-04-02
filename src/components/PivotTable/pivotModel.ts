import type { PivotAggregation } from './types';

export const ALL_ZONES = ['palette', 'rows', 'columns', 'filters', 'values'] as const;

export type PivotZone = (typeof ALL_ZONES)[number];
export type AxisZone = Exclude<PivotZone, 'palette' | 'values'>;

export interface ValueZoneItem {
  tokenId: string;
  fieldId: string;
  aggregation: PivotAggregation;
}

export interface ParsedDnDIdentifier {
  kind: 'container' | 'item';
  zone: PivotZone;
  key?: string;
}

export interface PivotDataColumn {
  id: string;
  colKey: string;
  valueItem: ValueZoneItem;
  label: string;
}

export interface PivotColumnTreeNode {
  key: string;
  label: string;
  children: PivotColumnTreeNode[];
  leafColumnIds: string[];
  path: string[];
  depth: number;
}

export interface PivotTreeNode {
  key: string;
  value: string;
  fieldId?: string;
  children: PivotTreeNode[];
  isLeaf: boolean;
  isGrandTotal?: boolean;
  aggregatedValues: Record<string, number>;
  path: string[];
  depth: number;
}

export interface PivotPreview {
  dataColumns: PivotDataColumn[];
  columnTree: PivotColumnTreeNode[];
  rowTree: PivotTreeNode[];
}
