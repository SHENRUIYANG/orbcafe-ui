'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import type { CSmartFilterProps, FilterField, FilterValue } from '../../StdReport/CSmartFilter';
import type { CPlanningGanttProps, PlanningGanttScale, PlanningTaskRecord } from '../types';

export interface UsePlanningGanttOptions {
  tasks: PlanningTaskRecord[];
  appId?: string;
  tableKey?: string;
  defaultScale?: PlanningGanttScale;
  defaultSelectedTaskId?: string;
  initialFilters?: Record<string, FilterValue>;
  filterFields?: FilterField[];
  /**
   * @deprecated Use appId so SmartFilter variants and table layouts share one persistence namespace.
   */
  filterAppId?: string;
  /**
   * @deprecated Use tableKey so SmartFilter variants and table layouts share one persistence scope.
   */
  filterTableKey?: string;
  serviceUrl?: CSmartFilterProps['serviceUrl'];
  variantService?: CSmartFilterProps['variantService'];
  layout?: CPlanningGanttProps['layout'];
  columns?: CPlanningGanttProps['columns'];
  page?: CPlanningGanttProps['page'];
  rowsPerPage?: CPlanningGanttProps['rowsPerPage'];
  rowsPerPageOptions?: CPlanningGanttProps['rowsPerPageOptions'];
  count?: CPlanningGanttProps['count'];
  onPageChange?: CPlanningGanttProps['onPageChange'];
  onRowsPerPageChange?: CPlanningGanttProps['onRowsPerPageChange'];
  onFilterSearch?: () => void;
  onFilterVariantLoad?: CSmartFilterProps['onVariantLoad'];
  enableRowReorder?: CPlanningGanttProps['enableRowReorder'];
  onTaskReorder?: CPlanningGanttProps['onTaskReorder'];
  onLayoutIdChange?: CPlanningGanttProps['onLayoutIdChange'];
  onLayoutSave?: CPlanningGanttProps['onLayoutSave'];
}

export interface UsePlanningGanttResult {
  scale: PlanningGanttScale;
  setScale: (scale: PlanningGanttScale) => void;
  selectedTaskId: string;
  setSelectedTaskId: (taskId: string) => void;
  filters: Record<string, FilterValue>;
  setFilters: (filters: Record<string, FilterValue>) => void;
  filteredTasks: PlanningTaskRecord[];
  smartFilterProps: Pick<
    CSmartFilterProps,
    | 'fields'
    | 'filters'
    | 'onFilterChange'
    | 'onVariantLoad'
    | 'onSearch'
    | 'appId'
    | 'tableKey'
    | 'currentLayoutId'
    | 'layoutRefs'
    | 'variantService'
    | 'serviceUrl'
  >;
  planningGanttProps: Pick<
    CPlanningGanttProps,
    | 'appId'
    | 'tableKey'
    | 'serviceUrl'
    | 'tasks'
    | 'columns'
    | 'scale'
    | 'onScaleChange'
    | 'page'
    | 'rowsPerPage'
    | 'rowsPerPageOptions'
    | 'count'
    | 'onPageChange'
    | 'onRowsPerPageChange'
    | 'selectedTaskId'
    | 'onTaskSelect'
    | 'enableRowReorder'
    | 'onTaskReorder'
    | 'layout'
    | 'layoutVariant'
    | 'layoutVariantLoadKey'
    | 'onLayoutIdChange'
    | 'onLayoutSave'
  >;
}

const DEFAULT_FILTERS: Record<string, FilterValue> = {
  keyword: { value: '', operator: 'contains' },
  status: { value: '', operator: 'equals' },
  owner: { value: '', operator: 'contains' },
  workCenter: { value: '', operator: 'contains' },
};

const DEFAULT_FILTER_FIELDS: FilterField[] = [
  { id: 'keyword', label: 'Keyword', type: 'text', placeholder: 'Task/ID/Project', hasSearchIcon: true },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'In progress', value: 'in-progress' },
      { label: 'Blocked', value: 'blocked' },
      { label: 'Planned', value: 'planned' },
      { label: 'Not started', value: 'not-started' },
    ],
  },
  { id: 'owner', label: 'Owner', type: 'text', placeholder: 'Owner name' },
  { id: 'workCenter', label: 'Work Center', type: 'text', placeholder: 'CNC-02 / WH-A / ...' },
  { id: 'dateRange', label: 'Date Range', type: 'date' },
];

