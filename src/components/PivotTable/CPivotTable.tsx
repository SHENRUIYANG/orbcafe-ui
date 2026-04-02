'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Portal,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { CPivotTableProps, PivotAggregation, PivotChartType, PivotTablePreset } from './types';
import type { AxisZone, PivotColumnTreeNode, PivotPreview, PivotTreeNode, PivotZone, ValueZoneItem } from './pivotModel';
import { AGGREGATION_LABEL, EMPTY_VALUE_LABEL, GRAND_TOTAL_LABEL, ROW_RESULT_LABEL } from './pivotConstants';
import {
  aggregateRows,
  arraysEqual,
  encodeTupleKey,
  getAllowedAggregations,
  isAxisZone,
  normalizeAggregation,
  normalizeDimensionValue,
  parseDnDIdentifier,
  recordsEqual,
  sanitizeAxisFields,
  tupleCompare,
  valueItemsEqual,
} from './pivotUtils';
import { DimensionFilterSelect } from './components/DimensionFilterSelect';
import { FieldPaletteTokenUI } from './components/FieldPaletteToken';
import { PivotConfiguratorPanel } from './components/PivotConfiguratorPanel';
import { PivotSectionCard } from './components/PivotSectionCard';
import { PivotChartPanel } from './PivotChart';
import { PivotRowRenderer } from './components/PivotRowRenderer';
import { SortableZoneTokenUI } from './components/SortableZoneToken';
import { useOrbcafeI18n } from '../../i18n';

const getDefaultChartDimensionFieldId = (
  rowFields: string[],
  columnFields: string[],
  preferred?: string,
): string => {
  const options = [...rowFields, ...columnFields];
  if (preferred && options.includes(preferred)) {
    return preferred;
  }
  return options[0] ?? '';
};

const getDefaultPrimaryValueFieldId = (valueFields: ValueZoneItem[], preferred?: string): string => {
  if (preferred && valueFields.some((item) => item.fieldId === preferred)) {
    return preferred;
  }
  return valueFields[0]?.fieldId ?? '';
};

