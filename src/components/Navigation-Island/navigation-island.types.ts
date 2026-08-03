import type { TreeMenuItem } from './tree-menu';

export type NavigationIslandDisplayMode = 'fixed' | 'floating';

export interface NavigationIslandProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
  maxHeight?: number;
  menuData?: TreeMenuItem[];
  colorMode?: 'light' | 'dark';
  displayMode?: NavigationIslandDisplayMode;
  onDisplayModeChange?: (mode: NavigationIslandDisplayMode) => void;
  showDisplayModeToggle?: boolean;
  enablePinning?: boolean;
  pinStorageKey?: string;
  pinnedItemIds?: string[];
  defaultPinnedItemIds?: string[];
  onPinnedItemIdsChange?: (ids: string[]) => void;
  pinnedSectionTitle?: string;
}
