'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TreeMenuItem } from '../../Navigation-Island/tree-menu';
import type { NavigationIslandDisplayMode } from '../../Navigation-Island/navigation-island';
import { useNavigationIsland } from '../../Navigation-Island/Hooks/use-navigation-island';

export interface UsePageLayoutOptions {
  menuData?: TreeMenuItem[];
  initialNavigationCollapsed?: boolean;
  initialNavigationMode?: NavigationIslandDisplayMode;
  enableNavigationPinning?: boolean;
  navigationPinStorageKey?: string;
  pinnedNavigationItemIds?: string[];
  defaultPinnedNavigationItemIds?: string[];
  onPinnedNavigationItemIdsChange?: (ids: string[]) => void;
  pinnedNavigationSectionTitle?: string;
}

export const usePageLayout = ({
  menuData = [],
  initialNavigationCollapsed = false,
  initialNavigationMode = 'fixed',
  enableNavigationPinning,
  navigationPinStorageKey,
  pinnedNavigationItemIds,
  defaultPinnedNavigationItemIds,
  onPinnedNavigationItemIdsChange,
  pinnedNavigationSectionTitle,
}: UsePageLayoutOptions = {}) => {
  const { navigationIslandProps } = useNavigationIsland({
    initialCollapsed: initialNavigationCollapsed,
    initialDisplayMode: initialNavigationMode,
    content: menuData,
    enablePinning: enableNavigationPinning,
    pinStorageKey: navigationPinStorageKey,
    pinnedItemIds: pinnedNavigationItemIds,
    defaultPinnedItemIds: defaultPinnedNavigationItemIds,
    onPinnedItemIdsChange: onPinnedNavigationItemIdsChange,
    pinnedSectionTitle: pinnedNavigationSectionTitle,
  });

  const [windowHeight, setWindowHeight] = useState(900);

  useEffect(() => {
    const onResize = () => setWindowHeight(window.innerHeight);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navigationMaxHeight = useMemo(() => Math.max(280, windowHeight - 100), [windowHeight]);

  return {
    navigationIslandProps,
    navigationMaxHeight,
  };
};
