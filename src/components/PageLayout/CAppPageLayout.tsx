'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material';
import { NavigationIsland } from '../Navigation-Island/navigation-island';
import { CAppHeader, CAppHeaderSearch } from './Components/CAppHeader';
import { usePageLayout } from './Hooks/usePageLayout';
import type { CAppPageLayoutProps } from './types';
import { OrbcafeI18nProvider } from '../../i18n';

const FLOATING_NAV_INSET = 12;
const FLOATING_NAV_COLLAPSED_WIDTH = 56;
const FLOATING_NAV_EXPANDED_WIDTH = 234;

const createNavigationPinStorageKey = (appTitle: string) =>
  `orbcafe:page-layout:${appTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'app'}:pinned-navigation-items`;

type FloatingNavigationHorizontalAnchor = 'left' | 'right';

interface FloatingNavigationPosition {
  x: number;
  y: number;
}

interface FloatingNavigationDragState {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

const shouldIgnoreFloatingDrag = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('button,input,a,textarea,select,[role="button"],[contenteditable="true"]'));
};

export const CAppPageLayout = ({
  appTitle,
  menuData = [],
  children,
  showNavigation = true,
  locale = 'en',
  localeLabel,
  localeOptions,
  onLocaleChange,
  user,
  onUserSetting,
  onUserLogout,
  userMenuItems,
  logo,
  searchPlaceholder,
  searchPlacement = 'hidden',
  floatingSearchSx,
  onSearch,
  onSearchAdd,
  rightHeaderSlot,
  leftHeaderSlot,
  contentSx,
  navigationMode,
  defaultNavigationMode = 'fixed',
  onNavigationModeChange,
  showNavigationModeToggle = true,
  enableNavigationPinning = true,
  navigationPinStorageKey,
  pinnedNavigationItemIds,
  defaultPinnedNavigationItemIds,
  onPinnedNavigationItemIdsChange,
  pinnedNavigationSectionTitle,
}: CAppPageLayoutProps) => {
  const modeStorageKey = 'orbcafe:page-layout-mode';
  const navigationModeStorageKey = 'orbcafe:page-layout-navigation-mode';
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>('system');
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>('light');
  const [hydrated, setHydrated] = useState(false);
  const [navigationModeHydrated, setNavigationModeHydrated] = useState(false);
  const [internalNavigationMode, setInternalNavigationMode] = useState(defaultNavigationMode);
  const [floatingNavigationPosition, setFloatingNavigationPosition] = useState<FloatingNavigationPosition>({
    x: FLOATING_NAV_INSET,
    y: FLOATING_NAV_INSET,
  });
  const [floatingNavigationHorizontalAnchor, setFloatingNavigationHorizontalAnchor] =
    useState<FloatingNavigationHorizontalAnchor>('left');
  const [isDraggingFloatingNavigation, setIsDraggingFloatingNavigation] = useState(false);
  const floatingNavigationRef = useRef<HTMLDivElement | null>(null);
  const floatingNavigationDragRef = useRef<FloatingNavigationDragState | null>(null);
  const isNavigationModeControlled = navigationMode !== undefined;
  const effectiveNavigationMode = navigationMode ?? internalNavigationMode;
  const isFloatingNavigation = effectiveNavigationMode === 'floating';
  const showHeaderSearch = searchPlacement === 'header';
  const effectiveMode: 'light' | 'dark' =
    mode === 'system' ? (hydrated ? systemMode : 'light') : mode;

  useEffect(() => {
    try {
      const savedMode = window.localStorage.getItem(modeStorageKey);
      if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
        setMode(savedMode);
      }
    } catch {
      // ignore storage access failures
    }

    setHydrated(true);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      setSystemMode(media.matches ? 'dark' : 'light');
    };
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(modeStorageKey, mode);
    } catch {
      // ignore storage access failures
    }
  }, [hydrated, mode]);

  useEffect(() => {
    if (isNavigationModeControlled) {
      setNavigationModeHydrated(true);
      return;
    }

    try {
      const savedNavigationMode = window.localStorage.getItem(navigationModeStorageKey);
      if (savedNavigationMode === 'fixed' || savedNavigationMode === 'floating') {
        setInternalNavigationMode(savedNavigationMode);
      }
    } catch {
      // ignore storage access failures
    } finally {
      setNavigationModeHydrated(true);
    }
  }, [isNavigationModeControlled]);

  useEffect(() => {
    if (!navigationModeHydrated) return;
    try {
      window.localStorage.setItem(navigationModeStorageKey, effectiveNavigationMode);
    } catch {
      // ignore storage access failures
    }
  }, [effectiveNavigationMode, navigationModeHydrated]);

  // Sync effectiveMode to document for Tailwind dark variant and native scrollbars
  useEffect(() => {
    if (effectiveMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [effectiveMode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: effectiveMode,
        },
      }),
    [effectiveMode],
  );

  const setEffectiveNavigationMode = useCallback(
    (nextMode: typeof effectiveNavigationMode) => {
      if (!isNavigationModeControlled) {
        setInternalNavigationMode(nextMode);
      }
      onNavigationModeChange?.(nextMode);
    },
    [isNavigationModeControlled, onNavigationModeChange],
  );

  const { navigationIslandProps, navigationMaxHeight } = usePageLayout({
    menuData,
    initialNavigationCollapsed: false,
    initialNavigationMode: effectiveNavigationMode,
    enableNavigationPinning,
    navigationPinStorageKey: navigationPinStorageKey ?? createNavigationPinStorageKey(appTitle),
    pinnedNavigationItemIds,
    defaultPinnedNavigationItemIds,
    onPinnedNavigationItemIdsChange,
    pinnedNavigationSectionTitle,
  });
  const navigationIsCollapsed = navigationIslandProps.collapsed;

  const clampFloatingNavigationPosition = useCallback((position: FloatingNavigationPosition) => {
    const floatingNavigation = floatingNavigationRef.current;
    const container = floatingNavigation?.parentElement;
    if (!floatingNavigation || !container) return position;

    const containerRect = container.getBoundingClientRect();
    const navigationRect = floatingNavigation.getBoundingClientRect();
    const minX = FLOATING_NAV_INSET;
    const minY = FLOATING_NAV_INSET;
    const maxX = Math.max(minX, containerRect.width - navigationRect.width - FLOATING_NAV_INSET);
    const maxY = Math.max(minY, containerRect.height - navigationRect.height - FLOATING_NAV_INSET);

    return {
      x: clampNumber(position.x, minX, maxX),
      y: clampNumber(position.y, minY, maxY),
    };
  }, []);

  const snapFloatingNavigationPosition = useCallback((position: FloatingNavigationPosition) => {
    const floatingNavigation = floatingNavigationRef.current;
    const container = floatingNavigation?.parentElement;
    if (!floatingNavigation || !container) return position;

    const containerRect = container.getBoundingClientRect();
    const navigationRect = floatingNavigation.getBoundingClientRect();
    const left = FLOATING_NAV_INSET;
    const top = FLOATING_NAV_INSET;
    const right = Math.max(left, containerRect.width - navigationRect.width - FLOATING_NAV_INSET);
    const bottom = Math.max(top, containerRect.height - navigationRect.height - FLOATING_NAV_INSET);
    const clamped = {
      x: clampNumber(position.x, left, right),
      y: clampNumber(position.y, top, bottom),
    };
    const candidates = [
      { distance: Math.abs(clamped.x - left), position: { x: left, y: clamped.y } },
      { distance: Math.abs(clamped.x - right), position: { x: right, y: clamped.y } },
      { distance: Math.abs(clamped.y - top), position: { x: clamped.x, y: top } },
      { distance: Math.abs(clamped.y - bottom), position: { x: clamped.x, y: bottom } },
    ];

    const snapped = candidates.reduce((best, candidate) =>
      candidate.distance < best.distance ? candidate : best,
    ).position;
    setFloatingNavigationHorizontalAnchor(snapped.x >= (left + right) / 2 ? 'right' : 'left');
    return snapped;
  }, []);

  const floatingNavigationLeft = useMemo(() => {
    if (!isFloatingNavigation || isDraggingFloatingNavigation) return floatingNavigationPosition.x;

    if (floatingNavigationHorizontalAnchor === 'right') {
      const floatingNavigation = floatingNavigationRef.current;
      const container = floatingNavigation?.parentElement;
      const containerWidth = container?.getBoundingClientRect().width;
      const navigationWidth = navigationIsCollapsed
        ? FLOATING_NAV_COLLAPSED_WIDTH
        : FLOATING_NAV_EXPANDED_WIDTH;
      if (containerWidth) {
        return Math.max(FLOATING_NAV_INSET, containerWidth - navigationWidth - FLOATING_NAV_INSET);
      }
      return navigationIsCollapsed
        ? floatingNavigationPosition.x
        : floatingNavigationPosition.x - (FLOATING_NAV_EXPANDED_WIDTH - FLOATING_NAV_COLLAPSED_WIDTH);
    }

    return floatingNavigationPosition.x;
  }, [
    floatingNavigationHorizontalAnchor,
    floatingNavigationPosition.x,
    isDraggingFloatingNavigation,
    isFloatingNavigation,
    navigationIsCollapsed,
  ]);

  const handleFloatingNavigationPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isFloatingNavigation || !navigationIsCollapsed || shouldIgnoreFloatingDrag(event.target)) return;

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      const normalizedPosition = clampFloatingNavigationPosition({
        x: floatingNavigationLeft,
        y: floatingNavigationPosition.y,
      });
      setFloatingNavigationHorizontalAnchor('left');
      setFloatingNavigationPosition(normalizedPosition);
      floatingNavigationDragRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: normalizedPosition.x,
        startY: normalizedPosition.y,
        currentX: normalizedPosition.x,
        currentY: normalizedPosition.y,
      };
      setIsDraggingFloatingNavigation(true);
    },
    [
      clampFloatingNavigationPosition,
      floatingNavigationLeft,
      floatingNavigationPosition.y,
      isFloatingNavigation,
      navigationIsCollapsed,
    ],
  );

  const handleFloatingNavigationPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const dragState = floatingNavigationDragRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;

      const nextPosition = clampFloatingNavigationPosition({
        x: dragState.startX + event.clientX - dragState.startClientX,
        y: dragState.startY + event.clientY - dragState.startClientY,
      });
      dragState.currentX = nextPosition.x;
      dragState.currentY = nextPosition.y;
      setFloatingNavigationPosition(nextPosition);
    },
    [clampFloatingNavigationPosition],
  );

  const finishFloatingNavigationDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const dragState = floatingNavigationDragRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;

      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture may already be released by the browser.
      }

      floatingNavigationDragRef.current = null;
      setFloatingNavigationPosition(
        snapFloatingNavigationPosition({
          x: dragState.currentX,
          y: dragState.currentY,
        }),
      );
      setIsDraggingFloatingNavigation(false);
    },
    [snapFloatingNavigationPosition],
  );

  useEffect(() => {
    if (!isFloatingNavigation) return;
    const clampPosition = () => {
      setFloatingNavigationPosition((current) => clampFloatingNavigationPosition(current));
    };
    const frame = window.requestAnimationFrame(clampPosition);
    const transitionClamp = window.setTimeout(clampPosition, 430);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(transitionClamp);
    };
  }, [clampFloatingNavigationPosition, isFloatingNavigation, navigationIsCollapsed, navigationMaxHeight]);

  return (
    <ThemeProvider theme={theme}>
      <OrbcafeI18nProvider locale={locale}>
        <Box
        sx={(theme) => ({
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, #0A0A0A 0%, #141414 55%, #1A1A1A 100%)'
              : theme.palette.background.default,
        })}
      >
        <CAppHeader
          appTitle={appTitle}
          logo={logo}
          mode={mode}
          onToggleMode={() =>
            setMode((prev) => (prev === 'system' ? 'dark' : prev === 'dark' ? 'light' : 'system'))
          }
          locale={locale}
          localeLabel={localeLabel}
          localeOptions={localeOptions}
          onLocaleChange={onLocaleChange}
          user={user}
          onUserSetting={onUserSetting}
          onUserLogout={onUserLogout}
          userMenuItems={userMenuItems}
          searchPlaceholder={searchPlaceholder}
          showSearch={showHeaderSearch}
          onSearch={onSearch}
          onSearchAdd={onSearchAdd}
          leftSlot={leftHeaderSlot}
          rightSlot={rightHeaderSlot}
        />

        {searchPlacement === 'floating' && (
          <Box
            sx={[
              (theme) => ({
                position: 'fixed',
                left: { xs: 12, sm: 'auto' },
                right: { xs: 12, md: 24 },
                bottom: { xs: 12, md: 24 },
                width: { xs: 'auto', sm: 540 },
                maxWidth: 'calc(100vw - 24px)',
                zIndex: theme.zIndex.modal + 30,
                pointerEvents: 'auto',
                filter:
                  theme.palette.mode === 'dark'
                    ? 'drop-shadow(0 18px 42px rgba(0,0,0,0.58))'
                    : 'drop-shadow(0 18px 36px rgba(15,23,42,0.18))',
              }),
              ...(Array.isArray(floatingSearchSx)
                ? floatingSearchSx
                : floatingSearchSx
                  ? [floatingSearchSx]
                  : []),
            ]}
          >
            <CAppHeaderSearch
              searchPlaceholder={searchPlaceholder}
              onSearch={onSearch}
              onSearchAdd={onSearchAdd}
              maxWidth="100%"
            />
          </Box>
        )}

        <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', overflowX: 'hidden', position: 'relative' }}>
          {showNavigation && !isFloatingNavigation && (
            <Box
              sx={{
                pt: 1.5,
                pb: 1.5,
                pl: 1.5,
                pr: navigationIsCollapsed ? 0.5 : 1.5,
                display: 'flex',
                alignItems: 'flex-start',
                flexShrink: 0,
              }}
            >
              <NavigationIsland
                {...navigationIslandProps}
                maxHeight={navigationMaxHeight}
                colorMode={effectiveMode}
                displayMode={effectiveNavigationMode}
                onDisplayModeChange={setEffectiveNavigationMode}
                showDisplayModeToggle={showNavigationModeToggle && navigationIsCollapsed}
              />
            </Box>
          )}

          {showNavigation && isFloatingNavigation && (
            <Box
              ref={floatingNavigationRef}
              onPointerDown={handleFloatingNavigationPointerDown}
              onPointerMove={handleFloatingNavigationPointerMove}
              onPointerUp={finishFloatingNavigationDrag}
              onPointerCancel={finishFloatingNavigationDrag}
              sx={(theme) => ({
                position: 'absolute',
                top: floatingNavigationPosition.y,
                left: floatingNavigationLeft,
                zIndex: theme.zIndex.drawer + 5,
                display: 'flex',
                alignItems: 'flex-start',
                cursor: navigationIsCollapsed
                  ? isDraggingFloatingNavigation ? 'grabbing' : 'grab'
                  : 'default',
                touchAction: navigationIsCollapsed ? 'none' : 'auto',
                userSelect: isDraggingFloatingNavigation ? 'none' : undefined,
                transition: isDraggingFloatingNavigation ? 'none' : 'left 180ms ease-out, top 180ms ease-out',
              })}
            >
              <NavigationIsland
                {...navigationIslandProps}
                maxHeight={navigationMaxHeight}
                colorMode={effectiveMode}
                displayMode={effectiveNavigationMode}
                onDisplayModeChange={setEffectiveNavigationMode}
                showDisplayModeToggle={showNavigationModeToggle && navigationIsCollapsed}
              />
            </Box>
          )}

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              overflow: 'auto',
              pt: 1.5,
              pb: 1.5,
              pr: 1.5,
              pl: showNavigation && !isFloatingNavigation && navigationIsCollapsed ? 0.5 : 1.5,
              ...contentSx,
            }}
          >
            {children}
          </Box>
        </Box>
        </Box>
      </OrbcafeI18nProvider>
    </ThemeProvider>
  );
};
