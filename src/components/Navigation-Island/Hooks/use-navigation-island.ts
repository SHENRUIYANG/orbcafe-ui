import { useCallback, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { NavigationIslandDisplayMode, NavigationIslandProps } from '../navigation-island';
import type { TreeMenuItem } from '../tree-menu';

export interface UseNavigationIslandOptions {
  initialCollapsed?: boolean;
  initialDisplayMode?: NavigationIslandDisplayMode;
  content?: TreeMenuItem[];
  enablePinning?: boolean;
  pinStorageKey?: string;
  pinnedItemIds?: string[];
  defaultPinnedItemIds?: string[];
  onPinnedItemIdsChange?: (ids: string[]) => void;
  pinnedSectionTitle?: string;
}

export interface UseNavigationIslandResult {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  toggleCollapsed: () => void;
  displayMode: NavigationIslandDisplayMode;
  setDisplayMode: Dispatch<SetStateAction<NavigationIslandDisplayMode>>;
  toggleDisplayMode: () => void;
  menuData: TreeMenuItem[];
  setMenuData: Dispatch<SetStateAction<TreeMenuItem[]>>;
  navigationIslandProps: Pick<
    NavigationIslandProps,
    | 'collapsed'
    | 'onToggle'
    | 'menuData'
    | 'displayMode'
    | 'onDisplayModeChange'
    | 'enablePinning'
    | 'pinStorageKey'
    | 'pinnedItemIds'
    | 'defaultPinnedItemIds'
    | 'onPinnedItemIdsChange'
    | 'pinnedSectionTitle'
  >;
}

/**
 * Hook for wiring NavigationIsland in a controlled and reusable way.
 * Pass your menu structure once, then spread `navigationIslandProps` to the component.
 */
export const useNavigationIsland = (
  options: UseNavigationIslandOptions = {},
): UseNavigationIslandResult => {
  const {
    initialCollapsed = false,
    initialDisplayMode = 'fixed',
    content = [],
    enablePinning,
    pinStorageKey,
    pinnedItemIds,
    defaultPinnedItemIds,
    onPinnedItemIdsChange,
    pinnedSectionTitle,
  } = options;

  const [collapsed, setCollapsed] = useState<boolean>(initialCollapsed);
  const [displayMode, setDisplayMode] = useState<NavigationIslandDisplayMode>(initialDisplayMode);
  const [menuData, setMenuData] = useState<TreeMenuItem[]>(content);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const toggleDisplayMode = useCallback(() => {
    setDisplayMode((prev) => (prev === 'fixed' ? 'floating' : 'fixed'));
  }, []);

  const navigationIslandProps = useMemo(
    () => ({
      collapsed,
      onToggle: toggleCollapsed,
      menuData,
      displayMode,
      onDisplayModeChange: setDisplayMode,
      enablePinning,
      pinStorageKey,
      pinnedItemIds,
      defaultPinnedItemIds,
      onPinnedItemIdsChange,
      pinnedSectionTitle,
    }),
    [
      collapsed,
      toggleCollapsed,
      menuData,
      displayMode,
      setDisplayMode,
      enablePinning,
      pinStorageKey,
      pinnedItemIds,
      defaultPinnedItemIds,
      onPinnedItemIdsChange,
      pinnedSectionTitle,
    ],
  );

  return {
    collapsed,
    setCollapsed,
    toggleCollapsed,
    displayMode,
    setDisplayMode,
    toggleDisplayMode,
    menuData,
    setMenuData,
    navigationIslandProps,
  };
};
