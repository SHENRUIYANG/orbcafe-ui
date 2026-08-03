import { SxProps, Theme } from '../../lib/orbis-compat';
import type { ReactNode } from 'react';

export type PlanningGanttScale = 'hour' | 'day' | 'week' | 'month';
export type PlanningTaskStatus = 'not-started' | 'planned' | 'in-progress' | 'blocked' | 'done' | string;

export interface PlanningTaskOwner {
  name: string;
  avatarSrc?: string;
  initials?: string;
}

export interface PlanningTaskRecord {
  id: string;
  title: string;
  code?: string;
  startDate: string;
  endDate: string;
  progress?: number;
  status?: PlanningTaskStatus;
  owner?: PlanningTaskOwner;
  project?: string;
  workCenter?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dependencyIds?: string[];
  color?: string;
  reorderable?: boolean;
  children?: PlanningTaskRecord[];
}

export interface PlanningGanttColumn {
  id: 'code' | 'title' | 'project' | 'workCenter' | 'owner' | 'status' | 'progress' | string;
  label: string;
  width?: number;
  render?: (task: PlanningTaskRecord) => ReactNode;
}

export interface PlanningGanttSummaryItem {
  label: string;
  value: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export interface CPlanningGanttProps {
  appId?: string;
  tableKey?: string;
  serviceUrl?: string;
  title?: string;
  subtitle?: string;
  extraTools?: ReactNode | ReactNode[];
  bodyHeight?: number | string;
  tasks: PlanningTaskRecord[];
  columns?: PlanningGanttColumn[];
  scale?: PlanningGanttScale;
  onScaleChange?: (scale: PlanningGanttScale) => void;
  page?: number;
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  count?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  timelineStart?: string;
  timelineEnd?: string;
  selectedTaskId?: string;
  onTaskSelect?: (task: PlanningTaskRecord) => void;
  enableRowReorder?: boolean;
  onTaskReorder?: (
    orderedTasks: PlanningTaskRecord[],
    context: { activeTask: PlanningTaskRecord; targetTask: PlanningTaskRecord },
  ) => void;
  layout?: any;
  layoutVariant?: any;
  layoutVariantLoadKey?: number;
  onLayoutIdChange?: (layoutId: string) => void;
  onLayoutSave?: (layout: any) => void;
  summaryItems?: PlanningGanttSummaryItem[];
  emptyLabel?: string;
  sx?: SxProps<Theme>;
}
