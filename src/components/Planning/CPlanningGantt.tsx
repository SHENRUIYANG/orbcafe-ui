'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  Box,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftOutlined';
import KeyboardDoubleArrowRightOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowRightOutlined';
import SplitscreenOutlinedIcon from '@mui/icons-material/SplitscreenOutlined';
import SortIcon from '@mui/icons-material/Sort';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { CChip } from '../Atoms/CChip';
import { CIconButton } from '../Atoms/CIconButton';
import { CPaper } from '../Atoms/CPaper';
import { CSelect } from '../Atoms/CSelect';
import { CTableColumnMenu, CTableGroupMenu } from '../StdReport/Components/CTableMenu';
import { CTableHead as CSmartTableHead } from '../StdReport/Components/CTableHead';
import { useCTable } from '../StdReport/Hooks/CTable/useCTable';
import type {
  CPlanningGanttProps,
  PlanningGanttScale,
  PlanningTaskRecord,
  PlanningTaskStatus,
} from './types';

interface TimelineUnit {
  key: string;
  label: string;
  start: Dayjs;
  end: Dayjs;
}

interface PlanningTableRow {
  id: string;
  code: string;
  title: string;
  titleSub: string;
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

const HEADER_HEIGHT = 56;
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
  title = 'Project Plan',
  subtitle = 'Task table and timeline view',
  extraTools,
  bodyHeight = 560,
  tasks,
  scale = 'week',
  onScaleChange,
  timelineStart,
  timelineEnd,
  selectedTaskId,
  onTaskSelect,
  enableRowReorder = true,
  onTaskReorder,
  emptyLabel = 'No planning tasks available.',
  sx,
}: CPlanningGanttProps) => {
  const theme = useTheme();
  const splitLayoutRef = useRef<HTMLDivElement | null>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);
  const syncScrollingRef = useRef(false);
  const [tablePaneWidth, setTablePaneWidth] = useState<number | null>(null);
  const [expandedPane, setExpandedPane] = useState<'table' | 'timeline' | null>(null);
  const [rowHeightMap, setRowHeightMap] = useState<Record<string, number>>({});
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(HEADER_HEIGHT);
  const [taskOrderIds, setTaskOrderIds] = useState<string[]>([]);
  const [rowDragState, setRowDragState] = useState<{ activeId: string | null; overId: string | null }>({
    activeId: null,
    overId: null,
  });
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
  const tableColumns = useMemo(
    () => [
      { id: 'code', label: 'ID', minWidth: 90 },
      {
        id: 'title',
        label: 'Task',
        minWidth: 260,
        render: (_value: string, row: PlanningTableRow) => (
          <Stack spacing={0.2}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{row.title}</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{row.titleSub}</Typography>
          </Stack>
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
          <Stack spacing={0.6}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {value}%
            </Typography>
            <LinearProgress variant="determinate" value={value} sx={{ height: 6, borderRadius: 999 }} />
          </Stack>
        ),
      },
      { id: 'startDate', label: 'Start', minWidth: 120 },
      { id: 'endDate', label: 'End', minWidth: 120 },
    ],
    [],
  );

  const ctable = useCTable({
    appId: 'planning-gantt',
    title,
    columns: tableColumns,
    rows: tableRows,
    rowKey: 'id',
    rowsPerPage: -1,
    rowsPerPageOptions: [-1],
    count: tableRows.length,
    showSummary: false,
  });
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
  const timelineWidth = units.length * activeScale.width;

  const tableWidth = (ctable.columns || [])
    .filter((column: any) => ctable.visibleColumns.includes(column.id))
    .reduce((sum: number, column: any) => sum + (ctable.columnWidths?.[column.id] || column.minWidth || 100), 0);
  const resolvedTablePaneWidth = tablePaneWidth ?? tableWidth;
  const tableExpanded = expandedPane === 'table';
  const timelineExpanded = expandedPane === 'timeline';
  const visibleTableWidth: number | string = timelineExpanded ? 0 : tableExpanded ? '100%' : resolvedTablePaneWidth;
  const tableCollapsed = expandedPane === 'timeline';
  const timelineCollapsed = expandedPane === 'table';
  const showSplitter = !tableCollapsed && !timelineCollapsed;
  const gridTemplateColumns = tableExpanded
    ? 'minmax(0, 1fr) 0px 0px'
    : timelineExpanded
      ? '0px 0px minmax(0, 1fr)'
      : `${resolvedTablePaneWidth}px ${SPLITTER_WIDTH}px minmax(0, 1fr)`;

  useEffect(() => {
    setTablePaneWidth((current) => {
      if (current === null) return null;
      return Math.min(Math.max(current, MIN_TABLE_WIDTH), tableWidth);
    });
  }, [tableWidth]);

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setExpandedPane(null);
    dragStateRef.current = {
      startX: event.clientX,
      startWidth: resolvedTablePaneWidth,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state) return;
      const layoutWidth = splitLayoutRef.current?.clientWidth ?? 0;
      const maxWidth = layoutWidth > 0
        ? Math.max(MIN_TABLE_WIDTH, layoutWidth - SPLITTER_WIDTH - MIN_TIMELINE_WIDTH)
        : tableWidth;
      const nextWidth = Math.min(Math.max(state.startWidth + moveEvent.clientX - state.startX, MIN_TABLE_WIDTH), maxWidth);
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

  const resetSplit = () => {
    setExpandedPane(null);
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
    const tableEl = tableScrollRef.current;
    if (!tableEl) return;
    let animationFrame = 0;

    const measureTableGeometry = () => {
      const headerEl = tableEl.querySelector('thead');
      const rows = Array.from(tableEl.querySelectorAll('tbody tr[data-planning-row-key]')) as HTMLTableRowElement[];
      if (rows.length === 0) return;

      const nextHeaderHeight = headerEl?.getBoundingClientRect().height || HEADER_HEIGHT;
      const nextMap: Record<string, number> = {};
      rows.forEach((row) => {
        const key = row.dataset.planningRowKey;
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

    measureTableGeometry();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', scheduleMeasure);
      return () => {
        window.cancelAnimationFrame(animationFrame);
        window.removeEventListener('resize', scheduleMeasure);
      };
    }

    const observer = new ResizeObserver(scheduleMeasure);
    const table = tableEl.querySelector('table');
    const header = tableEl.querySelector('thead');
    if (table) observer.observe(table);
    if (header) observer.observe(header);
    tableEl.querySelectorAll('tbody tr[data-planning-row-key]').forEach((row) => observer.observe(row));
    window.addEventListener('resize', scheduleMeasure);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
    };
  }, [timelineRows, ctable.visibleColumns, ctable.grouping, ctable.columnWidths]);

  return (
    <CPaper
      elevation={0}
      sx={{
        m: 0,
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        ...sx,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        spacing={2}
        sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${theme.palette.divider}` }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <CalendarMonthOutlinedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>{title}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
          {extraToolNodes.length > 0 && (
            <Stack direction="row" spacing={0.75} alignItems="center">
              {extraToolNodes.map((node, idx) => (
                <Box key={`planning-extra-tool-${idx}`} sx={{ display: 'flex', alignItems: 'center' }}>
                  {node}
                </Box>
              ))}
            </Stack>
          )}
          <Stack direction="row" spacing={0.25} sx={{ p: 0.5, borderRadius: 2, backgroundColor: 'action.hover' }}>
            <CIconButton tooltip="Column visibility" onClick={(event) => ctable.setAnchorEl(event.currentTarget)} color="default">
              <ViewColumnIcon fontSize="small" />
            </CIconButton>
            <CIconButton tooltip="Group by" onClick={(event) => ctable.setGroupAnchorEl(event.currentTarget)} color="default">
              <AccountTreeIcon fontSize="small" />
            </CIconButton>
            <CIconButton
              tooltip="Sort by first visible column"
              onClick={() => {
                const firstVisible = (ctable.columns || []).find((column: any) => ctable.visibleColumns.includes(column.id));
                if (firstVisible) ctable.handleRequestSort(firstVisible.id);
              }}
              color={ctable.orderBy ? 'primary' : 'default'}
            >
              <SortIcon fontSize="small" />
            </CIconButton>
          </Stack>
          <Stack direction="row" spacing={0.25} sx={{ p: 0.5, borderRadius: 2, backgroundColor: 'action.hover' }}>
            <CIconButton
              tooltip="Expand task table"
              onClick={() => setExpandedPane('table')}
              color={expandedPane === 'table' ? 'primary' : 'default'}
            >
              <KeyboardDoubleArrowRightOutlinedIcon fontSize="small" />
            </CIconButton>
            <CIconButton tooltip="Reset split" onClick={resetSplit} color={expandedPane === null ? 'primary' : 'default'}>
              <SplitscreenOutlinedIcon fontSize="small" />
            </CIconButton>
            <CIconButton
              tooltip="Expand timeline"
              onClick={() => setExpandedPane('timeline')}
              color={expandedPane === 'timeline' ? 'primary' : 'default'}
            >
              <KeyboardDoubleArrowLeftOutlinedIcon fontSize="small" />
            </CIconButton>
          </Stack>
          <Box sx={{ minWidth: 120 }}>
            <CSelect
              label=""
              value={scale}
              options={scaleOptions.map((item) => ({ value: item.value, label: item.label }))}
              onChange={(event) => onScaleChange?.(event.target.value as PlanningGanttScale)}
              sx={{
                '& .MuiSelect-select': { fontSize: '0.92rem', py: 0.65 },
                '& .MuiSvgIcon-root': { fontSize: 20 },
              }}
            />
          </Box>
        </Stack>
      </Stack>

      {tableRows.length === 0 ? (
        <Box sx={{ minHeight: 240, display: 'grid', placeItems: 'center', color: 'text.secondary' }}>{emptyLabel}</Box>
      ) : (
        <Box sx={{ overflow: 'hidden', flex: 1, minHeight: 0 }}>
          <Box
            ref={splitLayoutRef}
            sx={{
              height: '100%',
              display: 'grid',
              gridTemplateColumns,
              transition: `grid-template-columns ${PANE_TRANSITION}`,
            }}
          >
            <TableContainer
              data-planning-scroll-pane="table"
              ref={tableScrollRef}
              onScroll={() => syncVerticalScroll('table')}
              sx={{
                width: visibleTableWidth,
                height: bodyHeight,
                overflowX: 'auto',
                overflowY: 'auto',
                opacity: tableCollapsed ? 0 : 1,
                transform: tableCollapsed ? 'translateX(-10px)' : 'translateX(0)',
                pointerEvents: tableCollapsed ? 'none' : 'auto',
                transition: `opacity ${PANE_TRANSITION}, transform ${PANE_TRANSITION}, width ${PANE_TRANSITION}`,
              }}
            >
              <Table
                size="small"
                stickyHeader
                sx={{
                  tableLayout: 'fixed',
                  width: tableWidth,
                  '& thead .MuiTableCell-root': {
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
                    onRequestSort={ctable.handleRequestSort}
                    grouping={ctable.grouping}
                    isAllExpanded={ctable.isAllExpanded}
                    handleToggleAll={ctable.handleToggleAll}
                    columnWidths={ctable.columnWidths}
                    onColumnResize={ctable.handleColumnResize}
                  />
                  <TableBody>
                    {timelineRows.map((entry) => {
                      const entryKey = getTimelineEntryKey(entry);
                      if (entry.type === 'group') {
                        return (
                          <TableRow
                            key={entry.id}
                            data-planning-row-key={entryKey}
                            sx={{ height: ROW_HEIGHT, backgroundColor: theme.palette.action.hover }}
                          >
                            {ctable.grouping.length > 0 && (
                              <TableCell
                                sx={{
                                  width: 44,
                                  height: ROW_HEIGHT,
                                  py: 0,
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                <IconButton size="small" onClick={() => ctable.toggleGroupExpand(entry.id)}>
                                  {entry.isExpanded ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
                                </IconButton>
                              </TableCell>
                            )}
                            <TableCell
                              colSpan={ctable.visibleColumns.length}
                              sx={{
                                height: ROW_HEIGHT,
                                py: 0,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                                {entry.field}: {entry.value} ({entry.count})
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      const row = (entry.data || entry) as PlanningTableRow;
                      const isSelected = row.id === selectedTaskId;
                      const isDraggable = canDragTask(row.id);
                      const isDragging = rowDragState.activeId === row.id;
                      const isDropTarget = rowDragState.overId === row.id && canDropOnTask(rowDragState.activeId, row.id);
                      return (
                        <TableRow
                          key={row.id}
                          data-planning-row-key={entryKey}
                          draggable={isDraggable}
                          hover
                          selected={isSelected}
                          onDragStart={(event) => startRowDrag(event, row)}
                          onDragOver={(event) => moveRowDragOver(event, row.id)}
                          onDragEnter={(event) => moveRowDragOver(event, row.id)}
                          onDrop={(event) => dropRow(event, row.id)}
                          onDragEnd={endRowDrag}
                          onClick={() => onTaskSelect?.(taskMap.get(row.id) || (row as unknown as PlanningTaskRecord))}
                          sx={{
                            cursor: isDragging ? 'grabbing' : isDraggable ? 'grab' : onTaskSelect ? 'pointer' : 'default',
                            height: ROW_HEIGHT,
                            opacity: isDragging ? 0.56 : 1,
                            '& .MuiTableCell-root': isDropTarget
                              ? {
                                  borderTop: `2px solid ${theme.palette.primary.main}`,
                                }
                              : undefined,
                            transition: 'background-color 120ms ease, opacity 120ms ease',
                          }}
                        >
                          {ctable.grouping.length > 0 && (
                            <TableCell
                              sx={{
                                width: 44,
                                height: ROW_HEIGHT,
                                py: 0,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                              }}
                            />
                          )}
                          {(ctable.columns || [])
                            .filter((column: any) => ctable.visibleColumns.includes(column.id))
                            .map((column: any) => (
                              <TableCell
                                key={`${row.id}-${column.id}`}
                                sx={{
                                  width: ctable.columnWidths?.[column.id] || column.minWidth || 100,
                                  height: ROW_HEIGHT,
                                  py: 0,
                                  overflow: 'hidden',
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                {column.render ? column.render(row[column.id as keyof PlanningTableRow], row) : String(row[column.id as keyof PlanningTableRow] ?? '-')}
                              </TableCell>
                            ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
              </Table>
            </TableContainer>

            <Box
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
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(148,163,184,0.10)' : 'rgba(15,23,42,0.04)',
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

            <Box
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                opacity: timelineCollapsed ? 0 : 1,
                transform: timelineCollapsed ? 'translateX(10px)' : 'translateX(0)',
                pointerEvents: timelineCollapsed ? 'none' : 'auto',
                transition: `opacity ${PANE_TRANSITION}, transform ${PANE_TRANSITION}`,
              }}
            >
              <Box
                data-planning-scroll-pane="timeline"
                ref={timelineScrollRef}
                onScroll={() => syncVerticalScroll('timeline')}
                sx={{ width: '100%', height: bodyHeight, overflowX: 'auto', overflowY: 'auto' }}
              >
                <Box sx={{ width: timelineWidth }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${units.length}, ${activeScale.width}px)`,
                      height: measuredHeaderHeight,
                      boxSizing: 'border-box',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      position: 'sticky',
                      top: 0,
                      zIndex: 2,
                      backgroundColor: theme.palette.background.paper,
                    }}
                  >
                    {units.map((unit) => (
                      <Box
                        key={unit.key}
                        sx={{
                          px: 0.75,
                          display: 'flex',
                          alignItems: 'center',
                          borderRight: `1px solid ${theme.palette.divider}`,
                          color: 'text.secondary',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {unit.label}
                      </Box>
                    ))}
                  </Box>

                  <Stack sx={{ position: 'relative' }}>
                    {timelineRows.map((entry) => {
                      const entryKey = getTimelineEntryKey(entry);
                      const rowHeight = rowHeightMap[entryKey] ?? ROW_HEIGHT;
                      if (entry.type === 'group') {
                        return (
                          <Box
                            key={entry.id}
                            data-planning-timeline-row-key={entryKey}
                            sx={{
                              position: 'relative',
                              height: rowHeight,
                              boxSizing: 'border-box',
                              borderBottom: `1px solid ${theme.palette.divider}`,
                              backgroundColor: theme.palette.action.hover,
                            }}
                          />
                        );
                      }

                      const row = (entry.data || entry) as PlanningTableRow;
                      const rowStart = dayjs(row.startDate);
                      const rowEnd = dayjs(row.endDate);
                      const left = dateToOffset(rowStart, units, activeScale.width);
                      const right = dateToOffset(rowEnd, units, activeScale.width);
                      const width = Math.max(18, right - left);
                      const progress = clampProgress(row.progress);
                      const selected = row.id === selectedTaskId;
                      const isDraggable = canDragTask(row.id);
                      const isDragging = rowDragState.activeId === row.id;
                      const isDropTarget = rowDragState.overId === row.id && canDropOnTask(rowDragState.activeId, row.id);
                      const barColor = row.color ?? (row.statusTone === 'blocked' ? theme.palette.error.main : theme.palette.primary.main);

                      return (
                        <Box
                          key={row.id}
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
                              theme.palette.mode === 'dark'
                                ? 'linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)'
                                : 'linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)',
                            backgroundSize: `${activeScale.width}px 100%`,
                            cursor: isDragging ? 'grabbing' : isDraggable ? 'grab' : onTaskSelect ? 'pointer' : 'default',
                            transition: 'opacity 120ms ease',
                          }}
                        >
                          <Tooltip title={`${row.title}: ${rowStart.format('MMM D HH:mm')} - ${rowEnd.format('MMM D HH:mm')}`}>
                            <Box
                              sx={{
                                position: 'absolute',
                                left,
                                top: Math.max(8, (rowHeight - 24) / 2),
                                width,
                                height: 24,
                                borderRadius: 999,
                                overflow: 'hidden',
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.10)',
                                outline: selected ? `2px solid ${theme.palette.warning.main}` : 'none',
                                outlineOffset: 2,
                              }}
                            >
                              <Box sx={{ height: '100%', width: `${progress}%`, backgroundColor: barColor }} />
                              <Typography
                                sx={{
                                  position: 'absolute',
                                  inset: 0,
                                  px: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: '#fff',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  textShadow: '0 1px 4px rgba(0,0,0,0.45)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {row.code}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <CTableGroupMenu
        groupAnchorEl={ctable.groupAnchorEl}
        setGroupAnchorEl={ctable.setGroupAnchorEl}
        grouping={ctable.grouping}
        setGrouping={ctable.setGrouping}
        columns={ctable.columns}
        toggleGroupField={ctable.toggleGroupField}
      />
      <CTableColumnMenu
        anchorEl={ctable.anchorEl}
        setAnchorEl={ctable.setAnchorEl}
        columns={ctable.columns}
        visibleColumns={ctable.visibleColumns}
        toggleColumnVisibility={ctable.toggleColumnVisibility}
      />
    </CPaper>
  );
};
