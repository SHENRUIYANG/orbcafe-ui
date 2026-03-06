import type React from 'react';

export type PivotAggregation = 'sum' | 'count' | 'avg' | 'min' | 'max';

export type PivotFieldType = 'string' | 'number' | 'date' | 'boolean';

export interface PivotFieldDefinition {
  id: string;
  label: string;
  type?: PivotFieldType;
  aggregations?: PivotAggregation[];
  formatValue?: (value: number) => string;
}

export interface PivotValueFieldConfig {
  fieldId: string;
  aggregation?: PivotAggregation;
}

export interface PivotValueFieldState {
  tokenId: string;
  fieldId: string;
  aggregation: PivotAggregation;
}

export interface PivotLayoutConfig {
  rows?: string[];
  columns?: string[];
  filters?: string[];
  values?: PivotValueFieldConfig[];
}

export type PivotFilterSelections = Record<string, string[]>;

export interface PivotTableModel {
  rowFields: string[];
  setRowFields: React.Dispatch<React.SetStateAction<string[]>>;
  columnFields: string[];
  setColumnFields: React.Dispatch<React.SetStateAction<string[]>>;
  filterFields: string[];
  setFilterFields: React.Dispatch<React.SetStateAction<string[]>>;
  valueFields: PivotValueFieldState[];
  setValueFields: React.Dispatch<React.SetStateAction<PivotValueFieldState[]>>;
  filterSelections: PivotFilterSelections;
  setFilterSelections: React.Dispatch<React.SetStateAction<PivotFilterSelections>>;
  showGrandTotal: boolean;
  setShowGrandTotal: React.Dispatch<React.SetStateAction<boolean>>;
  isConfiguratorCollapsed: boolean;
  setIsConfiguratorCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface CPivotTableProps {
  title?: string;
  rows: Record<string, unknown>[];
  fields: PivotFieldDefinition[];
  initialLayout?: PivotLayoutConfig;
  emptyText?: string;
  maxPreviewHeight?: number | string;
  model?: PivotTableModel;
}
