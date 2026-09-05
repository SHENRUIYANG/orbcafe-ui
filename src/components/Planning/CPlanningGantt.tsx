'use client';

import { getOrbCompatMode } from '../../lib/orbis-compat';
import { AccountTreeIcon, KeyboardDoubleArrowLeftOutlinedIcon, KeyboardDoubleArrowRightOutlinedIcon, SortIcon, SplitscreenOutlinedIcon, ViewColumnIcon, useTheme } from '../../lib/orbis-compat';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { CChip } from '../Atoms/CChip';
import { CIconButton } from '../Atoms/CIconButton';
import { CPaper } from '../Atoms/CPaper';
import { CSelect } from '../Atoms/CSelect';
import { CSegmentedControl } from '../Atoms/CSegmentedControl';
import { CStack } from '../Atoms/CStack';
import { CTypography } from '../Atoms/CTypography';
import { CTooltip } from '../Atoms/CTooltip';
import { CProgress } from '../Atoms/CProgress';
import {
  CTableColumnMenu,
  CTableGroupMenu,
  CTableHeaderMenu,
  CTableSortDialog,
} from '../StdReport/Components/CTableMenu';
import { CTableHead as CSmartTableHead } from '../StdReport/Components/CTableHead';
import { CTableBody as CSmartTableBody } from '../StdReport/Components/CTableBody';
import { CTablePager } from '../StdReport/Components/CTablePager';
import { CTableToolbarSearch } from '../StdReport/Components/CTableToolbarSearch';
import {
  TABLE_GROUP_CONTROL_COLUMN_WIDTH,
  tableToolbarIconButtonSx,
} from '../StdReport/Components/ctableControlSx';
import { CLayoutManager } from '../StdReport/CLayoutManager';
import { useCTable } from '../StdReport/Hooks/CTable/useCTable';
import { useOrbcafeI18n } from '../../i18n';
import type {
  CPlanningGanttProps,
  PlanningGanttScale,
  PlanningTaskRecord,
  PlanningTaskStatus,
} from './types';

dayjs.extend(isoWeek);

interface TimelineUnit {
  key: string;
  label: string;
  contextLabel?: string;
  title?: string;
  start: Dayjs;
  end: Dayjs;
}

interface PlanningTableRow {
  id: string;
  code: string;
  title: string;
  titleSub: string;
  project: string;
  workCenter: string;
  owner: string;
  status: string;
  statusTone: PlanningTaskStatus;
  progress: number;
  startDate: string;
  endDate: string;
  color?: string;
  reorderable: boolean;
}

const scaleOptions: Array<{ value: PlanningGanttScale; label: string; width: number }> = [
  { value: 'hour', label: 'Hour', width: 56 },
  { value: 'day', label: 'Day', width: 46 },
  { value: 'week', label: 'Week', width: 78 },
  { value: 'month', label: 'Month', width: 104 },
];

const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 58;
const SPLITTER_WIDTH = 8;
const MIN_TABLE_WIDTH = 260;
const MIN_TIMELINE_WIDTH = 320;
const PANE_TRANSITION = '220ms cubic-bezier(0.2, 0, 0, 1)';

const statusConfig: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' }> = {
  'not-started': { label: 'Not started', color: 'default' },
  planned: { label: 'Planned', color: 'info' },
  'in-progress': { label: 'In progress', color: 'primary' },
  blocked: { label: 'Blocked', color: 'error' },
  done: { label: 'Done', color: 'success' },
};

const getStatusLabel = (status?: PlanningTaskStatus) => {
  if (!status) return 'Planned';
  return statusConfig[status]?.label ?? status;
};

const getStatusColor = (status?: PlanningTaskStatus) => {
  if (!status) return 'info';
  return statusConfig[status]?.color ?? 'default';
};

const clampProgress = (value?: number) => Math.min(100, Math.max(0, value ?? 0));

const flattenTasks = (tasks: PlanningTaskRecord[], level = 0): Array<PlanningTaskRecord & { level: number }> =>
  tasks.flatMap((task) => [{ ...task, level }, ...flattenTasks(task.children ?? [], level + 1)]);

const mapTaskToTableRow = (task: PlanningTaskRecord): PlanningTableRow => ({
  id: task.id,
  code: task.code ?? task.id,
  title: task.title,
  titleSub: task.project ?? task.workCenter ?? 'General',
  project: task.project ?? '',
  workCenter: task.workCenter ?? '',
  owner: task.owner?.name ?? 'Unassigned',
  status: getStatusLabel(task.status),
  statusTone: task.status ?? 'planned',
  progress: clampProgress(task.progress),
  startDate: task.startDate,
  endDate: task.endDate,
  color: task.color,
  reorderable: task.reorderable !== false,
});

const alignScaleStart = (input: Dayjs, scale: PlanningGanttScale) => {
  if (scale === 'month') return input.startOf('month');
  if (scale === 'week') return input.startOf('week');
  if (scale === 'day') return input.startOf('day');
  return input.startOf('hour');
};

const alignScaleEnd = (input: Dayjs, scale: PlanningGanttScale) => {
  if (scale === 'month') return input.endOf('month');
  if (scale === 'week') return input.endOf('week');
  if (scale === 'day') return input.endOf('day');
  return input.endOf('hour');
};

const buildTimelineUnits = (start: Dayjs, end: Dayjs, scale: PlanningGanttScale): TimelineUnit[] => {
  const units: TimelineUnit[] = [];
  let cursor = alignScaleStart(start, scale);
  const last = alignScaleEnd(end, scale);

  while (cursor.isBefore(last) || cursor.isSame(last)) {
    const unitEnd =
      scale === 'month'
        ? cursor.add(1, 'month')
        : scale === 'week'
          ? cursor.add(1, 'week')
          : scale === 'day'
            ? cursor.add(1, 'day')
            : cursor.add(1, 'hour');
    units.push({
      key: `${scale}-${cursor.valueOf()}`,
      label:
        scale === 'month'
          ? cursor.format('MMM YYYY')
          : scale === 'week'
            ? cursor.format('MMM D')
            : scale === 'day'
              ? cursor.format('D')
              : cursor.format('HH:mm'),
      contextLabel:
        scale === 'hour'
          ? cursor.format('MMM D')
          : scale === 'day'
            ? cursor.format('MMM')
            : scale === 'week'
              ? `W${cursor.isoWeek()}`
              : undefined,
      title:
        scale === 'hour'
          ? cursor.format('MMM D, YYYY HH:mm')
          : scale === 'day'
            ? cursor.format('MMM D, YYYY')
            : scale === 'week'
              ? `${cursor.format('MMM D, YYYY')} - Week ${cursor.isoWeek()}`
            : undefined,
      start: cursor,
      end: unitEnd,
    });
    cursor = unitEnd;
  }

  return units;
};

