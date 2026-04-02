import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  PivotAggregation,
  PivotChartType,
  PivotFieldDefinition,
  PivotFilterSelections,
  PivotLayoutConfig,
  PivotTableModel,
  PivotValueFieldConfig,
  PivotValueFieldState,
} from '../types';
import { arraysEqual, normalizeAggregation, sanitizeAxisFields, valueItemsEqual } from '../pivotUtils';

export interface UsePivotTableOptions {
  fields: PivotFieldDefinition[];
  initialLayout?: PivotLayoutConfig;
  initialFilterSelections?: PivotFilterSelections;
  initialShowGrandTotal?: boolean;
  initialConfiguratorCollapsed?: boolean;
  initialChart?: {
    dimensionFieldId?: string;
    primaryValueFieldId?: string;
    secondaryValueFieldId?: string;
    chartType?: PivotChartType;
  };
  initialChartCollapsed?: boolean;
  initialTableCollapsed?: boolean;
}

interface UsePivotTableActions {
  setRows: (rows: string[]) => void;
  setColumns: (columns: string[]) => void;
  setFilters: (filters: string[]) => void;
  setValues: (values: PivotValueFieldConfig[]) => void;
  setLayout: (layout: PivotLayoutConfig) => void;
  clearZone: (zone: 'rows' | 'columns' | 'filters' | 'values') => void;
  removeFieldFromZone: (zone: 'rows' | 'columns' | 'filters' | 'values', key: string) => void;
  setAggregationForValue: (tokenId: string, aggregation: PivotAggregation) => void;
  setFilterSelection: (fieldId: string, values: string[]) => void;
  resetFilterSelections: () => void;
  toggleGrandTotal: () => void;
  toggleConfigurator: () => void;
  setChartDimension: (fieldId: string) => void;
  setChartPrimaryValue: (fieldId: string) => void;
  setChartSecondaryValue: (fieldId: string) => void;
  setChartType: (chartType: PivotChartType) => void;
  toggleChart: () => void;
  toggleTable: () => void;
}

export interface UsePivotTableResult {
  model: PivotTableModel;
  actions: UsePivotTableActions;
}

const getDefaultChartDimensionFieldId = (
  rowFields: string[],
  columnFields: string[],
  preferred?: string,
): string => {
  const dimensionOptions = [...rowFields, ...columnFields];
  if (preferred && dimensionOptions.includes(preferred)) {
    return preferred;
  }
  return dimensionOptions[0] ?? '';
};

const getDefaultPrimaryValueFieldId = (
  valueFields: PivotValueFieldState[],
  preferred?: string,
): string => {
  if (preferred && valueFields.some((item) => item.fieldId === preferred)) {
    return preferred;
  }
  return valueFields[0]?.fieldId ?? '';
};

const getDefaultSecondaryValueFieldId = (
  valueFields: PivotValueFieldState[],
  primaryValueFieldId: string,
  preferred?: string,
): string => {
  if (preferred === '') {
    return '';
  }
  if (
    preferred &&
    preferred !== primaryValueFieldId &&
    valueFields.some((item) => item.fieldId === preferred)
  ) {
    return preferred;
  }
  return valueFields.find((item) => item.fieldId !== primaryValueFieldId)?.fieldId ?? '';
};

