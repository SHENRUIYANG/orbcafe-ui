import type { HTMLAttributes, ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import type { TreeMenuItem } from '../Navigation-Island/tree-menu';
import type { CTableProps } from '../StdReport/Hooks/CTable/types';
import type { CSmartFilterProps } from '../StdReport/CSmartFilter';
import type { CAppHeaderUser, CAppHeaderUserMenuItem } from '../PageLayout/types';
import type { OrbcafeLocale } from '../../i18n';

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

export interface PBarcodeScannerDetectedValue {
  rawValue: string;
  format?: string;
}

export interface PBarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  formats?: string[];
  facingMode?: 'environment' | 'user';
  manualEntry?: boolean;
  autoCloseOnDetect?: boolean;
  scanIntervalMs?: number;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  manualPlaceholder?: string;
  onDetected?: (value: PBarcodeScannerDetectedValue) => void;
  onError?: (message: string) => void;
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

export interface PSmartFilterProps extends CSmartFilterProps {
  touchMode?: 'comfortable' | 'expanded';
  sx?: SxProps<Theme>;
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
  workloadSelectedId?: string;
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

  // New props for parity with CAppPageLayout
  locale?: OrbcafeLocale;
  localeLabel?: string;
  localeOptions?: OrbcafeLocale[];
  onLocaleChange?: (locale: OrbcafeLocale) => void;
  onUserSetting?: () => void;
  onUserLogout?: () => void;
  userMenuItems?: CAppHeaderUserMenuItem[];
  leftHeaderSlot?: ReactNode;
  rightHeaderSlot?: ReactNode;
}
