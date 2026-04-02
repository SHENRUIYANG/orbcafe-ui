import type { HTMLAttributes, ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import type { TreeMenuItem } from '../Navigation-Island/tree-menu';
import type { CTableProps } from '../StdReport/Hooks/CTable/types';
import type { CAppHeaderUser } from '../PageLayout/types';

export type POrientation = 'auto' | 'portrait' | 'landscape';

export interface PTouchCardSwipeAction {
  id: string;
  label: string;
  icon?: ReactNode;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  backgroundColor?: string;
  onTrigger?: () => void;
}

export interface PTouchCardMetric {
  id: string;
  label: string;
  value: ReactNode;
}

export interface PTouchCardProps {
  title: ReactNode;
  description?: ReactNode;
  kicker?: ReactNode;
  icon?: ReactNode;
  badges?: ReactNode[];
  metrics?: PTouchCardMetric[];
  footer?: ReactNode;
  children?: ReactNode;
  selected?: boolean;
  draggable?: boolean;
  isDragging?: boolean;
  swipeThreshold?: number;
  startAction?: PTouchCardSwipeAction;
  endAction?: PTouchCardSwipeAction;
  dragHandleProps?: HTMLAttributes<HTMLElement>;
  onClick?: () => void;
  onSwipe?: (direction: 'start' | 'end') => void;
  sx?: SxProps<Theme>;
}

export interface PNumericKeypadProps {
  value?: string;
  defaultValue?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  placeholder?: string;
  allowDecimal?: boolean;
  allowNegative?: boolean;
  maxLength?: number;
  confirmLabel?: ReactNode;
  clearLabel?: ReactNode;
  backspaceLabel?: ReactNode;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClose?: () => void;
  sx?: SxProps<Theme>;
}

export interface PWorkloadNavItem {
  id: string;
  title: string;
  description?: string;
  caption?: string;
  badge?: string | number;
  icon?: ReactNode;
  href?: string;
  color?: string;
  disabled?: boolean;
}

export interface PWorkloadNavProps {
  items: PWorkloadNavItem[];
  selectedId?: string;
  orientation?: POrientation;
  onItemSelect?: (item: PWorkloadNavItem) => void;
  sx?: SxProps<Theme>;
}

export interface PNavIslandProps {
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
  maxHeight?: number;
  menuData?: TreeMenuItem[];
  colorMode?: 'light' | 'dark';
  orientation?: POrientation;
  headerSlot?: ReactNode;
  footerSlot?: ReactNode;
  activeHref?: string;
  onItemSelect?: (item: TreeMenuItem) => void;
}

export interface PTableProps extends CTableProps {
  orientation?: POrientation;
  cardTitleField?: string;
  cardSubtitleFields?: string[];
  toolbarSlot?: ReactNode;
  emptyState?: ReactNode;
  rowHeight?: 'compact' | 'comfortable';
  cardActionSlot?: (row: Record<string, any>) => ReactNode;
  renderCardFooter?: (row: Record<string, any>) => ReactNode;
  onRowClick?: (row: Record<string, any>) => void;
}

export interface PAppPageLayoutProps {
  appTitle: string;
  children: ReactNode;
  menuData?: TreeMenuItem[];
  workloadItems?: PWorkloadNavItem[];
  showNavigation?: boolean;
  showWorkloadNav?: boolean;
  orientation?: POrientation;
  logo?: ReactNode;
  headerSlot?: ReactNode;
  actionSlot?: ReactNode;
  portraitBottomSlot?: ReactNode;
  contentSx?: SxProps<Theme>;
  containerSx?: SxProps<Theme>;
  user?: CAppHeaderUser;
  onSearch?: (query: string) => void;
  defaultNavigationOpen?: boolean;
  navOpen?: boolean;
  onNavOpenChange?: (open: boolean) => void;
  onWorkloadSelect?: (item: PWorkloadNavItem) => void;
}
