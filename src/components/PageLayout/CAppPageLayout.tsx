'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { NavigationIsland } from '../Navigation-Island/navigation-island';
import { NavigationIsland2 } from '../Navigation-Island/navigation-island2';
import { CAppHeader, CAppHeaderSearch } from './Components/CAppHeader';
import { usePageLayout } from './Hooks/usePageLayout';
import type { CAppPageLayoutProps } from './types';
import { OrbcafeI18nProvider, type OrbcafeLocale } from '../../i18n';
import { OrbisModeProvider, type OrbModeSetting } from '../../lib/theme';

const FLOATING_NAV_INSET = 12;
const FLOATING_NAV_COLLAPSED_WIDTH = 56;
const FLOATING_NAV_EXPANDED_WIDTH = 234;
const LOCALE_STORAGE_KEY = 'orbcafe:page-layout-locale';
const SUPPORTED_LOCALES: readonly OrbcafeLocale[] = ['en', 'zh', 'fr', 'de', 'ja', 'ko'];

const normalizeStorageId = (value: string) =>
  encodeURIComponent(value.trim().toLowerCase())
    .replace(/%/g, '')
    .replace(/[^a-z0-9._~-]+/g, '-') || 'app';

const createApplicationStorageKey = (appId: string, preference: string) =>
  `orbcafe:page-layout:${normalizeStorageId(appId)}:${preference}`;

const createLegacyNavigationPinStorageKey = (appTitle: string) =>
  `orbcafe:page-layout:${appTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'app'}:pinned-navigation-items`;

