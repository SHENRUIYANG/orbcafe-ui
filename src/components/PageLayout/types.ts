import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import type { TreeMenuItem } from '../Navigation-Island/tree-menu';

export interface CAppHeaderUser {
  name: string;
  subtitle?: string;
  avatarText?: string;
  avatarSrc?: string;
}

export interface CAppHeaderProps {
  appTitle: string;
  logo?: ReactNode;
  mode?: 'light' | 'dark' | 'system';
  onToggleMode?: () => void;
  localeLabel?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  user?: CAppHeaderUser;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export interface CAppPageLayoutProps {
  appTitle: string;
  menuData?: TreeMenuItem[];
  children: ReactNode;
  showNavigation?: boolean;
  localeLabel?: string;
  user?: CAppHeaderUser;
  logo?: ReactNode;
  onSearch?: (query: string) => void;
  rightHeaderSlot?: ReactNode;
  leftHeaderSlot?: ReactNode;
  contentSx?: SxProps<Theme>;
}
