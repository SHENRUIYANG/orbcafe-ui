import type { CSSProperties } from 'react';
import type { ReactNode } from 'react';
import type { NavigationIslandDisplayMode } from '../Navigation-Island/navigation-island.types';
import type { TreeMenuItem } from '../Navigation-Island/tree-menu';
import type { OrbcafeLocale } from '../../i18n';
import type { OrbModeSetting } from '../../lib/theme';

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
export type CAppNavigationVariant = 'classic' | 'v2';

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
  onUserRefresh?: () => void;
  onUserSetting?: () => void;
  onUserLogout?: () => void;
  userMenuItems?: CAppHeaderUserMenuItem[];
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export interface CAppPageLayoutProps {
  /** Stable application identity used to namespace persisted layout preferences. */
  appId?: string;
  appTitle: string;
  menuData?: TreeMenuItem[];
  children: ReactNode;
  showNavigation?: boolean;
  /** Active locale in controlled mode; otherwise the initial locale. Defaults to English. */
  locale?: OrbcafeLocale;
  localeLabel?: string;
  localeOptions?: OrbcafeLocale[];
  /** Controls locale externally. When omitted, the layout switches and persists locale internally. */
  onLocaleChange?: (locale: OrbcafeLocale) => void;
  /** Controlled ORBIS color-mode setting. */
  mode?: OrbModeSetting;
  /** Initial color-mode setting for uncontrolled usage. Defaults to system. */
  defaultMode?: OrbModeSetting;
  /** Called after the header color-mode action requests a new setting. */
  onModeChange?: (mode: OrbModeSetting) => void;
  user?: CAppHeaderUser;
  onUserRefresh?: () => void;
  onUserSetting?: () => void;
  onUserLogout?: () => void;
  userMenuItems?: CAppHeaderUserMenuItem[];
  logo?: ReactNode;
  searchPlaceholder?: string;
  /** Defaults to hidden so standard layouts do not show the header AI input unless explicitly requested. */
  searchPlacement?: CAppHeaderSearchPlacement;
  floatingSearchSx?: CSSProperties;
  onSearch?: (query: string) => void;
  onSearchAdd?: () => void;
  rightHeaderSlot?: ReactNode;
  leftHeaderSlot?: ReactNode;
  contentSx?: CSSProperties;
  /** Selects the navigation island visual generation. Defaults to classic. */
  navigationVariant?: CAppNavigationVariant;
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
