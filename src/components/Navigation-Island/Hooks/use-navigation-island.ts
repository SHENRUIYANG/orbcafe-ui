import { useCallback, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { NavigationIslandProps } from '../navigation-island';
import type { TreeMenuItem } from '../tree-menu';

export interface UseNavigationIslandOptions {
  initialCollapsed?: boolean;
  content?: TreeMenuItem[];
}

export interface UseNavigationIslandResult {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  toggleCollapsed: () => void;
  menuData: TreeMenuItem[];
  setMenuData: Dispatch<SetStateAction<TreeMenuItem[]>>;
  navigationIslandProps: Pick<NavigationIslandProps, 'collapsed' | 'onToggle' | 'menuData'>;
}

/**
 * Hook for wiring NavigationIsland in a controlled and reusable way.
 * Pass your menu structure once, then spread `navigationIslandProps` to the component.
 */
export const useNavigationIsland = (
  options: UseNavigationIslandOptions = {},
): UseNavigationIslandResult => {
  const { initialCollapsed = false, content = [] } = options;

  const [collapsed, setCollapsed] = useState<boolean>(initialCollapsed);
  const [menuData, setMenuData] = useState<TreeMenuItem[]>(content);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const navigationIslandProps = useMemo(
    () => ({
      collapsed,
      onToggle: toggleCollapsed,
      menuData,
    }),
    [collapsed, toggleCollapsed, menuData],
  );

  return {
    collapsed,
    setCollapsed,
    toggleCollapsed,
    menuData,
    setMenuData,
    navigationIslandProps,
  };
};