const getNextMode = (mode: OrbModeSetting): OrbModeSetting =>
  mode === 'system' ? 'dark' : mode === 'dark' ? 'light' : 'system';

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
  appId,
  appTitle,
  menuData = [],
  children,
  showNavigation = true,
  locale = 'en',
  localeLabel,
  localeOptions,
  onLocaleChange,
  mode: controlledMode,
  defaultMode = 'system',
  onModeChange,
  user,
  onUserRefresh,
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
  navigationVariant = 'classic',
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
  const modeStorageKey = appId
    ? createApplicationStorageKey(appId, 'mode')
    : 'orbcafe:page-layout-mode';
  const localeStorageKey = appId
    ? createApplicationStorageKey(appId, 'locale')
    : LOCALE_STORAGE_KEY;
  const navigationModeStorageKey = appId
    ? createApplicationStorageKey(appId, 'navigation-mode')
    : 'orbcafe:page-layout-navigation-mode';
  const [internalMode, setInternalMode] = useState<OrbModeSetting>(defaultMode);
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>('light');
  const [hydrated, setHydrated] = useState(false);
  const [internalLocale, setInternalLocale] = useState<OrbcafeLocale>(locale);
  const [localeHydrated, setLocaleHydrated] = useState(false);
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
  const isModeControlled = controlledMode !== undefined;
  const mode = controlledMode ?? internalMode;
  const isLocaleControlled = onLocaleChange !== undefined;
  const effectiveLocale = isLocaleControlled ? locale : internalLocale;
  const localeOptionsKey = localeOptions?.join('|') ?? '';
  const isNavigationModeControlled = navigationMode !== undefined;
  const effectiveNavigationMode = navigationMode ?? internalNavigationMode;
  const isFloatingNavigation = effectiveNavigationMode === 'floating';
  const NavigationIslandComponent = navigationVariant === 'v2' ? NavigationIsland2 : NavigationIsland;
  const showHeaderSearch = searchPlacement === 'header';
  const effectiveMode: 'light' | 'dark' =
    mode === 'system' ? (hydrated ? systemMode : 'light') : mode;

  useEffect(() => {
    if (!isModeControlled) {
      try {
        const savedMode = window.localStorage.getItem(modeStorageKey);
        if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
          setInternalMode(savedMode);
        }
      } catch {
        // ignore storage access failures
      }
    }

    setHydrated(true);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      setSystemMode(media.matches ? 'dark' : 'light');
    };
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [isModeControlled, modeStorageKey]);

  useEffect(() => {
    if (isModeControlled || !hydrated) return;
    try {
      window.localStorage.setItem(modeStorageKey, mode);
    } catch {
      // ignore storage access failures
    }
  }, [hydrated, isModeControlled, mode, modeStorageKey]);

  useEffect(() => {
    if (isLocaleControlled) {
      setLocaleHydrated(true);
      return;
    }

    try {
      const savedLocale = window.localStorage.getItem(localeStorageKey) as OrbcafeLocale | null;
      const availableLocales = localeOptions ?? SUPPORTED_LOCALES;
      if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale) && availableLocales.includes(savedLocale)) {
        setInternalLocale(savedLocale);
      }
    } catch {
      // ignore storage access failures
    } finally {
      setLocaleHydrated(true);
    }
  }, [isLocaleControlled, localeOptionsKey, localeStorageKey]);

  useEffect(() => {
    if (isLocaleControlled || !localeHydrated) return;
    try {
      window.localStorage.setItem(localeStorageKey, effectiveLocale);
    } catch {
      // ignore storage access failures
    }
  }, [effectiveLocale, isLocaleControlled, localeHydrated, localeStorageKey]);

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

  const setEffectiveNavigationMode = useCallback(
    (nextMode: typeof effectiveNavigationMode) => {
      if (!isNavigationModeControlled) {
        setInternalNavigationMode(nextMode);
      }
      onNavigationModeChange?.(nextMode);
    },
    [isNavigationModeControlled, onNavigationModeChange],
  );

  const setEffectiveMode = useCallback(
    (nextMode: OrbModeSetting) => {
      if (!isModeControlled) {
        setInternalMode(nextMode);
      }
      onModeChange?.(nextMode);
    },
    [isModeControlled, onModeChange],
  );

  const setEffectiveLocale = useCallback(
    (nextLocale: OrbcafeLocale) => {
      if (!isLocaleControlled) {
        setInternalLocale(nextLocale);
      }
      onLocaleChange?.(nextLocale);
    },
    [isLocaleControlled, onLocaleChange],
  );

  const { navigationIslandProps, navigationMaxHeight } = usePageLayout({
    menuData,
    initialNavigationCollapsed: false,
    initialNavigationMode: effectiveNavigationMode,
    enableNavigationPinning,
    navigationPinStorageKey:
      navigationPinStorageKey ?? (
        appId
          ? createApplicationStorageKey(appId, 'pinned-navigation-items')
          : createLegacyNavigationPinStorageKey(appTitle)
      ),
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
    <OrbisModeProvider mode={mode}>
      <OrbcafeI18nProvider locale={effectiveLocale}>
        <div
          className="orb-root"
          style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
            background: 'var(--orb-canvas)',
          }}
        >
        <CAppHeader
          appTitle={appTitle}
          logo={logo}
          mode={mode}
          onToggleMode={() => setEffectiveMode(getNextMode(mode))}
          locale={effectiveLocale}
          localeLabel={isLocaleControlled || effectiveLocale === locale ? localeLabel : undefined}
          localeOptions={localeOptions}
          onLocaleChange={setEffectiveLocale}
          user={user}
          onUserRefresh={onUserRefresh}
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
          <div className="orb-float-search" style={floatingSearchSx}>
            <CAppHeaderSearch
              searchPlaceholder={searchPlaceholder}
              onSearch={onSearch}
              onSearchAdd={onSearchAdd}
              maxWidth="100%"
            />
          </div>
        )}

        <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', overflowX: 'hidden', position: 'relative' }}>
          {showNavigation && !isFloatingNavigation && (
            <div
              style={{
                paddingTop: 12,
                paddingBottom: 12,
                paddingLeft: 12,
                paddingRight: navigationIsCollapsed ? 4 : 12,
                display: 'flex',
                alignItems: 'flex-start',
                flexShrink: 0,
              }}
            >
              <NavigationIslandComponent
                {...navigationIslandProps}
                maxHeight={navigationMaxHeight}
                colorMode={effectiveMode}
                displayMode={effectiveNavigationMode}
                onDisplayModeChange={setEffectiveNavigationMode}
                showDisplayModeToggle={showNavigationModeToggle && navigationIsCollapsed}
              />
            </div>
          )}

          {showNavigation && isFloatingNavigation && (
            <div
              ref={floatingNavigationRef}
              onPointerDown={handleFloatingNavigationPointerDown}
              onPointerMove={handleFloatingNavigationPointerMove}
              onPointerUp={finishFloatingNavigationDrag}
              onPointerCancel={finishFloatingNavigationDrag}
              style={{
                position: 'absolute',
                top: floatingNavigationPosition.y,
                left: floatingNavigationLeft,
                zIndex: 1205,
                display: 'flex',
                alignItems: 'flex-start',
                cursor: navigationIsCollapsed
                  ? isDraggingFloatingNavigation ? 'grabbing' : 'grab'
                  : 'default',
                touchAction: navigationIsCollapsed ? 'none' : 'auto',
                userSelect: isDraggingFloatingNavigation ? 'none' : undefined,
                transition: isDraggingFloatingNavigation ? 'none' : 'left 180ms ease-out, top 180ms ease-out',
              }}
            >
              <NavigationIslandComponent
                {...navigationIslandProps}
                maxHeight={navigationMaxHeight}
                colorMode={effectiveMode}
                displayMode={effectiveNavigationMode}
                onDisplayModeChange={setEffectiveNavigationMode}
                showDisplayModeToggle={showNavigationModeToggle && navigationIsCollapsed}
              />
            </div>
          )}

          <div
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              overflow: 'auto',
              paddingTop: 12,
              paddingBottom: 12,
              paddingRight: 12,
              paddingLeft: showNavigation && !isFloatingNavigation && navigationIsCollapsed ? 4 : 12,
              ...contentSx,
            }}
          >
            {children}
          </div>
        </div>
        </div>
      </OrbcafeI18nProvider>
    </OrbisModeProvider>
  );
};
