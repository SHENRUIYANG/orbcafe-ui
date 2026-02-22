'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TreeMenuItem } from '../../Navigation-Island/tree-menu';
import { useNavigationIsland } from '../../Navigation-Island/Hooks/use-navigation-island';

export interface UsePageLayoutOptions {
  menuData?: TreeMenuItem[];
  initialNavigationCollapsed?: boolean;
}

export const usePageLayout = ({
  menuData = [],
  initialNavigationCollapsed = false,
}: UsePageLayoutOptions = {}) => {
  const { navigationIslandProps } = useNavigationIsland({
    initialCollapsed: initialNavigationCollapsed,
    content: menuData,
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

