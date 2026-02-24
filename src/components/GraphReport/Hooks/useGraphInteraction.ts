import { useCallback, useMemo, useState } from 'react';
import type { GraphReportFieldMapping, GraphReportInteractionState, GraphRow } from '../types';

const toComparable = (value: unknown) => String(value ?? '').trim();

export interface UseGraphInteractionResult {
  filters: GraphReportInteractionState;
  setFilter: (field: keyof GraphReportInteractionState, value?: string) => void;
  clearFilter: (field: keyof GraphReportInteractionState) => void;
  clearAll: () => void;
  hasActiveFilters: boolean;
  applyRows: (rows: GraphRow[], fieldMapping: GraphReportFieldMapping) => GraphRow[];
}

export const useGraphInteraction = (
  initialFilters: GraphReportInteractionState = {},
): UseGraphInteractionResult => {
  const [filters, setFilters] = useState<GraphReportInteractionState>(initialFilters);

  const setFilter = useCallback((field: keyof GraphReportInteractionState, value?: string) => {
    setFilters((prev) => {
      const nextValue = value?.trim();
      if (!nextValue) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      if (prev[field] === nextValue) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: nextValue };
    });
  }, []);

  const clearFilter = useCallback((field: keyof GraphReportInteractionState) => {
    setFilters((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = useMemo(
    () => Boolean(filters.primaryDimension || filters.secondaryDimension || filters.status),
    [filters],
  );

  const applyRows = useCallback(
    (rows: GraphRow[], fieldMapping: GraphReportFieldMapping): GraphRow[] => {
      return rows.filter((row) => {
        if (filters.primaryDimension) {
          if (toComparable(row[fieldMapping.primaryDimension]) !== toComparable(filters.primaryDimension)) {
            return false;
          }
        }
        if (filters.secondaryDimension) {
          if (toComparable(row[fieldMapping.secondaryDimension]) !== toComparable(filters.secondaryDimension)) {
            return false;
          }
        }
        if (filters.status) {
          if (toComparable(row[fieldMapping.status]) !== toComparable(filters.status)) {
            return false;
          }
        }
        return true;
      });
    },
    [filters],
  );

  return {
    filters,
    setFilter,
    clearFilter,
    clearAll,
    hasActiveFilters,
    applyRows,
  };
};