export const usePivotTable = ({
  fields,
  initialLayout,
  initialFilterSelections = {},
  initialShowGrandTotal = true,
  initialConfiguratorCollapsed = false,
  initialChart,
  initialChartCollapsed = false,
  initialTableCollapsed = false,
}: UsePivotTableOptions): UsePivotTableResult => {
  const tokenCounterRef = useRef(0);
  const validFieldSet = useMemo(() => new Set(fields.map((field) => field.id)), [fields]);
  const fieldMap = useMemo(() => new Map(fields.map((field) => [field.id, field])), [fields]);

  const [rowFields, setRowFields] = useState<string[]>(() => sanitizeAxisFields(initialLayout?.rows, validFieldSet));
  const [columnFields, setColumnFields] = useState<string[]>(() => sanitizeAxisFields(initialLayout?.columns, validFieldSet));
  const [filterFields, setFilterFields] = useState<string[]>(() => sanitizeAxisFields(initialLayout?.filters, validFieldSet));
  const [valueFields, setValueFields] = useState<PivotValueFieldState[]>(() => {
    const sourceValues = initialLayout?.values ?? [];
    const seen = new Set<string>();
    const result: PivotValueFieldState[] = [];

    sourceValues.forEach((valueField) => {
      if (!validFieldSet.has(valueField.fieldId) || seen.has(valueField.fieldId)) {
        return;
      }
      seen.add(valueField.fieldId);
      tokenCounterRef.current += 1;
      result.push({
        tokenId: `v${tokenCounterRef.current}`,
        fieldId: valueField.fieldId,
        aggregation: normalizeAggregation(valueField.aggregation, fieldMap.get(valueField.fieldId)),
      });
    });

    return result;
  });

  const [filterSelections, setFilterSelections] = useState<PivotFilterSelections>(initialFilterSelections);
  const [showGrandTotal, setShowGrandTotal] = useState<boolean>(initialShowGrandTotal);
  const [isConfiguratorCollapsed, setIsConfiguratorCollapsed] = useState<boolean>(initialConfiguratorCollapsed);
  const [chartDimensionFieldId, setChartDimensionFieldId] = useState<string>(() =>
    getDefaultChartDimensionFieldId(
      sanitizeAxisFields(initialLayout?.rows, validFieldSet),
      sanitizeAxisFields(initialLayout?.columns, validFieldSet),
      initialChart?.dimensionFieldId,
    ),
  );
  const [chartPrimaryValueFieldId, setChartPrimaryValueFieldId] = useState<string>(() => {
    const initialValueFields = (() => {
      const sourceValues = initialLayout?.values ?? [];
      const seen = new Set<string>();
      const result: PivotValueFieldState[] = [];

      sourceValues.forEach((valueField) => {
        if (!validFieldSet.has(valueField.fieldId) || seen.has(valueField.fieldId)) {
          return;
        }
        seen.add(valueField.fieldId);
        result.push({
          tokenId: valueField.fieldId,
          fieldId: valueField.fieldId,
          aggregation: normalizeAggregation(valueField.aggregation, fieldMap.get(valueField.fieldId)),
        });
      });
      return result;
    })();

    return getDefaultPrimaryValueFieldId(initialValueFields, initialChart?.primaryValueFieldId);
  });
  const [chartSecondaryValueFieldId, setChartSecondaryValueFieldId] = useState<string>(() => {
    const initialValueFields = (() => {
      const sourceValues = initialLayout?.values ?? [];
      const seen = new Set<string>();
      const result: PivotValueFieldState[] = [];

      sourceValues.forEach((valueField) => {
        if (!validFieldSet.has(valueField.fieldId) || seen.has(valueField.fieldId)) {
          return;
        }
        seen.add(valueField.fieldId);
        result.push({
          tokenId: valueField.fieldId,
          fieldId: valueField.fieldId,
          aggregation: normalizeAggregation(valueField.aggregation, fieldMap.get(valueField.fieldId)),
        });
      });
      return result;
    })();

    const primaryValueFieldId = getDefaultPrimaryValueFieldId(initialValueFields, initialChart?.primaryValueFieldId);
    return getDefaultSecondaryValueFieldId(initialValueFields, primaryValueFieldId, initialChart?.secondaryValueFieldId);
  });
  const [chartType, setChartType] = useState<PivotChartType>(initialChart?.chartType ?? 'bar-vertical');
  const [isChartCollapsed, setIsChartCollapsed] = useState<boolean>(initialChartCollapsed);
  const [isTableCollapsed, setIsTableCollapsed] = useState<boolean>(initialTableCollapsed);

  useEffect(() => {
    setRowFields((prev) => {
      const next = prev.filter((fieldId) => validFieldSet.has(fieldId));
      return arraysEqual(prev, next) ? prev : next;
    });
    setColumnFields((prev) => {
      const next = prev.filter((fieldId) => validFieldSet.has(fieldId));
      return arraysEqual(prev, next) ? prev : next;
    });
    setFilterFields((prev) => {
      const next = prev.filter((fieldId) => validFieldSet.has(fieldId));
      return arraysEqual(prev, next) ? prev : next;
    });
    setValueFields((prev) => {
      const next = prev
        .filter((item) => validFieldSet.has(item.fieldId))
        .map((item) => ({
          ...item,
          aggregation: normalizeAggregation(item.aggregation, fieldMap.get(item.fieldId)),
        }));
      return valueItemsEqual(prev, next) ? prev : next;
    });
  }, [fieldMap, validFieldSet]);

  useEffect(() => {
    setChartDimensionFieldId((prev) => getDefaultChartDimensionFieldId(rowFields, columnFields, prev));
  }, [columnFields, rowFields]);

  useEffect(() => {
    setChartPrimaryValueFieldId((prev) => getDefaultPrimaryValueFieldId(valueFields, prev));
  }, [valueFields]);

  useEffect(() => {
    setChartSecondaryValueFieldId((prev) => getDefaultSecondaryValueFieldId(valueFields, chartPrimaryValueFieldId, prev));
  }, [chartPrimaryValueFieldId, valueFields]);

  const setRows = useCallback(
    (rows: string[]) => {
      setRowFields(sanitizeAxisFields(rows, validFieldSet));
    },
    [validFieldSet],
  );

  const setColumns = useCallback(
    (columns: string[]) => {
      setColumnFields(sanitizeAxisFields(columns, validFieldSet));
    },
    [validFieldSet],
  );

  const setFilters = useCallback(
    (filters: string[]) => {
      setFilterFields(sanitizeAxisFields(filters, validFieldSet));
    },
    [validFieldSet],
  );

  const setValues = useCallback(
    (values: PivotValueFieldConfig[]) => {
      setValueFields((prev) => {
        const sourceValues = values ?? [];
        const seen = new Set<string>();
        const next: PivotValueFieldState[] = [];
        sourceValues.forEach((valueField) => {
          if (!validFieldSet.has(valueField.fieldId) || seen.has(valueField.fieldId)) {
            return;
          }
          seen.add(valueField.fieldId);
          const existing = prev.find((item) => item.fieldId === valueField.fieldId);
          if (existing) {
            next.push({
              ...existing,
              aggregation: normalizeAggregation(valueField.aggregation ?? existing.aggregation, fieldMap.get(valueField.fieldId)),
            });
            return;
          }
          tokenCounterRef.current += 1;
          next.push({
            tokenId: `v${tokenCounterRef.current}`,
            fieldId: valueField.fieldId,
            aggregation: normalizeAggregation(valueField.aggregation, fieldMap.get(valueField.fieldId)),
          });
        });
        return next;
      });
    },
    [fieldMap, validFieldSet],
  );

  const setLayout = useCallback(
    (layout: PivotLayoutConfig) => {
      setRows(layout.rows ?? []);
      setColumns(layout.columns ?? []);
      setFilters(layout.filters ?? []);
      setValues(layout.values ?? []);
    },
    [setColumns, setFilters, setRows, setValues],
  );

  const clearZone = useCallback((zone: 'rows' | 'columns' | 'filters' | 'values') => {
    if (zone === 'rows') return setRowFields([]);
    if (zone === 'columns') return setColumnFields([]);
    if (zone === 'filters') return setFilterFields([]);
    setValueFields([]);
  }, []);

  const removeFieldFromZone = useCallback((zone: 'rows' | 'columns' | 'filters' | 'values', key: string) => {
    if (zone === 'rows') return setRowFields((prev) => prev.filter((fieldId) => fieldId !== key));
    if (zone === 'columns') return setColumnFields((prev) => prev.filter((fieldId) => fieldId !== key));
    if (zone === 'filters') return setFilterFields((prev) => prev.filter((fieldId) => fieldId !== key));
    setValueFields((prev) => prev.filter((entry) => entry.tokenId !== key));
  }, []);

  const setAggregationForValue = useCallback(
    (tokenId: string, aggregation: PivotAggregation) => {
      setValueFields((prev) =>
        prev.map((item) =>
          item.tokenId === tokenId
            ? {
                ...item,
                aggregation: normalizeAggregation(aggregation, fieldMap.get(item.fieldId)),
              }
            : item,
        ),
      );
    },
    [fieldMap],
  );

  const setFilterSelection = useCallback((fieldId: string, values: string[]) => {
    setFilterSelections((prev) => ({ ...prev, [fieldId]: values }));
  }, []);

  const resetFilterSelections = useCallback(() => {
    setFilterSelections({});
  }, []);

  const toggleGrandTotal = useCallback(() => {
    setShowGrandTotal((prev) => !prev);
  }, []);

  const toggleConfigurator = useCallback(() => {
    setIsConfiguratorCollapsed((prev) => !prev);
  }, []);

  const setChartDimension = useCallback((fieldId: string) => {
    setChartDimensionFieldId(fieldId);
  }, []);

  const setChartPrimaryValue = useCallback((fieldId: string) => {
    setChartPrimaryValueFieldId(fieldId);
  }, []);

  const setChartSecondaryValue = useCallback((fieldId: string) => {
    setChartSecondaryValueFieldId(fieldId);
  }, []);

  const toggleChart = useCallback(() => {
    setIsChartCollapsed((prev) => !prev);
  }, []);

  const toggleTable = useCallback(() => {
    setIsTableCollapsed((prev) => !prev);
  }, []);

  const model = useMemo<PivotTableModel>(
    () => ({
      rowFields,
      setRowFields,
      columnFields,
      setColumnFields,
      filterFields,
      setFilterFields,
      valueFields,
      setValueFields,
      filterSelections,
      setFilterSelections,
      showGrandTotal,
      setShowGrandTotal,
      isConfiguratorCollapsed,
      setIsConfiguratorCollapsed,
      chartDimensionFieldId,
      setChartDimensionFieldId,
      chartPrimaryValueFieldId,
      setChartPrimaryValueFieldId,
      chartSecondaryValueFieldId,
      setChartSecondaryValueFieldId,
      chartType,
      setChartType,
      isChartCollapsed,
      setIsChartCollapsed,
      isTableCollapsed,
      setIsTableCollapsed,
    }),
    [
      chartDimensionFieldId,
      chartPrimaryValueFieldId,
      chartSecondaryValueFieldId,
      chartType,
      columnFields,
      filterFields,
      filterSelections,
      isChartCollapsed,
      isConfiguratorCollapsed,
      isTableCollapsed,
      rowFields,
      showGrandTotal,
      valueFields,
    ],
  );

  return {
    model,
    actions: {
      setRows,
      setColumns,
      setFilters,
      setValues,
      setLayout,
      clearZone,
      removeFieldFromZone,
      setAggregationForValue,
      setFilterSelection,
      resetFilterSelections,
      toggleGrandTotal,
      toggleConfigurator,
      setChartDimension,
      setChartPrimaryValue,
      setChartSecondaryValue,
      setChartType,
      toggleChart,
      toggleTable,
    },
  };
};