const getDefaultSecondaryValueFieldId = (
  valueFields: ValueZoneItem[],
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

interface VisiblePivotColumn {
  id: string;
  label: string;
  leafColumnIds: string[];
  valueItem: ValueZoneItem;
}

interface ColumnHeaderCell {
  key: string;
  label: string;
  colSpan: number;
  rowSpan: number;
  expandable: boolean;
  expanded: boolean;
}

const collectExpandableNodeKeys = <T extends { key: string; children: T[] }>(nodes: T[]): Set<string> => {
  const keys = new Set<string>();
  const visit = (items: T[]) => {
    items.forEach((item) => {
      if (item.children.length > 0) {
        keys.add(item.key);
        visit(item.children);
      }
    });
  };
  visit(nodes);
  return keys;
};

const getVisibleColumnTreeDepth = (nodes: PivotColumnTreeNode[], expandedKeys: Set<string>, depth = 0): number => {
  if (nodes.length === 0) {
    return depth;
  }

  return nodes.reduce((maxDepth, node) => {
    if (node.children.length === 0 || !expandedKeys.has(node.key)) {
      return Math.max(maxDepth, depth + 1);
    }
    return Math.max(maxDepth, getVisibleColumnTreeDepth(node.children, expandedKeys, depth + 1));
  }, depth);
};

const collectVisibleColumnGroups = (nodes: PivotColumnTreeNode[], expandedKeys: Set<string>): PivotColumnTreeNode[] => {
  const groups: PivotColumnTreeNode[] = [];
  const visit = (items: PivotColumnTreeNode[]) => {
    items.forEach((item) => {
      if (item.children.length > 0 && expandedKeys.has(item.key)) {
        visit(item.children);
        return;
      }
      groups.push(item);
    });
  };
  visit(nodes);
  return groups;
};

export const CPivotTable: React.FC<CPivotTableProps> = ({
  title,
  rows,
  fields,
  initialLayout,
  initialChart,
  emptyText,
  maxPreviewHeight = 520,
  initialChartCollapsed = false,
  initialTableCollapsed = false,
  model,
  enablePresetManagement = false,
  presets,
  defaultPresets,
  onPresetsChange,
  initialPresetId,
  onPresetApplied,
}) => {
  const { t } = useOrbcafeI18n();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const tokenCounterRef = useRef(0);
  const initialPresetAppliedRef = useRef(false);
  const resolvedTitle = title ?? t('pivot.title.default');
  const resolvedEmptyText = emptyText ?? t('pivot.empty');

  const aggregationLabels: Record<PivotAggregation, string> = useMemo(
    () => ({
      sum: t('pivot.agg.sum'),
      count: t('pivot.agg.count'),
      avg: t('pivot.agg.avg'),
      min: t('pivot.agg.min'),
      max: t('pivot.agg.max'),
    }),
    [t],
  );

  const getAggregationLabel = useCallback(
    (aggregation: PivotAggregation) => aggregationLabels[aggregation] ?? AGGREGATION_LABEL[aggregation],
    [aggregationLabels],
  );

  const validFieldSet = useMemo(() => new Set(fields.map((field) => field.id)), [fields]);
  const fieldMap = useMemo(() => new Map(fields.map((field) => [field.id, field])), [fields]);

  const [internalRowFields, setInternalRowFields] = useState<string[]>(() => sanitizeAxisFields(initialLayout?.rows, validFieldSet));
  const [internalColumnFields, setInternalColumnFields] = useState<string[]>(() =>
    sanitizeAxisFields(initialLayout?.columns, validFieldSet),
  );
  const [internalFilterFields, setInternalFilterFields] = useState<string[]>(() =>
    sanitizeAxisFields(initialLayout?.filters, validFieldSet),
  );
  const [internalValueFields, setInternalValueFields] = useState<ValueZoneItem[]>(() => {
    const sourceValues = initialLayout?.values ?? [];
    const seen = new Set<string>();
    const result: ValueZoneItem[] = [];
    sourceValues.forEach((valueField) => {
      if (!validFieldSet.has(valueField.fieldId) || seen.has(valueField.fieldId)) {
        return;
      }
      seen.add(valueField.fieldId);
      tokenCounterRef.current += 1;
      const fieldDefinition = fieldMap.get(valueField.fieldId);
      result.push({
        tokenId: `v${tokenCounterRef.current}`,
        fieldId: valueField.fieldId,
        aggregation: normalizeAggregation(valueField.aggregation, fieldDefinition),
      });
    });
    return result;
  });
  const [internalFilterSelections, setInternalFilterSelections] = useState<Record<string, string[]>>({});
  const [internalShowGrandTotal, setInternalShowGrandTotal] = useState<boolean>(true);
  const [internalIsConfiguratorCollapsed, setInternalIsConfiguratorCollapsed] = useState<boolean>(false);
  const [internalChartDimensionFieldId, setInternalChartDimensionFieldId] = useState<string>(() =>
    getDefaultChartDimensionFieldId(
      sanitizeAxisFields(initialLayout?.rows, validFieldSet),
      sanitizeAxisFields(initialLayout?.columns, validFieldSet),
      initialChart?.dimensionFieldId,
    ),
  );
  const [internalChartPrimaryValueFieldId, setInternalChartPrimaryValueFieldId] = useState<string>(() => {
    const initialValueItems = (initialLayout?.values ?? [])
      .filter((item, index, source) => validFieldSet.has(item.fieldId) && source.findIndex((entry) => entry.fieldId === item.fieldId) === index)
      .map((item) => ({
        tokenId: item.fieldId,
        fieldId: item.fieldId,
        aggregation: normalizeAggregation(item.aggregation, fieldMap.get(item.fieldId)),
      }));
    return getDefaultPrimaryValueFieldId(initialValueItems, initialChart?.primaryValueFieldId);
  });
  const [internalChartSecondaryValueFieldId, setInternalChartSecondaryValueFieldId] = useState<string>(() => {
    const initialValueItems = (initialLayout?.values ?? [])
      .filter((item, index, source) => validFieldSet.has(item.fieldId) && source.findIndex((entry) => entry.fieldId === item.fieldId) === index)
      .map((item) => ({
        tokenId: item.fieldId,
        fieldId: item.fieldId,
        aggregation: normalizeAggregation(item.aggregation, fieldMap.get(item.fieldId)),
      }));
    const primaryValueFieldId = getDefaultPrimaryValueFieldId(initialValueItems, initialChart?.primaryValueFieldId);
    return getDefaultSecondaryValueFieldId(initialValueItems, primaryValueFieldId, initialChart?.secondaryValueFieldId);
  });
  const [internalChartType, setInternalChartType] = useState<PivotChartType>(initialChart?.chartType ?? 'bar-vertical');
  const [internalIsChartCollapsed, setInternalIsChartCollapsed] = useState<boolean>(initialChartCollapsed);
  const [internalIsTableCollapsed, setInternalIsTableCollapsed] = useState<boolean>(initialTableCollapsed);
  const [internalPresets, setInternalPresets] = useState<PivotTablePreset[]>(() => defaultPresets ?? []);
  const [activePresetId, setActivePresetId] = useState<string>('');
  const [isSavePresetDialogOpen, setIsSavePresetDialogOpen] = useState(false);
  const [presetNameDraft, setPresetNameDraft] = useState('');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<Set<string>>(new Set(['__grand_total__']));
  const [expandedColumnKeys, setExpandedColumnKeys] = useState<Set<string>>(new Set());

  const rowFields = model?.rowFields ?? internalRowFields;
  const columnFields = model?.columnFields ?? internalColumnFields;
  const filterFields = model?.filterFields ?? internalFilterFields;
  const valueFields = (model?.valueFields as ValueZoneItem[]) ?? internalValueFields;
  const filterSelections = model?.filterSelections ?? internalFilterSelections;
  const showGrandTotal = model?.showGrandTotal ?? internalShowGrandTotal;
  const isConfiguratorCollapsed = model?.isConfiguratorCollapsed ?? internalIsConfiguratorCollapsed;
  const chartDimensionFieldId = model?.chartDimensionFieldId ?? internalChartDimensionFieldId;
  const chartPrimaryValueFieldId = model?.chartPrimaryValueFieldId ?? internalChartPrimaryValueFieldId;
  const chartSecondaryValueFieldId = model?.chartSecondaryValueFieldId ?? internalChartSecondaryValueFieldId;
  const chartType = model?.chartType ?? internalChartType;
  const isChartCollapsed = model?.isChartCollapsed ?? internalIsChartCollapsed;
  const isTableCollapsed = model?.isTableCollapsed ?? internalIsTableCollapsed;
  const presetList = presets ?? internalPresets;
  const shouldRenderPresetToolbar = enablePresetManagement || presetList.length > 0 || Boolean(onPresetsChange);

  const setRowFields: React.Dispatch<React.SetStateAction<string[]>> = useCallback(
    (updater) => {
      if (model?.setRowFields) {
        model.setRowFields(updater);
        return;
      }
      setInternalRowFields(updater);
    },
    [model],
  );

  const setColumnFields: React.Dispatch<React.SetStateAction<string[]>> = useCallback(
    (updater) => {
      if (model?.setColumnFields) {
        model.setColumnFields(updater);
        return;
      }
      setInternalColumnFields(updater);
    },
    [model],
  );

  const setFilterFields: React.Dispatch<React.SetStateAction<string[]>> = useCallback(
    (updater) => {
      if (model?.setFilterFields) {
        model.setFilterFields(updater);
        return;
      }
      setInternalFilterFields(updater);
    },
    [model],
  );

  const setValueFields: React.Dispatch<React.SetStateAction<ValueZoneItem[]>> = useCallback(
    (updater) => {
      if (model?.setValueFields) {
        model.setValueFields(updater as React.SetStateAction<any>);
        return;
      }
      setInternalValueFields(updater);
    },
    [model],
  );

  const setFilterSelections: React.Dispatch<React.SetStateAction<Record<string, string[]>>> = useCallback(
    (updater) => {
      if (model?.setFilterSelections) {
        model.setFilterSelections(updater as React.SetStateAction<any>);
        return;
      }
      setInternalFilterSelections(updater);
    },
    [model],
  );

  const setShowGrandTotal: React.Dispatch<React.SetStateAction<boolean>> = useCallback(
    (updater) => {
      if (model?.setShowGrandTotal) {
        model.setShowGrandTotal(updater);
        return;
      }
      setInternalShowGrandTotal(updater);
    },
    [model],
  );

  const setIsConfiguratorCollapsed: React.Dispatch<React.SetStateAction<boolean>> = useCallback(
    (updater) => {
      if (model?.setIsConfiguratorCollapsed) {
        model.setIsConfiguratorCollapsed(updater);
        return;
      }
      setInternalIsConfiguratorCollapsed(updater);
    },
    [model],
  );

  const setChartDimensionFieldId: React.Dispatch<React.SetStateAction<string>> = useCallback(
    (updater) => {
      if (model?.setChartDimensionFieldId) {
        model.setChartDimensionFieldId(updater);
        return;
      }
      setInternalChartDimensionFieldId(updater);
    },
    [model],
  );

  const setChartPrimaryValueFieldId: React.Dispatch<React.SetStateAction<string>> = useCallback(
    (updater) => {
      if (model?.setChartPrimaryValueFieldId) {
        model.setChartPrimaryValueFieldId(updater);
        return;
      }
      setInternalChartPrimaryValueFieldId(updater);
    },
    [model],
  );

  const setChartSecondaryValueFieldId: React.Dispatch<React.SetStateAction<string>> = useCallback(
    (updater) => {
      if (model?.setChartSecondaryValueFieldId) {
        model.setChartSecondaryValueFieldId(updater);
        return;
      }
      setInternalChartSecondaryValueFieldId(updater);
    },
    [model],
  );

  const setChartType: React.Dispatch<React.SetStateAction<PivotChartType>> = useCallback(
    (updater) => {
      if (model?.setChartType) {
        model.setChartType(updater);
        return;
      }
      setInternalChartType(updater);
    },
    [model],
  );

  const setIsChartCollapsed: React.Dispatch<React.SetStateAction<boolean>> = useCallback(
    (updater) => {
      if (model?.setIsChartCollapsed) {
        model.setIsChartCollapsed(updater);
        return;
      }
      setInternalIsChartCollapsed(updater);
    },
    [model],
  );

  const setIsTableCollapsed: React.Dispatch<React.SetStateAction<boolean>> = useCallback(
    (updater) => {
      if (model?.setIsTableCollapsed) {
        model.setIsTableCollapsed(updater);
        return;
      }
      setInternalIsTableCollapsed(updater);
    },
    [model],
  );

  const setPresetList: React.Dispatch<React.SetStateAction<PivotTablePreset[]>> = useCallback(
    (updater) => {
      const nextPresets = typeof updater === 'function' ? updater(presetList) : updater;
      if (!presets) {
        setInternalPresets(nextPresets);
      }
      onPresetsChange?.(nextPresets);
    },
    [onPresetsChange, presetList, presets],
  );

  const usedDimensionSet = useMemo(() => new Set([...rowFields, ...columnFields, ...filterFields]), [
    rowFields,
    columnFields,
    filterFields,
  ]);

  const availableFields = useMemo(() => fields.filter((field) => !usedDimensionSet.has(field.id)), [fields, usedDimensionSet]);

  const activeFilterFields = useMemo(() => {
    const ordered = [...rowFields, ...columnFields, ...filterFields];
    const seen = new Set<string>();
    const result: string[] = [];
    ordered.forEach((fieldId) => {
      if (seen.has(fieldId)) {
        return;
      }
      seen.add(fieldId);
      result.push(fieldId);
    });
    return result;
  }, [columnFields, filterFields, rowFields]);

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

  const filterOptions = useMemo(() => {
    const result: Record<string, string[]> = {};
    activeFilterFields.forEach((fieldId) => {
      const values = new Set<string>();
      rows.forEach((row) => {
        values.add(normalizeDimensionValue(row[fieldId]));
      });
      result[fieldId] = Array.from(values).sort((a, b) => a.localeCompare(b));
    });
    return result;
  }, [activeFilterFields, rows]);

  useEffect(() => {
    setFilterSelections((prev) => {
      const next: Record<string, string[]> = {};
      activeFilterFields.forEach((fieldId) => {
        const options = filterOptions[fieldId] ?? [];
        const prior = prev[fieldId] ?? [];
        const cleaned = prior.filter((option) => options.includes(option));
        const hasPriorSelection = Object.prototype.hasOwnProperty.call(prev, fieldId);
        next[fieldId] = hasPriorSelection ? cleaned : options;
      });
      return recordsEqual(prev, next) ? prev : next;
    });
  }, [activeFilterFields, filterOptions]);

  useEffect(() => {
    setChartDimensionFieldId((prev) => getDefaultChartDimensionFieldId(rowFields, columnFields, prev));
  }, [columnFields, rowFields, setChartDimensionFieldId]);

  useEffect(() => {
    setChartPrimaryValueFieldId((prev) => getDefaultPrimaryValueFieldId(valueFields, prev));
  }, [setChartPrimaryValueFieldId, valueFields]);

  useEffect(() => {
    setChartSecondaryValueFieldId((prev) => getDefaultSecondaryValueFieldId(valueFields, chartPrimaryValueFieldId, prev));
  }, [chartPrimaryValueFieldId, setChartSecondaryValueFieldId, valueFields]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      return activeFilterFields.every((fieldId) => {
        const selectedValues = filterSelections[fieldId] ?? [];
        const allOptions = filterOptions[fieldId] ?? [];
        if (selectedValues.length === allOptions.length) return true;
        if (selectedValues.length === 0) return false;
        const currentValue = normalizeDimensionValue(row[fieldId]);
        return selectedValues.includes(currentValue);
      });
    });
  }, [activeFilterFields, filterOptions, filterSelections, rows]);

  const pivotPreview = useMemo<PivotPreview | null>(() => {
    if (valueFields.length === 0) {
      return null;
    }

    const columnTupleMap = new Map<string, string[]>();

    filteredRows.forEach((row) => {
      const colTuple =
        columnFields.length > 0 ? columnFields.map((fieldId) => normalizeDimensionValue(row[fieldId])) : [t('pivot.valueLabel')];
      const colKey = encodeTupleKey(colTuple);
      columnTupleMap.set(colKey, colTuple);
    });

    if (columnTupleMap.size === 0) {
      const fallbackColumn = columnFields.length > 0 ? columnFields.map(() => EMPTY_VALUE_LABEL) : [t('pivot.valueLabel')];
      columnTupleMap.set(encodeTupleKey(fallbackColumn), fallbackColumn);
    }

    const orderedColumns = Array.from(columnTupleMap.entries()).sort((a, b) => tupleCompare(a[1], b[1]));

    const dataColumns = orderedColumns.flatMap(([colKey, colTuple]) =>
      valueFields.map((valueField) => {
        const valueFieldDef = fieldMap.get(valueField.fieldId);
        const valueLabel = `${getAggregationLabel(valueField.aggregation)} ${valueFieldDef?.label ?? valueField.fieldId}`;
        const columnLabel =
          columnFields.length === 0 || valueFields.length > 1 ? `${colTuple.join(' / ')} • ${valueLabel}` : colTuple.join(' / ');

        return {
          id: `${colKey}::${valueField.tokenId}`,
          colKey,
          valueItem: valueField,
          label: columnLabel,
        };
      }),
    );

    const columnTree: PivotColumnTreeNode[] = [];

    if (columnFields.length > 0) {
      orderedColumns.forEach(([colKey, colTuple]) => {
        const leafColumns = dataColumns.filter((column) => column.colKey === colKey);
        let currentLevel = columnTree;
        const keySegments: string[] = [];

        colTuple.forEach((segment, depth) => {
          keySegments.push(`d${depth}:${segment}`);
          const nodeKey = `col::${encodeTupleKey(keySegments)}`;
          let node = currentLevel.find((entry) => entry.key === nodeKey);
          if (!node) {
            node = {
              key: nodeKey,
              label: segment,
              children: [],
              leafColumnIds: [],
              path: colTuple.slice(0, depth + 1),
              depth,
            };
            currentLevel.push(node);
          }

          leafColumns.forEach((column) => {
            if (!node.leafColumnIds.includes(column.id)) {
              node.leafColumnIds.push(column.id);
            }
          });

          currentLevel = node.children;
        });
      });
    }

    const calculateValues = (bucket: Record<string, unknown>[]) => {
      const values: Record<string, number> = {};
      dataColumns.forEach((column) => {
        const subBucket = bucket.filter((row) => {
          const colTuple =
            columnFields.length > 0 ? columnFields.map((fieldId) => normalizeDimensionValue(row[fieldId])) : [t('pivot.valueLabel')];
          return encodeTupleKey(colTuple) === column.colKey;
        });
        values[column.id] = aggregateRows(subBucket, column.valueItem.fieldId, column.valueItem.aggregation);
      });
      return values;
    };

    const rootNodes: PivotTreeNode[] = [];

    if (rowFields.length === 0) {
      rootNodes.push({
        key: 'root',
        value: t('pivot.resultLabel') || ROW_RESULT_LABEL,
        children: [],
        isLeaf: true,
        aggregatedValues: calculateValues(filteredRows),
        path: [],
        depth: 0,
      });
    } else {
      const buildTree = (dataRows: Record<string, unknown>[], depth: number, parentPath: string[]): PivotTreeNode[] => {
        if (depth >= rowFields.length) {
          return [];
        }

        const fieldId = rowFields[depth];
        const groups = new Map<string, Record<string, unknown>[]>();

        dataRows.forEach((row) => {
          const val = normalizeDimensionValue(row[fieldId]);
          if (!groups.has(val)) groups.set(val, []);
          groups.get(val)!.push(row);
        });

        return Array.from(groups.keys())
          .sort()
          .map((key) => {
            const groupRows = groups.get(key)!;
            const path = [...parentPath, key];
            return {
              key: encodeTupleKey(path),
              value: key,
              fieldId,
              aggregatedValues: calculateValues(groupRows),
              children: buildTree(groupRows, depth + 1, path),
              isLeaf: depth === rowFields.length - 1,
              path,
              depth,
            };
          });
      };

      rootNodes.push(...buildTree(filteredRows, 0, []));
    }

    return { dataColumns, columnTree, rowTree: rootNodes };
  }, [columnFields, fieldMap, filteredRows, getAggregationLabel, rowFields, t, valueFields]);

  const createValueItem = useCallback(
    (fieldId: string, preferredAggregation?: PivotAggregation): ValueZoneItem => {
      tokenCounterRef.current += 1;
      return {
        tokenId: `v${tokenCounterRef.current}`,
        fieldId,
        aggregation: normalizeAggregation(preferredAggregation, fieldMap.get(fieldId)),
      };
    },
    [fieldMap],
  );

  const clearZone = useCallback((zone: AxisZone | 'values') => {
    if (zone === 'rows') return setRowFields([]);
    if (zone === 'columns') return setColumnFields([]);
    if (zone === 'filters') return setFilterFields([]);
    setValueFields([]);
  }, []);

  const removeFieldFromZone = useCallback((zone: AxisZone | 'values', key: string) => {
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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);
      if (!event.over) {
        return;
      }

      const activeParsed = parseDnDIdentifier(String(event.active.id));
      const overParsed = parseDnDIdentifier(String(event.over.id));
      if (!activeParsed || !overParsed || activeParsed.kind !== 'item' || !activeParsed.key) {
        return;
      }

      if (activeParsed.zone === overParsed.zone && overParsed.kind === 'item') {
        if (activeParsed.zone === 'rows') {
          const oldIndex = rowFields.indexOf(activeParsed.key);
          const newIndex = rowFields.indexOf(overParsed.key ?? '');
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            setRowFields((prev) => arrayMove(prev, oldIndex, newIndex));
          }
          return;
        }
        if (activeParsed.zone === 'columns') {
          const oldIndex = columnFields.indexOf(activeParsed.key);
          const newIndex = columnFields.indexOf(overParsed.key ?? '');
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            setColumnFields((prev) => arrayMove(prev, oldIndex, newIndex));
          }
          return;
        }
        if (activeParsed.zone === 'filters') {
          const oldIndex = filterFields.indexOf(activeParsed.key);
          const newIndex = filterFields.indexOf(overParsed.key ?? '');
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            setFilterFields((prev) => arrayMove(prev, oldIndex, newIndex));
          }
          return;
        }
        if (activeParsed.zone === 'values') {
          const oldIndex = valueFields.findIndex((entry) => entry.tokenId === activeParsed.key);
          const newIndex = valueFields.findIndex((entry) => entry.tokenId === (overParsed.key ?? ''));
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            setValueFields((prev) => arrayMove(prev, oldIndex, newIndex));
          }
        }
        return;
      }

      const targetZone = overParsed.zone;
      let nextRows = [...rowFields];
      let nextColumns = [...columnFields];
      let nextFilters = [...filterFields];
      let nextValues = [...valueFields];

      let movingFieldId = '';
      let movingValueItem: ValueZoneItem | null = null;

      if (activeParsed.zone === 'palette') {
        movingFieldId = activeParsed.key;
      } else if (activeParsed.zone === 'values') {
        const existing = nextValues.find((entry) => entry.tokenId === activeParsed.key);
        if (!existing) return;
        movingFieldId = existing.fieldId;
        movingValueItem = existing;
        nextValues = nextValues.filter((entry) => entry.tokenId !== activeParsed.key);
      } else if (activeParsed.zone === 'rows') {
        movingFieldId = activeParsed.key;
        nextRows = nextRows.filter((fieldId) => fieldId !== movingFieldId);
      } else if (activeParsed.zone === 'columns') {
        movingFieldId = activeParsed.key;
        nextColumns = nextColumns.filter((fieldId) => fieldId !== movingFieldId);
      } else if (activeParsed.zone === 'filters') {
        movingFieldId = activeParsed.key;
        nextFilters = nextFilters.filter((fieldId) => fieldId !== movingFieldId);
      }

      if (!movingFieldId) return;

      const removeFieldFromAxisZones = () => {
        nextRows = nextRows.filter((fieldId) => fieldId !== movingFieldId);
        nextColumns = nextColumns.filter((fieldId) => fieldId !== movingFieldId);
        nextFilters = nextFilters.filter((fieldId) => fieldId !== movingFieldId);
      };

      const resolveInsertIndex = (zone: PivotZone): number => {
        if (overParsed.kind !== 'item' || !overParsed.key) {
          if (zone === 'rows') return nextRows.length;
          if (zone === 'columns') return nextColumns.length;
          if (zone === 'filters') return nextFilters.length;
          if (zone === 'values') return nextValues.length;
          return 0;
        }
        if (zone === 'rows') {
          const index = nextRows.indexOf(overParsed.key);
          return index >= 0 ? index : nextRows.length;
        }
        if (zone === 'columns') {
          const index = nextColumns.indexOf(overParsed.key);
          return index >= 0 ? index : nextColumns.length;
        }
        if (zone === 'filters') {
          const index = nextFilters.indexOf(overParsed.key);
          return index >= 0 ? index : nextFilters.length;
        }
        if (zone === 'values') {
          const index = nextValues.findIndex((entry) => entry.tokenId === overParsed.key);
          return index >= 0 ? index : nextValues.length;
        }
        return 0;
      };

      if (targetZone === 'palette') {
        setRowFields(nextRows);
        setColumnFields(nextColumns);
        setFilterFields(nextFilters);
        setValueFields(nextValues);
        return;
      }

      if (targetZone === 'values') {
        const insertIndex = resolveInsertIndex('values');
        const newItem = movingValueItem ?? createValueItem(movingFieldId);
        nextValues.splice(insertIndex, 0, newItem);

        setRowFields(nextRows);
        setColumnFields(nextColumns);
        setFilterFields(nextFilters);
        setValueFields(nextValues);
        return;
      }

      if (isAxisZone(targetZone)) {
        removeFieldFromAxisZones();
        const insertIndex = resolveInsertIndex(targetZone);

        if (targetZone === 'rows') {
          nextRows.splice(insertIndex, 0, movingFieldId);
        } else if (targetZone === 'columns') {
          nextColumns.splice(insertIndex, 0, movingFieldId);
        } else {
          nextFilters.splice(insertIndex, 0, movingFieldId);
        }

        setRowFields(nextRows);
        setColumnFields(nextColumns);
        setFilterFields(nextFilters);
        setValueFields(nextValues);
      }
    },
    [columnFields, createValueItem, filterFields, rowFields, valueFields],
  );

  const setFilterSelection = useCallback((fieldId: string, nextSelected: string[]) => {
    setFilterSelections((prev) => ({ ...prev, [fieldId]: nextSelected }));
  }, []);

  const handleToggleRow = useCallback((key: string) => {
    setExpandedRowKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleToggleColumn = useCallback((key: string) => {
    setExpandedColumnKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const renderAggregationSelect = useCallback(
    (item: ValueZoneItem) => {
      const fieldDefinition = fieldMap.get(item.fieldId);
      const allowed = getAllowedAggregations(fieldDefinition);

      return (
        <FormControl size="small" sx={{ minWidth: 98 }}>
          <Select
            value={item.aggregation}
            onChange={(event) => setAggregationForValue(item.tokenId, event.target.value as PivotAggregation)}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            sx={{
              fontSize: '0.72rem',
              height: 26,
              '& .MuiSelect-select': {
                py: 0.35,
              },
            }}
          >
            {allowed.map((aggregation) => (
              <MenuItem key={aggregation} value={aggregation} sx={{ fontSize: '0.75rem' }}>
                {getAggregationLabel(aggregation)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    },
    [fieldMap, getAggregationLabel, setAggregationForValue],
  );

  const getFilterSelectionSummary = useCallback(
    (fieldId: string): string => {
      const options = filterOptions[fieldId] ?? [];
      const selectedValues = filterSelections[fieldId] ?? options;
      if (options.length === 0) return t('pivot.filter.noValues');
      if (selectedValues.length === 0) return t('pivot.filter.noneSelected');
      if (selectedValues.length === options.length) return t('pivot.filter.allValues');
      return t('pivot.filter.selectedCount', { selected: selectedValues.length, total: options.length });
    },
    [filterOptions, filterSelections, t],
  );

  const renderDimensionFilterSelect = useCallback(
    (fieldId: string) => {
      const options = filterOptions[fieldId] ?? [];
      const selectedValues = filterSelections[fieldId] ?? options;

      return (
        <DimensionFilterSelect
          options={options}
          selectedValues={selectedValues}
          onChange={(nextSelected) => setFilterSelection(fieldId, nextSelected)}
        />
      );
    },
    [filterOptions, filterSelections, setFilterSelection],
  );

  const createPresetId = useCallback(() => `pivot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, []);

  const buildCurrentPresetSnapshot = useCallback((): Omit<PivotTablePreset, 'id' | 'name'> => {
    const filterSelectionSnapshot: Record<string, string[]> = {};
    const snapshotFields = new Set<string>([...activeFilterFields, ...Object.keys(filterSelections)]);
    snapshotFields.forEach((fieldId) => {
      if (!validFieldSet.has(fieldId)) {
        return;
      }
      const values = filterSelections[fieldId] ?? [];
      filterSelectionSnapshot[fieldId] = [...values];
    });

    return {
      layout: {
        rows: [...rowFields],
        columns: [...columnFields],
        filters: [...filterFields],
        values: valueFields.map((item) => ({
          fieldId: item.fieldId,
          aggregation: item.aggregation,
        })),
      },
      filterSelections: filterSelectionSnapshot,
      showGrandTotal,
      chart: {
        dimensionFieldId: chartDimensionFieldId,
        primaryValueFieldId: chartPrimaryValueFieldId,
        secondaryValueFieldId: chartSecondaryValueFieldId,
        chartType,
      },
    };
  }, [
    activeFilterFields,
    chartDimensionFieldId,
    chartPrimaryValueFieldId,
    chartSecondaryValueFieldId,
    chartType,
    columnFields,
    filterFields,
    filterSelections,
    rowFields,
    showGrandTotal,
    validFieldSet,
    valueFields,
  ]);

  const applyPreset = useCallback(
    (preset: PivotTablePreset) => {
      const nextRows = sanitizeAxisFields(preset.layout.rows, validFieldSet);
      const nextColumns = sanitizeAxisFields(preset.layout.columns, validFieldSet);
      const nextFilters = sanitizeAxisFields(preset.layout.filters, validFieldSet);
      const seen = new Set<string>();
      const nextValues = (preset.layout.values ?? [])
        .filter((item) => {
          if (!validFieldSet.has(item.fieldId) || seen.has(item.fieldId)) {
            return false;
          }
          seen.add(item.fieldId);
          return true;
        })
        .map((item) => createValueItem(item.fieldId, item.aggregation));

      const nextFilterSelections: Record<string, string[]> = {};
      Object.entries(preset.filterSelections ?? {}).forEach(([fieldId, selections]) => {
        if (!validFieldSet.has(fieldId) || !Array.isArray(selections)) {
          return;
        }
        nextFilterSelections[fieldId] = Array.from(new Set(selections.map((entry) => String(entry))));
      });

      setRowFields(nextRows);
      setColumnFields(nextColumns);
      setFilterFields(nextFilters);
      setValueFields(nextValues);
      setFilterSelections(nextFilterSelections);
      if (typeof preset.showGrandTotal === 'boolean') {
        setShowGrandTotal(preset.showGrandTotal);
      }
      setChartDimensionFieldId(getDefaultChartDimensionFieldId(nextRows, nextColumns, preset.chart?.dimensionFieldId));
      const nextPrimaryValueFieldId = getDefaultPrimaryValueFieldId(nextValues, preset.chart?.primaryValueFieldId);
      setChartPrimaryValueFieldId(nextPrimaryValueFieldId);
      setChartSecondaryValueFieldId(
        getDefaultSecondaryValueFieldId(nextValues, nextPrimaryValueFieldId, preset.chart?.secondaryValueFieldId),
      );
      setChartType(preset.chart?.chartType ?? 'bar-vertical');
      setActivePresetId(preset.id);
      onPresetApplied?.(preset);
    },
    [
      createValueItem,
      onPresetApplied,
      setChartDimensionFieldId,
      setChartPrimaryValueFieldId,
      setChartSecondaryValueFieldId,
      setChartType,
      setColumnFields,
      setFilterFields,
      setFilterSelections,
      setRowFields,
      setShowGrandTotal,
      setValueFields,
      validFieldSet,
    ],
  );

  const handlePresetChange = useCallback(
    (presetId: string) => {
      if (!presetId) {
        setActivePresetId('');
        return;
      }
      const selectedPreset = presetList.find((preset) => preset.id === presetId);
      if (!selectedPreset) {
        setActivePresetId('');
        return;
      }
      applyPreset(selectedPreset);
    },
    [applyPreset, presetList],
  );

  const handleOpenSavePresetDialog = useCallback(() => {
    const defaultPresetName = t('pivot.preset.defaultName', { index: presetList.length + 1 });
    setPresetNameDraft(defaultPresetName);
    setIsSavePresetDialogOpen(true);
  }, [presetList.length, t]);

  const handleSavePreset = useCallback(() => {
    const trimmedName = presetNameDraft.trim();
    if (!trimmedName) {
      return;
    }
    const nextPreset: PivotTablePreset = {
      id: createPresetId(),
      name: trimmedName,
      ...buildCurrentPresetSnapshot(),
    };
    setPresetList((prev) => [...prev, nextPreset]);
    setActivePresetId(nextPreset.id);
    setIsSavePresetDialogOpen(false);
  }, [buildCurrentPresetSnapshot, createPresetId, presetNameDraft, setPresetList]);

  const handleDeletePreset = useCallback(() => {
    if (!activePresetId) {
      return;
    }
    setPresetList((prev) => prev.filter((preset) => preset.id !== activePresetId));
    setActivePresetId('');
  }, [activePresetId, setPresetList]);

  useEffect(() => {
    if (!initialPresetId || initialPresetAppliedRef.current) {
      return;
    }
    const initialPreset = presetList.find((preset) => preset.id === initialPresetId);
    if (!initialPreset) {
      return;
    }
    initialPresetAppliedRef.current = true;
    applyPreset(initialPreset);
  }, [applyPreset, initialPresetId, presetList]);

  useEffect(() => {
    if (!activePresetId) {
      return;
    }
    if (!presetList.some((preset) => preset.id === activePresetId)) {
      setActivePresetId('');
    }
  }, [activePresetId, presetList]);

  const grandTotalNode = useMemo(() => {
    if (!showGrandTotal || !pivotPreview || !rowFields.length) return null;
    const values: Record<string, number> = {};

    pivotPreview.dataColumns.forEach((column) => {
      const bucket = filteredRows.filter((row) => {
        const colTuple =
          columnFields.length > 0 ? columnFields.map((fieldId) => normalizeDimensionValue(row[fieldId])) : [t('pivot.valueLabel')];
        return encodeTupleKey(colTuple) === column.colKey;
      });
      values[column.id] = aggregateRows(bucket, column.valueItem.fieldId, column.valueItem.aggregation);
    });

    return {
      key: '__grand_total__',
      value: t('pivot.grandTotal') || GRAND_TOTAL_LABEL,
      children: [],
      isLeaf: false,
      isGrandTotal: true,
      aggregatedValues: values,
      path: [],
      depth: -1,
    } as PivotTreeNode;
  }, [showGrandTotal, pivotPreview, filteredRows, columnFields, rowFields.length, t]);

  const expandableRowKeys = useMemo(() => collectExpandableNodeKeys(pivotPreview?.rowTree ?? []), [pivotPreview]);
  const expandableColumnKeys = useMemo(() => collectExpandableNodeKeys(pivotPreview?.columnTree ?? []), [pivotPreview]);

  useEffect(() => {
    setExpandedRowKeys((prev) => {
      const next = new Set<string>();
      if (prev.has('__grand_total__')) {
        next.add('__grand_total__');
      }
      expandableRowKeys.forEach((key) => {
        if (prev.has(key)) {
          next.add(key);
        }
      });
      return next;
    });
  }, [expandableRowKeys]);

  useEffect(() => {
    setExpandedColumnKeys((prev) => {
      const next = new Set<string>();
      expandableColumnKeys.forEach((key) => {
        if (prev.has(key)) {
          next.add(key);
        }
      });
      return next;
    });
  }, [expandableColumnKeys]);

  const handleExpandAllRows = useCallback(() => {
    setExpandedRowKeys((prev) => {
      const next = new Set(prev);
      expandableRowKeys.forEach((key) => next.add(key));
      return next;
    });
  }, [expandableRowKeys]);

  const handleCollapseAllRows = useCallback(() => {
    setExpandedRowKeys((prev) => {
      const next = new Set<string>();
      if (prev.has('__grand_total__')) {
        next.add('__grand_total__');
      }
      return next;
    });
  }, []);

  const handleExpandAllColumns = useCallback(() => {
    setExpandedColumnKeys(new Set(expandableColumnKeys));
  }, [expandableColumnKeys]);

  const handleCollapseAllColumns = useCallback(() => {
    setExpandedColumnKeys(new Set());
  }, []);

  const visibleColumnGroups = useMemo(() => {
    if (!pivotPreview || columnFields.length === 0) {
      return [];
    }
    return collectVisibleColumnGroups(pivotPreview.columnTree, expandedColumnKeys);
  }, [columnFields.length, expandedColumnKeys, pivotPreview]);

  const visibleColumns = useMemo<VisiblePivotColumn[]>(() => {
    if (!pivotPreview) {
      return [];
    }

    if (columnFields.length === 0) {
      return pivotPreview.dataColumns.map((column) => ({
        id: column.id,
        label: column.label,
        leafColumnIds: [column.id],
        valueItem: column.valueItem,
      }));
    }

    const dataColumnMap = new Map(pivotPreview.dataColumns.map((column) => [column.id, column]));

    return visibleColumnGroups.flatMap((group) => {
      const groupedByValue = new Map<string, VisiblePivotColumn>();

      group.leafColumnIds.forEach((leafColumnId) => {
        const leafColumn = dataColumnMap.get(leafColumnId);
        if (!leafColumn) {
          return;
        }
        const tokenId = leafColumn.valueItem.tokenId;
        const valueFieldLabel = `${getAggregationLabel(leafColumn.valueItem.aggregation)} ${fieldMap.get(leafColumn.valueItem.fieldId)?.label ?? leafColumn.valueItem.fieldId}`;
        const existing = groupedByValue.get(tokenId);
        if (existing) {
          existing.leafColumnIds.push(leafColumnId);
          return;
        }
        groupedByValue.set(tokenId, {
          id: `${group.key}::${tokenId}`,
          label: valueFields.length > 1 ? valueFieldLabel : group.label,
          leafColumnIds: [leafColumnId],
          valueItem: leafColumn.valueItem,
        });
      });

      return Array.from(groupedByValue.values());
    });
  }, [columnFields.length, fieldMap, getAggregationLabel, pivotPreview, valueFields.length, visibleColumnGroups]);

  const visibleColumnMap = useMemo(() => new Map(visibleColumns.map((column) => [column.id, column])), [visibleColumns]);
  const renderedDataColumns = useMemo(
    () =>
      visibleColumns.map((column) => ({
        id: column.id,
        colKey: column.id,
        valueItem: column.valueItem,
        label: column.label,
      })),
    [visibleColumns],
  );

  const columnHeaderRows = useMemo<ColumnHeaderCell[][]>(() => {
    if (!pivotPreview || columnFields.length === 0) {
      return [];
    }

    const rowsForHeader: ColumnHeaderCell[][] = [];
    const visibleDepth = getVisibleColumnTreeDepth(pivotPreview.columnTree, expandedColumnKeys);
    const totalDepth = visibleDepth + (valueFields.length > 1 ? 1 : 0);

    const appendCells = (nodes: PivotColumnTreeNode[], depth: number) => {
      rowsForHeader[depth] ??= [];
      nodes.forEach((node) => {
        const isExpanded = node.children.length > 0 && expandedColumnKeys.has(node.key);
        const colSpan = visibleColumns.filter((column) => node.leafColumnIds.some((leafId) => column.leafColumnIds.includes(leafId))).length;
        const rowSpan = isExpanded || valueFields.length > 1 ? 1 : totalDepth - depth;

        rowsForHeader[depth].push({
          key: node.key,
          label: node.label,
          colSpan,
          rowSpan,
          expandable: node.children.length > 0,
          expanded: isExpanded,
        });

        if (isExpanded) {
          appendCells(node.children, depth + 1);
        }
      });
    };

    appendCells(pivotPreview.columnTree, 0);

    if (valueFields.length > 1) {
      rowsForHeader[visibleDepth] = visibleColumns.map((column) => ({
        key: column.id,
        label: column.label,
        colSpan: 1,
        rowSpan: 1,
        expandable: false,
        expanded: false,
      }));
    }

    return rowsForHeader;
  }, [columnFields.length, expandedColumnKeys, pivotPreview, valueFields.length, visibleColumns]);

  const getNodeValueForColumn = useCallback(
    (node: PivotTreeNode, column: VisiblePivotColumn) =>
      column.leafColumnIds.reduce((sum, leafColumnId) => sum + (node.aggregatedValues[leafColumnId] ?? 0), 0),
    [],
  );

  const tableHeaderActions = useMemo(
    () => (
      <>
        <Button
          size="small"
          variant="text"
          onClick={handleExpandAllRows}
          disabled={expandableRowKeys.size === 0}
          sx={{ minWidth: 'auto', px: 0.8, fontSize: '0.72rem' }}
        >
          {t('pivot.table.expandRowsAll')}
        </Button>
        <Button
          size="small"
          variant="text"
          onClick={handleCollapseAllRows}
          disabled={expandableRowKeys.size === 0}
          sx={{ minWidth: 'auto', px: 0.8, fontSize: '0.72rem' }}
        >
          {t('pivot.table.collapseRowsAll')}
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button
          size="small"
          variant="text"
          onClick={handleExpandAllColumns}
          disabled={expandableColumnKeys.size === 0}
          sx={{ minWidth: 'auto', px: 0.8, fontSize: '0.72rem' }}
        >
          {t('pivot.table.expandColumnsAll')}
        </Button>
        <Button
          size="small"
          variant="text"
          onClick={handleCollapseAllColumns}
          disabled={columnFields.length === 0}
          sx={{ minWidth: 'auto', px: 0.8, fontSize: '0.72rem' }}
        >
          {t('pivot.table.collapseColumnsAll')}
        </Button>
      </>
    ),
    [
      columnFields.length,
      expandableColumnKeys.size,
      expandableRowKeys.size,
      handleCollapseAllColumns,
      handleCollapseAllRows,
      handleExpandAllColumns,
      handleExpandAllRows,
      t,
    ],
  );

  const renderDragOverlayContent = () => {
    if (!activeDragId) return null;
    const parsed = parseDnDIdentifier(activeDragId);
    if (!parsed || parsed.kind !== 'item' || !parsed.key) return null;

    if (parsed.zone === 'palette') {
      const field = fieldMap.get(parsed.key);
      if (!field) return null;
      return <FieldPaletteTokenUI label={field.label} subtitle={field.type} />;
    }

    if (parsed.zone === 'values') {
      const item = valueFields.find((entry) => entry.tokenId === parsed.key);
      if (!item) return null;
      const field = fieldMap.get(item.fieldId);
      const label = field?.label ?? item.fieldId;
      const caption = `${getAggregationLabel(item.aggregation)}(${label})`;
      return <SortableZoneTokenUI label={label} caption={caption} />;
    }

    const field = fieldMap.get(parsed.key);
    const label = field?.label ?? parsed.key;
    const caption = getFilterSelectionSummary(parsed.key);
    return <SortableZoneTokenUI label={label} caption={caption} />;
  };

  return (
    <Paper
      sx={(theme) => ({
        p: { xs: 1.2, md: 2 },
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 12px 28px rgba(15, 23, 42, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 800 }}>{resolvedTitle}</Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>{t('pivot.subtitle.default')}</Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {shouldRenderPresetToolbar && (
            <>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={activePresetId}
                  displayEmpty
                  onChange={(event) => handlePresetChange(String(event.target.value))}
                  sx={{ fontSize: '0.75rem', height: 32 }}
                >
                  <MenuItem value="" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {t('pivot.preset.selectPlaceholder')}
                  </MenuItem>
                  {presetList.map((preset) => (
                    <MenuItem key={preset.id} value={preset.id} sx={{ fontSize: '0.75rem' }}>
                      {preset.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tooltip title={t('pivot.preset.save')}>
                <IconButton size="small" onClick={handleOpenSavePresetDialog} aria-label={t('pivot.preset.save')}>
                  <SaveIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title={t('pivot.preset.delete')}>
                <span>
                  <IconButton
                    size="small"
                    onClick={handleDeletePreset}
                    disabled={!activePresetId}
                    aria-label={t('pivot.preset.delete')}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Divider flexItem orientation="vertical" />
            </>
          )}

          <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
            {t('pivot.records')}: <strong>{rows.length.toLocaleString()}</strong> / {t('pivot.afterFilter')}:{' '}
            <strong>{filteredRows.length.toLocaleString()}</strong>
          </Typography>
          <Divider flexItem orientation="vertical" />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Typography sx={{ fontSize: '0.74rem' }}>{t('pivot.grandTotal')}</Typography>
            <Switch size="small" checked={showGrandTotal} onChange={(event) => setShowGrandTotal(event.target.checked)} />
          </Box>
        </Stack>
      </Box>

      <Divider />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <PivotConfiguratorPanel
          isConfiguratorCollapsed={isConfiguratorCollapsed}
          onToggleCollapse={() => setIsConfiguratorCollapsed((prev) => !prev)}
          availableFields={availableFields}
          fieldMap={fieldMap}
          filterFields={filterFields}
          columnFields={columnFields}
          rowFields={rowFields}
          valueFields={valueFields}
          clearZone={clearZone}
          removeFieldFromZone={removeFieldFromZone}
          getFilterSelectionSummary={getFilterSelectionSummary}
          renderDimensionFilterSelect={renderDimensionFilterSelect}
          renderAggregationSelect={renderAggregationSelect}
          getAggregationLabel={getAggregationLabel}
        />

        <Portal>
          <DragOverlay
            dropAnimation={{
              duration: 250,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}
          >
            {renderDragOverlayContent()}
          </DragOverlay>
        </Portal>
      </DndContext>

      <PivotChartPanel
        rows={filteredRows}
        fieldMap={fieldMap}
        rowFields={rowFields}
        columnFields={columnFields}
        valueFields={valueFields}
        chartDimensionFieldId={chartDimensionFieldId}
        chartPrimaryValueFieldId={chartPrimaryValueFieldId}
        chartSecondaryValueFieldId={chartSecondaryValueFieldId}
        chartType={chartType}
        isCollapsed={isChartCollapsed}
        onChartDimensionFieldIdChange={(fieldId) => setChartDimensionFieldId(fieldId)}
        onChartPrimaryValueFieldIdChange={(fieldId) => setChartPrimaryValueFieldId(fieldId)}
        onChartSecondaryValueFieldIdChange={(fieldId) => setChartSecondaryValueFieldId(fieldId)}
        onChartTypeChange={(nextChartType) => setChartType(nextChartType)}
        onToggleCollapse={() => setIsChartCollapsed((prev) => !prev)}
        getAggregationLabel={getAggregationLabel}
      />

      <PivotSectionCard
        title={t('pivot.table.sectionTitle')}
        subtitle={rowFields.length > 0 ? rowFields.map((id) => fieldMap.get(id)?.label ?? id).join(' > ') : t('pivot.table.dimensions')}
        collapsed={isTableCollapsed}
        onToggleCollapse={() => setIsTableCollapsed((prev) => !prev)}
        expandAriaLabel={t('pivot.table.collapse.ariaExpand')}
        collapseAriaLabel={t('pivot.table.collapse.ariaCollapse')}
        bodySx={{ p: 0 }}
        headerActions={tableHeaderActions}
      >
        {pivotPreview === null ? (
          <Box sx={{ py: 5, px: { xs: 1.2, md: 1.6 }, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary' }}>{resolvedEmptyText}</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: maxPreviewHeight }}>
            <Table size="small" stickyHeader>
              <TableHead>
                {(columnHeaderRows.length > 0 ? columnHeaderRows : [[]]).map((headerRow, rowIndex) => (
                  <TableRow key={`pivot-header-row-${rowIndex}`}>
                    {rowIndex === 0 && (
                      <TableCell
                        rowSpan={Math.max(columnHeaderRows.length, 1)}
                        sx={(theme) => ({
                          fontWeight: 800,
                          fontSize: '0.76rem',
                          color: 'text.primary',
                          bgcolor: theme.palette.mode === 'dark' ? '#000000' : '#f5f5f5',
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          pl: 2,
                          minWidth: 220,
                          verticalAlign: 'middle',
                        })}
                      >
                        {rowFields.length > 0 ? rowFields.map((id) => fieldMap.get(id)?.label).join(' > ') : t('pivot.table.dimensions')}
                      </TableCell>
                    )}

                    {(headerRow.length > 0 ? headerRow : visibleColumns.map((column) => ({
                      key: column.id,
                      label: column.label,
                      colSpan: 1,
                      rowSpan: 1,
                      expandable: false,
                      expanded: false,
                    }))).map((cell) => (
                      <TableCell
                        key={cell.key}
                        align="center"
                        colSpan={cell.colSpan}
                        rowSpan={cell.rowSpan}
                        sx={(theme) => ({
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          color: 'text.primary',
                          bgcolor: theme.palette.mode === 'dark' ? '#000000' : '#f5f5f5',
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          minWidth: 148,
                          verticalAlign: 'middle',
                        })}
                      >
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.4 }}>
                          {cell.expandable && (
                            <IconButton
                              size="small"
                              onClick={() => handleToggleColumn(cell.key)}
                              sx={{ p: 0.1, ml: -0.3 }}
                            >
                              {cell.expanded ? (
                                <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                              ) : (
                                <KeyboardArrowRightIcon sx={{ fontSize: 16 }} />
                              )}
                            </IconButton>
                          )}
                          <Box component="span">{cell.label}</Box>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>

              <TableBody>
                {pivotPreview.rowTree.map((node) => (
                  <PivotRowRenderer
                    key={node.key}
                    node={node}
                    dataColumns={renderedDataColumns}
                    fieldMap={fieldMap}
                    level={0}
                    expandedKeys={expandedRowKeys}
                    onToggle={handleToggleRow}
                    getValue={(targetNode, columnId) => {
                      const visibleColumn = visibleColumnMap.get(columnId);
                      return visibleColumn ? getNodeValueForColumn(targetNode, visibleColumn) : 0;
                    }}
                  />
                ))}

                {grandTotalNode && (
                  <PivotRowRenderer
                    node={grandTotalNode}
                    dataColumns={renderedDataColumns}
                    fieldMap={fieldMap}
                    level={0}
                    expandedKeys={expandedRowKeys}
                    onToggle={handleToggleRow}
                    getValue={(targetNode, columnId) => {
                      const visibleColumn = visibleColumnMap.get(columnId);
                      return visibleColumn ? getNodeValueForColumn(targetNode, visibleColumn) : 0;
                    }}
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </PivotSectionCard>

      <Dialog open={isSavePresetDialogOpen} onClose={() => setIsSavePresetDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('pivot.preset.saveDialogTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label={t('pivot.preset.nameLabel')}
            value={presetNameDraft}
            onChange={(event) => setPresetNameDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSavePreset();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSavePresetDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSavePreset} disabled={!presetNameDraft.trim()}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