const dateToOffset = (date: Dayjs, units: TimelineUnit[], unitWidth: number) => {
  let offset = 0;
  for (const unit of units) {
    if (date.isBefore(unit.start)) {
      return offset;
    }
    if (date.isBefore(unit.end)) {
      const unitMs = Math.max(1, unit.end.valueOf() - unit.start.valueOf());
      const dateMs = Math.max(0, date.valueOf() - unit.start.valueOf());
      return offset + (dateMs / unitMs) * unitWidth;
    }
    offset += unitWidth;
  }
  return offset;
};

export const CPlanningGantt = ({
  appId = 'planning-gantt',
  tableKey = 'planning',
  serviceUrl,
  title = 'Project Plan',
  extraTools,
  bodyHeight = 560,
  tasks,
  columns,
  scale = 'week',
  onScaleChange,
  page,
  rowsPerPage = 20,
  rowsPerPageOptions = [20, 50, 100, -1],
  count,
  onPageChange,
  onRowsPerPageChange,
  timelineStart,
  timelineEnd,
  selectedTaskId,
  onTaskSelect,
  enableRowReorder = true,
  onTaskReorder,
  layout,
  layoutVariant,
  layoutVariantLoadKey,
  onLayoutIdChange,
  onLayoutSave,
  emptyLabel = 'No planning tasks available.',
  sx,
}: CPlanningGanttProps) => {
  const theme = useTheme();
  const { t } = useOrbcafeI18n();
  const splitLayoutRef = useRef<HTMLDivElement | null>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);
  const syncScrollingRef = useRef(false);
  const [tablePaneWidth, setTablePaneWidth] = useState<number | null>(null);
  const [splitMode, setSplitMode] = useState<'content' | 'even' | 'manual'>('content');
  const [expandedPane, setExpandedPane] = useState<'table' | 'timeline' | null>(null);
  const [splitLayoutWidth, setSplitLayoutWidth] = useState(0);
  const [rowHeightMap, setRowHeightMap] = useState<Record<string, number>>({});
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(HEADER_HEIGHT);
  const [taskOrderIds, setTaskOrderIds] = useState<string[]>([]);
  const lastLayoutVariantLoadKeyRef = useRef<number | undefined>(undefined);
  const [rowDragState, setRowDragState] = useState<{ activeId: string | null; overId: string | null }>({
    activeId: null,
    overId: null,
  });
  const [headerContextMenu, setHeaderContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    columnId: string;
  } | null>(null);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const columnDragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );
  const dragStateRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const flatTasks = useMemo(() => flattenTasks(tasks), [tasks]);
  const orderedFlatTasks = useMemo(() => {
    if (taskOrderIds.length === 0) return flatTasks;
    const taskById = new Map(flatTasks.map((task) => [task.id, task]));
    const ordered = taskOrderIds
      .map((id) => taskById.get(id))
      .filter((task): task is PlanningTaskRecord & { level: number } => Boolean(task));
    const orderedIds = new Set(ordered.map((task) => task.id));
    return [...ordered, ...flatTasks.filter((task) => !orderedIds.has(task.id))];
  }, [flatTasks, taskOrderIds]);
  const taskMap = useMemo(() => new Map(orderedFlatTasks.map((task) => [task.id, task])), [orderedFlatTasks]);
  const tableRows = useMemo(() => orderedFlatTasks.map((task) => mapTaskToTableRow(task)), [orderedFlatTasks]);
  const tableRowMap = useMemo(() => new Map(tableRows.map((row) => [row.id, row])), [tableRows]);
  const defaultTableColumns = useMemo(
    () => [
      { id: 'code', label: 'ID', minWidth: 90 },
      {
        id: 'title',
        label: 'Task',
        minWidth: 260,
        render: (_value: string, row: PlanningTableRow) => (
          <CStack spacing={0.2}>
            <CTypography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{row.title}</CTypography>
            <CTypography sx={{ fontSize: 13, color: 'text.secondary' }}>{row.titleSub}</CTypography>
          </CStack>
        ),
      },
      { id: 'owner', label: 'Owner', minWidth: 170 },
      {
        id: 'status',
        label: 'Status',
        minWidth: 130,
        render: (_value: string, row: PlanningTableRow) => (
          <CChip label={row.status} color={getStatusColor(row.statusTone)} size="small" />
        ),
      },
      {
        id: 'progress',
        label: 'Progress',
        minWidth: 140,
        numeric: true,
        render: (value: number) => (
          <CStack spacing={0.6}>
            <CTypography variant="caption" sx={{ color: 'text.secondary' }}>
              {value}%
            </CTypography>
            <CProgress variant="determinate" value={value} sx={{ height: 6, borderRadius: 999 }} />
          </CStack>
        ),
      },
      { id: 'startDate', label: 'Start', minWidth: 120 },
      { id: 'endDate', label: 'End', minWidth: 120 },
    ],
    [],
  );

  const tableColumns = useMemo(() => {
    if (!columns || columns.length === 0) return defaultTableColumns;

    const defaultById = new Map(defaultTableColumns.map((column: any) => [column.id, column]));

    return columns.map((column) => {
      const fallback = defaultById.get(column.id) as any;
      const minWidth = column.width ?? fallback?.minWidth ?? 120;
      const mappedColumn: any = {
        id: column.id,
        label: column.label,
        minWidth,
      };

      if (fallback?.numeric) mappedColumn.numeric = true;

      if (column.render) {
        const customRender = column.render;
        mappedColumn.render = (_value: unknown, row: PlanningTableRow) => {
          const task = taskMap.get(row.id);
          return customRender(task || (row as unknown as PlanningTaskRecord));
        };
        return mappedColumn;
      }

      if (fallback?.render) {
        mappedColumn.render = fallback.render;
        return mappedColumn;
      }

      mappedColumn.render = (_value: unknown, row: PlanningTableRow) => {
        const rowValue = (row as unknown as Record<string, unknown>)[column.id];
        if (rowValue !== undefined && rowValue !== null && String(rowValue).length > 0) {
          return String(rowValue);
        }
        const task = taskMap.get(row.id) as Record<string, unknown> | undefined;
        const taskValue = task?.[column.id];
        return taskValue !== undefined && taskValue !== null && String(taskValue).length > 0 ? String(taskValue) : '-';
      };
      return mappedColumn;
    });
  }, [columns, defaultTableColumns, taskMap]);

  const ctable = useCTable({
    appId,
    tableKey,
    title,
    columns: tableColumns,
    rows: tableRows,
    rowKey: 'id',
    page,
    rowsPerPage,
    rowsPerPageOptions,
    count: count ?? tableRows.length,
    onPageChange,
    onRowsPerPageChange,
    showSummary: false,
    layout,
    onLayoutSave,
  });
  const layoutManager = appId ? (
    <CLayoutManager
      appId={appId}
      tableKey={tableKey}
      currentLayoutData={ctable.currentLayoutData}
      onLayoutLoad={ctable.handleLayoutLoad}
      targetLayoutId={ctable.layoutIdToLoad}
      activeLayoutId={ctable.currentLayoutId}
      serviceUrl={serviceUrl}
    />
  ) : null;
  const timelineRows = ctable.visibleRows as Array<any>;

  useEffect(() => {
    const nextIds = flatTasks.map((task) => task.id);
    setTaskOrderIds((current) => {
      const nextIdSet = new Set(nextIds);
      const kept = current.filter((id) => nextIdSet.has(id));
      const keptSet = new Set(kept);
      const missing = nextIds.filter((id) => !keptSet.has(id));
      const next = [...kept, ...missing];
      if (next.length === current.length && next.every((id, index) => id === current[index])) {
        return current;
      }
      return next;
    });
  }, [flatTasks]);

  useEffect(() => {
    if (layoutVariantLoadKey === undefined || !layoutVariant) return;
    if (lastLayoutVariantLoadKeyRef.current === layoutVariantLoadKey) return;
    lastLayoutVariantLoadKeyRef.current = layoutVariantLoadKey;
    ctable.handleVariantLoad(layoutVariant);
  }, [ctable, layoutVariant, layoutVariantLoadKey]);

  useEffect(() => {
    onLayoutIdChange?.(ctable.currentLayoutId);
  }, [ctable.currentLayoutId, onLayoutIdChange]);

  const getTimelineEntryKey = (entry: any) =>
    entry.type === 'group' ? `group-${entry.id}` : `row-${(entry.data || entry)?.id}`;

  const range = useMemo(() => {
    const starts = tableRows.map((task) => dayjs(task.startDate));
    const ends = tableRows.map((task) => dayjs(task.endDate));
    const minStart = timelineStart ? dayjs(timelineStart) : starts.reduce((min, item) => (item.isBefore(min) ? item : min), starts[0] ?? dayjs());
    const maxEnd = timelineEnd ? dayjs(timelineEnd) : ends.reduce((max, item) => (item.isAfter(max) ? item : max), ends[0] ?? dayjs().add(30, 'day'));

    const startPaddingUnit =
      scale === 'month' ? 'month' : scale === 'week' ? 'week' : scale === 'day' ? 'day' : 'hour';
    const endPaddingUnit =
      scale === 'month' ? 'month' : scale === 'week' ? 'week' : scale === 'day' ? 'day' : 'hour';
    const startPaddingValue = scale === 'hour' ? 12 : 1;
    const endPaddingValue = scale === 'hour' ? 12 : 1;

    return {
      start: alignScaleStart(minStart.subtract(startPaddingValue, startPaddingUnit), scale),
      end: alignScaleEnd(maxEnd.add(endPaddingValue, endPaddingUnit), scale),
    };
  }, [tableRows, scale, timelineEnd, timelineStart]);

  const activeScale = scaleOptions.find((item) => item.value === scale) ?? scaleOptions[1];
  const extraToolNodes = Array.isArray(extraTools) ? extraTools : extraTools ? [extraTools] : [];
  const units = useMemo(() => buildTimelineUnits(range.start, range.end, scale), [range.end, range.start, scale]);
  const timelineMinWidth = units.length * activeScale.width;
  const timelineSlotPercent = units.length > 0 ? 100 / units.length : 100;
  const timelineGridTemplateColumns = units.length > 0
    ? `repeat(${units.length}, minmax(${activeScale.width}px, 1fr))`
    : '1fr';
  const timelineGridBackgroundSize = units.length > 0 ? `calc(100% / ${units.length}) 100%` : '100% 100%';

  const tableWidth = (ctable.columns || [])
    .filter((column: any) => ctable.visibleColumns.includes(column.id))
    .reduce((sum: number, column: any) => sum + (ctable.columnWidths?.[column.id] || column.minWidth || 100), 0)
    + (ctable.grouping.length > 0 ? TABLE_GROUP_CONTROL_COLUMN_WIDTH : 0);
  const resolvedTablePaneWidth = splitMode === 'manual' && tablePaneWidth !== null ? tablePaneWidth : tableWidth;
  const tableExpanded = expandedPane === 'table';
  const timelineExpanded = expandedPane === 'timeline';
  const tableCollapsed = expandedPane === 'timeline';
  const timelineCollapsed = expandedPane === 'table';
  const showSplitter = !tableCollapsed && !timelineCollapsed;

  const getTablePaneMaxWidth = () => {
    const layoutWidth = splitLayoutWidth || splitLayoutRef.current?.clientWidth || 0;
    if (layoutWidth > 0) {
      return Math.max(MIN_TABLE_WIDTH, layoutWidth - SPLITTER_WIDTH - MIN_TIMELINE_WIDTH);
    }
    return Math.max(MIN_TABLE_WIDTH, tableWidth);
  };

  const clampTablePaneWidth = (width: number) => (
    Math.min(Math.max(width, MIN_TABLE_WIDTH), getTablePaneMaxWidth())
  );

  const getMeasuredGridColumns = () => {
    if (splitLayoutWidth <= 0) return null;
    const splitterWidth = showSplitter ? SPLITTER_WIDTH : 0;

    if (tableExpanded) {
      return {
        tableWidth: splitLayoutWidth,
        splitterWidth,
        timelineWidth: 0,
      };
    }

    if (timelineExpanded) {
      return {
        tableWidth: 0,
        splitterWidth,
        timelineWidth: splitLayoutWidth,
      };
    }

    if (splitMode === 'even') {
      const tableColumnWidth = Math.max(0, (splitLayoutWidth - splitterWidth) / 2);
      return {
        tableWidth: tableColumnWidth,
        splitterWidth,
        timelineWidth: Math.max(0, splitLayoutWidth - splitterWidth - tableColumnWidth),
      };
    }

    const tableColumnWidth = clampTablePaneWidth(resolvedTablePaneWidth);
    return {
      tableWidth: tableColumnWidth,
      splitterWidth,
      timelineWidth: Math.max(0, splitLayoutWidth - splitterWidth - tableColumnWidth),
    };
  };

  const measuredGridColumns = getMeasuredGridColumns();
  const gridTemplateColumns = measuredGridColumns
    ? `${measuredGridColumns.tableWidth}px ${measuredGridColumns.splitterWidth}px ${measuredGridColumns.timelineWidth}px`
    : tableExpanded
      ? 'minmax(0, 1fr) 0px 0px'
      : timelineExpanded
        ? '0px 0px minmax(0, 1fr)'
        : splitMode === 'even'
          ? `minmax(0, 1fr) ${SPLITTER_WIDTH}px minmax(0, 1fr)`
          : `${resolvedTablePaneWidth}px ${SPLITTER_WIDTH}px minmax(0, 1fr)`;

  useEffect(() => {
    if (splitMode !== 'manual') return;
    setTablePaneWidth((current) => {
      if (current === null) return null;
      return clampTablePaneWidth(current);
    });
  }, [splitMode, tableWidth, splitLayoutWidth]);

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setExpandedPane(null);
    setSplitMode('manual');
    dragStateRef.current = {
      startX: event.clientX,
      startWidth: tableScrollRef.current?.getBoundingClientRect().width ?? resolvedTablePaneWidth,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state) return;
      const nextWidth = clampTablePaneWidth(state.startWidth + moveEvent.clientX - state.startX);
      setTablePaneWidth(nextWidth);
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const setEvenSplit = () => {
    setExpandedPane(null);
    setSplitMode('even');
    setTablePaneWidth(null);
  };

  const canDragTask = (taskId: string | null) => {
    if (!enableRowReorder || !taskId) return false;
    return tableRowMap.get(taskId)?.reorderable !== false;
  };

  const canDropOnTask = (activeId: string | null, targetId: string | null) => {
    if (!activeId || !targetId || activeId === targetId) return false;
    if (!canDragTask(activeId) || !canDragTask(targetId)) return false;
    if (ctable.grouping.length === 0) return true;

    const activeRow = tableRowMap.get(activeId) as Record<string, unknown> | undefined;
    const targetRow = tableRowMap.get(targetId) as Record<string, unknown> | undefined;
    if (!activeRow || !targetRow) return false;

    return ctable.grouping.every((field: string) => activeRow[field] === targetRow[field]);
  };

  const reorderVisibleTasks = (activeId: string, targetId: string) => {
    if (!canDropOnTask(activeId, targetId)) return;

    const visibleTaskIds = timelineRows
      .filter((entry) => entry.type !== 'group')
      .map((entry) => String((entry.data || entry)?.id));
    const sourceIndex = visibleTaskIds.indexOf(activeId);
    const targetIndex = visibleTaskIds.indexOf(targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextVisibleTaskIds = [...visibleTaskIds];
    [nextVisibleTaskIds[sourceIndex], nextVisibleTaskIds[targetIndex]] = [
      nextVisibleTaskIds[targetIndex],
      nextVisibleTaskIds[sourceIndex],
    ];

    const visibleIdSet = new Set(visibleTaskIds);
    const currentTaskIds = orderedFlatTasks.map((task) => task.id);
    const nextTaskIds = [...nextVisibleTaskIds, ...currentTaskIds.filter((id) => !visibleIdSet.has(id))];
    const activeTask = taskMap.get(activeId);
    const targetTask = taskMap.get(targetId);

    ctable.setOrder('asc');
    ctable.setOrderBy('');
    setTaskOrderIds(nextTaskIds);

    if (activeTask && targetTask) {
      const { level: _activeLevel, ...publicActiveTask } = activeTask;
      const { level: _targetLevel, ...publicTargetTask } = targetTask;
      const orderedTasks = nextTaskIds.reduce<PlanningTaskRecord[]>((result, id) => {
        const task = taskMap.get(id);
        if (task) {
          const { level: _level, ...publicTask } = task;
          result.push(publicTask);
        }
        return result;
      }, []);
      onTaskReorder?.(orderedTasks, { activeTask: publicActiveTask, targetTask: publicTargetTask });
    }
  };

  const startRowDrag = (event: DragEvent<HTMLElement>, row: PlanningTableRow) => {
    if (!canDragTask(row.id)) {
      event.preventDefault();
      return;
    }
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', row.id);
    setRowDragState({ activeId: row.id, overId: null });
    onTaskSelect?.(taskMap.get(row.id) || (row as unknown as PlanningTaskRecord));
  };

  const moveRowDragOver = (event: DragEvent<HTMLElement>, targetId: string) => {
    if (!canDropOnTask(rowDragState.activeId, targetId)) {
      setRowDragState((current) => (current.overId === null ? current : { ...current, overId: null }));
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    setRowDragState((current) => (current.overId === targetId ? current : { ...current, overId: targetId }));
  };

  const dropRow = (event: DragEvent<HTMLElement>, targetId: string) => {
    const activeId = rowDragState.activeId || event.dataTransfer.getData('text/plain');
    if (!canDropOnTask(activeId, targetId)) {
      setRowDragState({ activeId: null, overId: null });
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    reorderVisibleTasks(activeId, targetId);
    setRowDragState({ activeId: null, overId: null });
  };

  const endRowDrag = () => {
    setRowDragState({ activeId: null, overId: null });
  };

  const syncVerticalScroll = (source: 'table' | 'timeline') => {
    if (syncScrollingRef.current) return;
    const sourceEl = source === 'table' ? tableScrollRef.current : timelineScrollRef.current;
    const targetEl = source === 'table' ? timelineScrollRef.current : tableScrollRef.current;
    if (!sourceEl || !targetEl) return;
    syncScrollingRef.current = true;
    targetEl.scrollTop = sourceEl.scrollTop;
    window.requestAnimationFrame(() => {
      syncScrollingRef.current = false;
    });
  };

  useLayoutEffect(() => {
    const layoutEl = splitLayoutRef.current;
    if (!layoutEl) {
      setSplitLayoutWidth(0);
      return;
    }

    let animationFrame = 0;
    const measureSplitLayoutWidth = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const nextWidth = layoutEl.clientWidth;
        setSplitLayoutWidth((prev) => (Math.abs(prev - nextWidth) < 0.5 ? prev : nextWidth));
      });
    };

    measureSplitLayoutWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measureSplitLayoutWidth);
      return () => {
        window.cancelAnimationFrame(animationFrame);
        window.removeEventListener('resize', measureSplitLayoutWidth);
      };
    }

    const resizeObserver = new ResizeObserver(measureSplitLayoutWidth);
    resizeObserver.observe(layoutEl);
    window.addEventListener('resize', measureSplitLayoutWidth);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureSplitLayoutWidth);
    };
  }, [tableRows.length]);

  useLayoutEffect(() => {
    if (!selectedTaskId || timelineCollapsed) return;

    const timelineEl = timelineScrollRef.current;
    const tableEl = tableScrollRef.current;
    if (!timelineEl) return;

    const selectedRowKey = `row-${selectedTaskId}`;
    const timelineRow = Array.from(
      timelineEl.querySelectorAll<HTMLElement>('[data-planning-timeline-row-key]'),
    ).find((row) => row.dataset.planningTimelineRowKey === selectedRowKey);

    const selectedRow = tableRowMap.get(selectedTaskId);
    if (!timelineRow || !selectedRow) return;

    const animationFrame = window.requestAnimationFrame(() => {
      const timelineRect = timelineEl.getBoundingClientRect();
      const rowRect = timelineRow.getBoundingClientRect();
      const availableHeight = Math.max(1, timelineEl.clientHeight - measuredHeaderHeight);
      const targetTop =
        timelineEl.scrollTop +
        rowRect.top -
        timelineRect.top -
        measuredHeaderHeight -
        (availableHeight - rowRect.height) / 2;

      syncScrollingRef.current = true;
      timelineEl.scrollTop = Math.max(0, targetTop);
      if (tableEl && !tableCollapsed) {
        tableEl.scrollTop = timelineEl.scrollTop;
      }

      const timelineScrollWidth = Math.max(1, timelineEl.scrollWidth);
      const timelineUnitWidth = units.length > 0 ? timelineScrollWidth / units.length : activeScale.width;
      const taskStartOffset = dateToOffset(dayjs(selectedRow.startDate), units, timelineUnitWidth);
      const targetLeft = Math.max(0, taskStartOffset - timelineUnitWidth);
      timelineEl.scrollLeft = Math.min(targetLeft, Math.max(0, timelineScrollWidth - timelineEl.clientWidth));

      window.requestAnimationFrame(() => {
        syncScrollingRef.current = false;
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [
    activeScale.width,
    measuredHeaderHeight,
    selectedTaskId,
    tableCollapsed,
    tableRowMap,
    timelineCollapsed,
    timelineRows,
    units,
  ]);

  useLayoutEffect(() => {
    const tableEl = tableScrollRef.current;
    if (!tableEl) return;
    let animationFrame = 0;
    let delayedFrame = 0;
    let cancelled = false;

    const measureTableGeometry = () => {
      if (cancelled) return;
      const headerEl = tableEl.querySelector('thead');
    const rows = Array.from(tableEl.querySelectorAll('tbody tr[data-ctable-row-key]')) as HTMLTableRowElement[];
      if (rows.length === 0) return;

      const nextHeaderHeight = headerEl?.getBoundingClientRect().height || HEADER_HEIGHT;
      const nextMap: Record<string, number> = {};
      rows.forEach((row) => {
        const key = row.dataset.ctableRowKey;
        if (key) nextMap[key] = row.getBoundingClientRect().height;
      });

      setMeasuredHeaderHeight((prev) => (Math.abs(prev - nextHeaderHeight) < 0.01 ? prev : nextHeaderHeight));
      setRowHeightMap((prev) => {
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(nextMap);
        if (prevKeys.length === nextKeys.length && nextKeys.every((key) => Math.abs((prev[key] ?? 0) - nextMap[key]) < 0.01)) {
          return prev;
        }
        return nextMap;
      });
    };

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(measureTableGeometry);
    };

    // Pass 1: immediate measurement after layout
    measureTableGeometry();

    // Pass 2: deferred double-rAF measurement to capture text wrapping after reflow.
    // When grouping toggles, new rows render and cells may wrap to multiple lines in the
    // same frame; getBoundingClientRect() in the same layout pass can return pre-wrap heights.
    // A double-rAF gives the browser a chance to commit the wrap before re-measuring.
    window.cancelAnimationFrame(delayedFrame);
    delayedFrame = window.requestAnimationFrame(() => {
      delayedFrame = window.requestAnimationFrame(measureTableGeometry);
    });

    // Pass 3: re-measure after fonts finish loading. Web font swaps change text metrics,
    // which changes wrap points and thus row heights — this catches that final reflow.
    if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => {
        if (!cancelled) scheduleMeasure();
      }).catch(() => {});
    }

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', scheduleMeasure);
      return () => {
        cancelled = true;
        window.cancelAnimationFrame(animationFrame);
        window.cancelAnimationFrame(delayedFrame);
        window.removeEventListener('resize', scheduleMeasure);
      };
    }

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    const table = tableEl.querySelector('table');
    const tbody = tableEl.querySelector('tbody');
    const header = tableEl.querySelector('thead');
    if (table) resizeObserver.observe(table);
    if (header) resizeObserver.observe(header);

    const observedRows = new WeakSet<Element>();
    const observeAllRows = () => {
      tableEl.querySelectorAll('tbody tr[data-ctable-row-key]').forEach((row) => {
        if (!observedRows.has(row)) {
          resizeObserver.observe(row);
          observedRows.add(row);
        }
      });
    };
    observeAllRows();

    // MutationObserver picks up rows that React adds/removes after grouping toggles or
    // pagination changes, even within the same effect lifecycle. It guarantees newly
    // mounted rows are observed and remeasured without waiting for a dependency change.
    let mutationObserver: MutationObserver | null = null;
    if (tbody && typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        observeAllRows();
        scheduleMeasure();
      });
      mutationObserver.observe(tbody, { childList: true, subtree: true, characterData: true });
    }

    window.addEventListener('resize', scheduleMeasure);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(delayedFrame);
      resizeObserver.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
    };
  }, [timelineRows, ctable.visibleColumns, ctable.grouping, ctable.columnWidths]);

  return (
    <CPaper
      className="orb-ctable-surface orb-planning-gantt"
      elevation={0}
      sx={{
        m: 0,
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        borderRadius: 'var(--orb-r-container)',
        border: `1px solid ${theme.palette.divider}`,
        ...sx,
      }}
    >
      <div className="orb-table-toolbar orb-planning-table-toolbar" role="toolbar" aria-label={t('table.title.default')}>
        <div className="orb-table-toolbar-primary">
          <CTableToolbarSearch
            value={ctable.filterText}
            onChange={(value) => {
              ctable.setFilterText(value);
              ctable.setPage(0);
            }}
          />

          <CTablePager
            rowsPerPage={ctable.rowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            page={ctable.page}
            count={ctable.totalDisplayCount}
            onRowsPerPageChange={ctable.setRowsPerPage}
            onPageChange={ctable.setPage}
          />

          {extraToolNodes.length > 0 && (
            <div className="orb-table-toolbar-custom">
              {extraToolNodes.map((node, idx) => (
                <div key={`planning-extra-tool-${idx}`} className="orb-planning-extra-tool">
                  {node}
                </div>
              ))}
            </div>
          )}

          <span className="orb-table-toolbar-spacer" />

          <div className="orb-table-toolbar-actions">
            <div className="orb-table-tool-group">
              <CIconButton
                className="orb-table-tool-button"
                tooltip="Column visibility"
                onClick={(event) => ctable.setAnchorEl(event.currentTarget)}
                sx={tableToolbarIconButtonSx}
              >
                <ViewColumnIcon fontSize="small" />
              </CIconButton>
              <CIconButton
                className="orb-table-tool-button"
                tooltip="Group by"
                onClick={(event) => ctable.setGroupAnchorEl(event.currentTarget)}
                sx={tableToolbarIconButtonSx}
              >
                <AccountTreeIcon fontSize="small" />
              </CIconButton>
              <CIconButton
                className={`orb-table-tool-button ${ctable.sortBy.length > 0 || ctable.orderBy ? 'orb-is-active' : ''}`}
                tooltip="Sort by..."
                active={ctable.sortBy.length > 0 || Boolean(ctable.orderBy)}
                onClick={() => setSortDialogOpen(true)}
                sx={tableToolbarIconButtonSx}
              >
                <SortIcon fontSize="small" />
              </CIconButton>
            </div>

            {layoutManager && <div className="orb-table-tool-group">{layoutManager}</div>}

            <div className="orb-table-tool-group orb-planning-pane-controls">
              <CSegmentedControl<'table' | 'split' | 'timeline'>
                aria-label="Planning pane layout"
                size="small"
                value={expandedPane ?? (splitMode === 'even' ? 'split' : null)}
                options={[
                  { value: 'table', label: 'Expand task table', icon: <KeyboardDoubleArrowRightOutlinedIcon fontSize="small" /> },
                  { value: 'split', label: 'Split evenly', icon: <SplitscreenOutlinedIcon fontSize="small" /> },
                  { value: 'timeline', label: 'Expand timeline', icon: <KeyboardDoubleArrowLeftOutlinedIcon fontSize="small" /> },
                ]}
                onValueChange={(nextMode) => {
                  if (nextMode === 'split') setEvenSplit();
                  else setExpandedPane(nextMode);
                }}
              />
            </div>

            <div className="orb-table-tool-group orb-planning-scale-control">
              <CSelect
                label=""
                value={scale}
                options={scaleOptions.map((item) => ({ value: item.value, label: item.label }))}
                onChange={(event) => onScaleChange?.(event.target.value as PlanningGanttScale)}
              />
            </div>
          </div>
        </div>
      </div>

      {tableRows.length === 0 ? (
        <div sx={{ minHeight: 240, display: 'grid', placeItems: 'center', color: 'text.secondary' }}>{emptyLabel}</div>
      ) : (
        <div sx={{ overflow: 'hidden', flex: 1, minHeight: 0 }}>
          <div
            ref={splitLayoutRef}
            sx={{
              height: '100%',
              display: 'grid',
              gridTemplateColumns,
              minWidth: 0,
              transition: `grid-template-columns ${PANE_TRANSITION}`,
            }}
          >
            <div
              data-planning-scroll-pane="table"
              ref={tableScrollRef}
              onScroll={() => syncVerticalScroll('table')}
              sx={{
                width: '100%',
                minWidth: 0,
                maxWidth: '100%',
                height: bodyHeight,
                overflowX: 'auto',
                overflowY: 'auto',
                opacity: tableCollapsed ? 0 : 1,
                transform: tableCollapsed ? 'translateX(-10px)' : 'translateX(0)',
                pointerEvents: tableCollapsed ? 'none' : 'auto',
                transition: `opacity ${PANE_TRANSITION}, transform ${PANE_TRANSITION}`,
              }}
            >
              <DndContext
                sensors={columnDragSensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToHorizontalAxis]}
                onDragEnd={(event: DragEndEvent) => {
                  const activeId = event?.active?.id;
                  const overId = event?.over?.id;
                  if (typeof activeId === 'string' && typeof overId === 'string') {
                    ctable.handleColumnReorder(activeId, overId);
                  }
                }}
              >
                <table className="orb-tbl orb-ctable orb-planning-table"
                  sx={{
                    tableLayout: 'fixed',
                    width: tableWidth,
                    '& thead th': {
                      height: HEADER_HEIGHT,
                      py: 0,
                      lineHeight: 1.15,
                      boxSizing: 'border-box',
                    },
                  }}
                >
                  <CSmartTableHead
                    columns={ctable.columns}
                    visibleColumns={ctable.visibleColumns}
                    order={ctable.order}
                    orderBy={ctable.orderBy}
                    sortBy={ctable.sortBy}
                    onRequestSort={ctable.handleRequestSort}
                    onContextMenu={(event, columnId) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setHeaderContextMenu({
                        mouseX: event.clientX + 2,
                        mouseY: event.clientY - 6,
                        columnId,
                      });
                    }}
                    grouping={ctable.grouping}
                    isAllExpanded={ctable.isAllExpanded}
                    handleToggleAll={ctable.handleToggleAll}
                    columnWidths={ctable.columnWidths}
                    onColumnResize={ctable.handleColumnResize}
                    enableColumnReorder
                  />
                  <CSmartTableBody
                    visibleRows={timelineRows}
                    columns={ctable.columns}
                    visibleColumns={ctable.visibleColumns}
                    selected={selectedTaskId ? [selectedTaskId] : []}
                    expandedGroups={ctable.expandedGroups}
                    toggleGroupExpand={ctable.toggleGroupExpand}
                    handleExpandGroupRecursively={ctable.handleExpandGroupRecursively}
                    handleCollapseGroupRecursively={ctable.handleCollapseGroupRecursively}
                    isGroupFullyExpanded={ctable.isGroupFullyExpanded}
                    grouping={ctable.grouping}
                    rowKeyProp="id"
                    page={ctable.page}
                    rowsPerPage={ctable.rowsPerPage}
                    emptyLabel={emptyLabel}
                    handleClick={(_event, row) => {
                      onTaskSelect?.(taskMap.get(row.id) || (row as unknown as PlanningTaskRecord));
                    }}
                    getRowDataKey={({ entry }) => getTimelineEntryKey(entry)}
                    getGroupRowProps={() => ({
                      style: { height: ROW_HEIGHT },
                    })}
                    getRowProps={({ data }) => {
                      const row = data as PlanningTableRow;
                      const isDraggable = canDragTask(row.id);
                      const isDragging = rowDragState.activeId === row.id;
                      const isDropTarget = rowDragState.overId === row.id && canDropOnTask(rowDragState.activeId, row.id);
                      return {
                        draggable: isDraggable,
                        className: isDropTarget ? 'orb-is-drop-target' : undefined,
                        style: {
                          cursor: isDragging ? 'grabbing' : isDraggable ? 'grab' : onTaskSelect ? 'pointer' : 'default',
                          height: ROW_HEIGHT,
                          opacity: isDragging ? 0.56 : 1,
                          transition: 'background-color 120ms ease, opacity 120ms ease',
                        },
                        onDragStart: (event) => startRowDrag(event, row),
                        onDragOver: (event) => moveRowDragOver(event, row.id),
                        onDragEnter: (event) => moveRowDragOver(event, row.id),
                        onDrop: (event) => dropRow(event, row.id),
                        onDragEnd: endRowDrag,
                      };
                    }}
                  />
                </table>
              </DndContext>
            </div>

            <div
              onPointerDown={showSplitter ? startResize : undefined}
              role="separator"
              aria-orientation="vertical"
              sx={{
                width: showSplitter ? SPLITTER_WIDTH : 0,
                cursor: showSplitter ? 'col-resize' : 'default',
                opacity: showSplitter ? 1 : 0,
                pointerEvents: showSplitter ? 'auto' : 'none',
                borderLeft: showSplitter ? `1px solid ${theme.palette.divider}` : '0 solid transparent',
                borderRight: showSplitter ? `1px solid ${theme.palette.divider}` : '0 solid transparent',
                backgroundColor: getOrbCompatMode() === 'dark' ? 'color-mix(in oklch, var(--orb-muted) 10%, transparent)' : 'color-mix(in oklch, var(--orb-fg) 4%, transparent)',
                transition: `width ${PANE_TRANSITION}, opacity ${PANE_TRANSITION}, background-color 120ms ease`,
                position: 'relative',
                '&:hover': {
                  backgroundColor: theme.palette.action.selected,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: -6,
                  right: -6,
                  cursor: showSplitter ? 'col-resize' : 'default',
                },
              }}
            />

            <div
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                opacity: timelineCollapsed ? 0 : 1,
                transform: timelineCollapsed ? 'translateX(10px)' : 'translateX(0)',
                pointerEvents: timelineCollapsed ? 'none' : 'auto',
                transition: `opacity ${PANE_TRANSITION}, transform ${PANE_TRANSITION}`,
              }}
            >
              <div
                data-planning-scroll-pane="timeline"
                ref={timelineScrollRef}
                onScroll={() => syncVerticalScroll('timeline')}
                sx={{ width: '100%', height: bodyHeight, overflowX: 'auto', overflowY: 'auto' }}
              >
                <div sx={{ width: '100%', minWidth: timelineMinWidth || '100%' }}>
                  <div
                    className="orb-planning-timeline-header"
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: timelineGridTemplateColumns,
                      height: measuredHeaderHeight,
                      boxSizing: 'border-box',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      position: 'sticky',
                      top: 0,
                      zIndex: 2,
                    }}
                  >
                    {units.map((unit) => (
                      <div
                        key={unit.key}
                        title={unit.title}
                        sx={{
                          px: 0.75,
                          display: 'flex',
                          flexDirection: unit.contextLabel ? 'column' : 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: unit.contextLabel ? 0.15 : 0,
                          borderRight: `1px solid ${theme.palette.divider}`,
                          color: unit.contextLabel ? 'text.primary' : 'text.secondary',
                          overflow: 'hidden',
                        }}
                      >
                        {unit.contextLabel && (
                          <CTypography
                            component="span"
                            sx={{
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: 'text.secondary',
                              fontSize: 11,
                              fontWeight: 700,
                              lineHeight: 1.1,
                            }}
                          >
                            {unit.contextLabel}
                          </CTypography>
                        )}
                        <CTypography
                          component="span"
                          sx={{
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: 12,
                            fontWeight: 700,
                            lineHeight: 1.15,
                          }}
                        >
                          {unit.label}
                        </CTypography>
                      </div>
                    ))}
                  </div>

                  <CStack sx={{ position: 'relative' }}>
                    {timelineRows.map((entry) => {
                      const entryKey = getTimelineEntryKey(entry);
                      const rowHeight = rowHeightMap[entryKey] ?? ROW_HEIGHT;
                      if (entry.type === 'group') {
                        return (
                          <div
                            key={entry.id}
                            className="orb-planning-timeline-row orb-table-group-row"
                            data-planning-timeline-row-key={entryKey}
                            sx={{
                              position: 'relative',
                              height: rowHeight,
                              boxSizing: 'border-box',
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}
                          />
                        );
                      }

                      const row = (entry.data || entry) as PlanningTableRow;
                      const rowStart = dayjs(row.startDate);
                      const rowEnd = dayjs(row.endDate);
                      const left = dateToOffset(rowStart, units, timelineSlotPercent);
                      const right = dateToOffset(rowEnd, units, timelineSlotPercent);
                      const width = Math.max(0, right - left);
                      const progress = clampProgress(row.progress);
                      const selected = row.id === selectedTaskId;
                      const isDraggable = canDragTask(row.id);
                      const isDragging = rowDragState.activeId === row.id;
                      const isDropTarget = rowDragState.overId === row.id && canDropOnTask(rowDragState.activeId, row.id);
                      const barColor = row.color ?? (row.statusTone === 'blocked' ? theme.palette.error.main : theme.palette.primary.main);

                      return (
                        <div
                          key={row.id}
                          className={`orb-planning-timeline-row ${selected ? 'orb-is-selected' : ''}`}
                          data-planning-timeline-row-key={entryKey}
                          draggable={isDraggable}
                          onDragStart={(event) => startRowDrag(event, row)}
                          onDragOver={(event) => moveRowDragOver(event, row.id)}
                          onDragEnter={(event) => moveRowDragOver(event, row.id)}
                          onDrop={(event) => dropRow(event, row.id)}
                          onDragEnd={endRowDrag}
                          onClick={() => onTaskSelect?.(taskMap.get(row.id) || (row as unknown as PlanningTaskRecord))}
                          sx={{
                            position: 'relative',
                            height: rowHeight,
                            boxSizing: 'border-box',
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            opacity: isDragging ? 0.56 : 1,
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 2,
                              backgroundColor: theme.palette.primary.main,
                              opacity: isDropTarget ? 1 : 0,
                              transition: 'opacity 120ms ease',
                              pointerEvents: 'none',
                              zIndex: 3,
                            },
                            backgroundImage:
                              getOrbCompatMode() === 'dark'
                                ? 'linear-gradient(90deg, color-mix(in oklch, var(--orb-muted) 8%, transparent) 1px, transparent 1px)'
                                : 'linear-gradient(90deg, color-mix(in oklch, var(--orb-fg) 6%, transparent) 1px, transparent 1px)',
                            backgroundSize: timelineGridBackgroundSize,
                            cursor: isDragging ? 'grabbing' : isDraggable ? 'grab' : onTaskSelect ? 'pointer' : 'default',
                            transition: 'opacity 120ms ease',
                          }}
                        >
                          <CTooltip title={`${row.title}: ${rowStart.format('MMM D HH:mm')} - ${rowEnd.format('MMM D HH:mm')}`}>
                            <div
                              sx={{
                                position: 'absolute',
                                left: `${left}%`,
                                top: Math.max(8, (rowHeight - 24) / 2),
                                width: `max(18px, ${width}%)`,
                                height: 24,
                                borderRadius: 999,
                                overflow: 'hidden',
                                backgroundColor: getOrbCompatMode() === 'dark' ? 'color-mix(in oklch, var(--orb-muted) 18%, transparent)' : 'color-mix(in oklch, var(--orb-fg) 10%, transparent)',
                                outline: selected ? `2px solid ${theme.palette.warning.main}` : 'none',
                                outlineOffset: 2,
                              }}
                            >
                              <div sx={{ height: '100%', width: `${progress}%`, backgroundColor: barColor }} />
                              <CTypography
                                sx={{
                                  position: 'absolute',
                                  inset: 0,
                                  px: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: 'var(--orb-on-primary)',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  textShadow: '0 1px 4px rgba(0,0,0,0.45)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {row.code}
                              </CTypography>
                            </div>
                          </CTooltip>
                        </div>
                      );
                    })}
                  </CStack>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CTableGroupMenu
        groupAnchorEl={ctable.groupAnchorEl}
        setGroupAnchorEl={ctable.setGroupAnchorEl}
        grouping={ctable.grouping}
        setGrouping={ctable.setGrouping}
        columns={ctable.columns}
      />
      <CTableColumnMenu
        anchorEl={ctable.anchorEl}
        setAnchorEl={ctable.setAnchorEl}
        columns={ctable.columns}
        visibleColumns={ctable.visibleColumns}
        toggleColumnVisibility={ctable.toggleColumnVisibility}
      />
      <CTableHeaderMenu
        contextMenu={headerContextMenu}
        handleClose={() => setHeaderContextMenu(null)}
        columns={ctable.columns}
        visibleColumns={ctable.visibleColumns}
        grouping={ctable.grouping}
        summaryColumns={ctable.summaryColumns}
        showSummary={ctable.showSummary}
        sortBy={ctable.sortBy}
        orderBy={ctable.orderBy}
        order={ctable.order}
        onSortAsc={(columnId) => {
          ctable.applyMultiSort([{ field: columnId, direction: 'asc' }]);
        }}
        onSortDesc={(columnId) => {
          ctable.applyMultiSort([{ field: columnId, direction: 'desc' }]);
        }}
        onClearSort={(columnId) => {
          const next = ctable.sortBy.filter((rule) => rule.field !== columnId);
          if (next.length > 0) {
            ctable.applyMultiSort(next);
          } else {
            ctable.clearMultiSort();
            if (ctable.orderBy === columnId) ctable.setOrderBy('');
          }
        }}
        onHideColumn={(columnId) => {
          if (ctable.visibleColumns.includes(columnId)) {
            ctable.toggleColumnVisibility(columnId);
          }
        }}
        onToggleGroup={(columnId) => ctable.toggleGroupField(columnId)}
        onToggleSummary={(columnId) => ctable.toggleSummaryColumn(columnId)}
        onOpenSortDialog={() => setSortDialogOpen(true)}
      />
      <CTableSortDialog
        open={sortDialogOpen}
        onClose={() => setSortDialogOpen(false)}
        columns={ctable.columns}
        initialRules={
          ctable.sortBy.length > 0
            ? ctable.sortBy
            : ctable.orderBy
              ? [{ field: ctable.orderBy, direction: ctable.order }]
              : []
        }
        onApply={(rules) => ctable.applyMultiSort(rules)}
        onClear={() => {
          ctable.clearMultiSort();
          ctable.setOrderBy('');
        }}
      />
    </CPaper>
  );
};