export const usePlanningGantt = ({
  tasks,
  appId,
  tableKey,
  defaultScale = 'week',
  defaultSelectedTaskId,
  initialFilters,
  filterFields,
  filterAppId,
  filterTableKey,
  serviceUrl,
  variantService,
  layout,
  columns,
  page,
  rowsPerPage,
  rowsPerPageOptions,
  count,
  onPageChange,
  onRowsPerPageChange,
  onFilterSearch,
  onFilterVariantLoad,
  enableRowReorder,
  onTaskReorder,
  onLayoutIdChange,
  onLayoutSave,
}: UsePlanningGanttOptions): UsePlanningGanttResult => {
  const resolvedAppId = appId ?? filterAppId ?? 'planning-gantt';
  const resolvedTableKey = tableKey ?? filterTableKey ?? 'planning';
  const [scale, setScale] = useState<PlanningGanttScale>(defaultScale);
  const [selectedTaskId, setSelectedTaskId] = useState(defaultSelectedTaskId ?? tasks[0]?.id ?? '');
  const [currentLayoutId, setCurrentLayoutId] = useState('');
  const [layoutVariantLoadRequest, setLayoutVariantLoadRequest] = useState<{ key: number; variant: any } | null>(null);
  const [filters, setFilters] = useState<Record<string, FilterValue>>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const filteredTasks = useMemo(() => {
    const keyword = String(filters.keyword?.value ?? '').trim().toLowerCase();
    const status = String(filters.status?.value ?? '').trim();
    const owner = String(filters.owner?.value ?? '').trim().toLowerCase();
    const workCenter = String(filters.workCenter?.value ?? '').trim().toLowerCase();
    const dateRange = filters.dateRange?.value as [unknown, unknown] | undefined;
    const dateStart = dateRange?.[0] ? dayjs(dateRange[0] as string) : null;
    const dateEnd = dateRange?.[1] ? dayjs(dateRange[1] as string) : null;

    return tasks.filter((task) => {
      if (keyword) {
        const haystack = [task.id, task.code, task.title, task.project, task.workCenter, task.owner?.name].join(' ').toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }

      if (status && task.status !== status) return false;

      if (owner && !String(task.owner?.name ?? '').toLowerCase().includes(owner)) return false;
      if (workCenter && !String(task.workCenter ?? '').toLowerCase().includes(workCenter)) return false;

      if (dateStart || dateEnd) {
        const taskStart = dayjs(task.startDate);
        const taskEnd = dayjs(task.endDate);
        const overlapsStart = dateStart ? taskEnd.isAfter(dateStart) || taskEnd.isSame(dateStart, 'day') : true;
        const overlapsEnd = dateEnd ? taskStart.isBefore(dateEnd) || taskStart.isSame(dateEnd, 'day') : true;
        if (!overlapsStart || !overlapsEnd) return false;
      }

      return true;
    });
  }, [filters, tasks]);

  useEffect(() => {
    if (filteredTasks.length === 0) return;
    if (!filteredTasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(filteredTasks[0].id);
    }
  }, [filteredTasks, selectedTaskId]);

  const onTaskSelect = useCallback((task: PlanningTaskRecord) => {
    setSelectedTaskId(task.id);
  }, []);

  const handleLayoutIdChange = useCallback((layoutId: string) => {
    setCurrentLayoutId(layoutId);
    onLayoutIdChange?.(layoutId);
  }, [onLayoutIdChange]);

  const handleFilterVariantLoad = useCallback<CSmartFilterProps['onVariantLoad']>((variant) => {
    setLayoutVariantLoadRequest((current) => ({
      key: (current?.key ?? 0) + 1,
      variant,
    }));
    onFilterVariantLoad?.(variant);
  }, [onFilterVariantLoad]);

  const smartFilterProps = useMemo<UsePlanningGanttResult['smartFilterProps']>(
    () => ({
      appId: resolvedAppId,
      tableKey: resolvedTableKey,
      fields: filterFields ?? DEFAULT_FILTER_FIELDS,
      filters,
      onFilterChange: setFilters,
      onVariantLoad: handleFilterVariantLoad,
      onSearch: onFilterSearch ?? (() => {}),
      currentLayoutId,
      layoutRefs: [{ tableKey: resolvedTableKey, layoutId: currentLayoutId || null }],
      variantService,
      serviceUrl,
    }),
    [
      currentLayoutId,
      filterFields,
      filters,
      handleFilterVariantLoad,
      onFilterSearch,
      resolvedAppId,
      resolvedTableKey,
      serviceUrl,
      variantService,
    ],
  );

  const planningGanttProps = useMemo<UsePlanningGanttResult['planningGanttProps']>(
    () => ({
      appId: resolvedAppId,
      tableKey: resolvedTableKey,
      serviceUrl,
      tasks: filteredTasks,
      columns,
      scale,
      onScaleChange: setScale,
      page,
      rowsPerPage,
      rowsPerPageOptions,
      count,
      onPageChange,
      onRowsPerPageChange,
      selectedTaskId,
      onTaskSelect,
      enableRowReorder,
      onTaskReorder,
      layout,
      layoutVariant: layoutVariantLoadRequest?.variant,
      layoutVariantLoadKey: layoutVariantLoadRequest?.key,
      onLayoutIdChange: handleLayoutIdChange,
      onLayoutSave,
    }),
    [
      columns,
      count,
      enableRowReorder,
      filteredTasks,
      handleLayoutIdChange,
      layout,
      layoutVariantLoadRequest?.key,
      layoutVariantLoadRequest?.variant,
      onPageChange,
      onRowsPerPageChange,
      onLayoutSave,
      onTaskReorder,
      onTaskSelect,
      page,
      resolvedAppId,
      resolvedTableKey,
      rowsPerPage,
      rowsPerPageOptions,
      scale,
      serviceUrl,
      selectedTaskId,
    ],
  );

  return {
    scale,
    setScale,
    selectedTaskId,
    setSelectedTaskId,
    filters,
    setFilters,
    filteredTasks,
    smartFilterProps,
    planningGanttProps,
  };
};
