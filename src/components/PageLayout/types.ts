import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import type { NavigationIslandDisplayMode } from '../Navigation-Island/navigation-island';
import type { TreeMenuItem } from '../Navigation-Island/tree-menu';
import type { OrbcafeLocale } from '../../i18n';

export interface CAppHeaderUser {
  name: string;
  subtitle?: string;
  avatarText?: string;
  avatarSrc?: string;
}

export interface CAppHeaderUserMenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export type CAppHeaderSearchPlacement = 'header' | 'floating' | 'hidden';

export interface CAppHeaderProps {
  appTitle: string;
  logo?: ReactNode;
  mode?: 'light' | 'dark' | 'system';
  onToggleMode?: () => void;
  locale?: OrbcafeLocale;
  localeLabel?: string;
  localeOptions?: OrbcafeLocale[];
  onLocaleChange?: (locale: OrbcafeLocale) => void;
  searchPlaceholder?: string;
  /** Header AI input is opt-in. Defaults to false. */
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  onSearchAdd?: () => void;
  user?: CAppHeaderUser;
  onUserSetting?: () => void;
  onUserLogout?: () => void;
  userMenuItems?: CAppHeaderUserMenuItem[];
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export interface CAppPageLayoutProps {
  appTitle: string;
  menuData?: TreeMenuItem[];
  children: ReactNode;
  showNavigation?: boolean;
  locale?: OrbcafeLocale;
  localeLabel?: string;
  localeOptions?: OrbcafeLocale[];
  onLocaleChange?: (locale: OrbcafeLocale) => void;
  user?: CAppHeaderUser;
  onUserSetting?: () => void;
  onUserLogout?: () => void;
  userMenuItems?: CAppHeaderUserMenuItem[];
  logo?: ReactNode;
  searchPlaceholder?: string;
  /** Defaults to hidden so standard layouts do not show the header AI input unless explicitly requested. */
  searchPlacement?: CAppHeaderSearchPlacement;
  floatingSearchSx?: SxProps<Theme>;
  onSearch?: (query: string) => void;
  onSearchAdd?: () => void;
  rightHeaderSlot?: ReactNode;
  leftHeaderSlot?: ReactNode;
  contentSx?: SxProps<Theme>;
  navigationMode?: NavigationIslandDisplayMode;
  defaultNavigationMode?: NavigationIslandDisplayMode;
  onNavigationModeChange?: (mode: NavigationIslandDisplayMode) => void;
  showNavigationModeToggle?: boolean;
  enableNavigationPinning?: boolean;
  navigationPinStorageKey?: string;
  pinnedNavigationItemIds?: string[];
  defaultPinnedNavigationItemIds?: string[];
  onPinnedNavigationItemIdsChange?: (ids: string[]) => void;
  pinnedNavigationSectionTitle?: string;
}
