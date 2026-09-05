'use client';

import { Drawer, MenuRoundedIcon } from '../../lib/orbis-compat';
import { useEffect, useState } from 'react';
import { CDivider, CPaper, CStack, CIconButton } from "../Atoms";
import { useMediaQuery } from "../../lib/hooks";
import type { PAppPageLayoutProps } from './types';
import { PNavIsland } from './PNavIsland';
import { PWorkloadNav } from './PWorkloadNav';
import { CAppHeader } from '../PageLayout/Components/CAppHeader';
import { OrbcafeI18nProvider } from '../../i18n';
import { OrbisModeProvider } from '../../lib/theme';

export const PAppPageLayout = ({
  appTitle,
  children,
  menuData = [],
  workloadItems = [],
  workloadSelectedId,
  showNavigation = true,
  showWorkloadNav = true,
  orientation = 'auto',
  logo,
  headerSlot,
  actionSlot,
  portraitBottomSlot,
  contentSx,
  containerSx,
  user,
  onSearch,
  onSearchAdd,
  defaultNavigationOpen,
  navOpen,
  onNavOpenChange,
  onWorkloadSelect,
  locale = 'en',
  localeLabel,
  localeOptions,
  onLocaleChange,
  onUserSetting,
  onUserLogout,
  userMenuItems,
  leftHeaderSlot,
  rightHeaderSlot,
}: PAppPageLayoutProps) => {
  const modeStorageKey = 'orbcafe:page-layout-mode';
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>('system');
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const effectiveMode: 'light' | 'dark' =
    mode === 'system' ? (hydrated ? systemMode : 'light') : mode;

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Sync effectiveMode to document for Tailwind dark variant and native scrollbars
  useEffect(() => {
    if (effectiveMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('orb-dark');
      document.documentElement.dataset.orbMode = 'dark';
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('orb-dark');
      document.documentElement.dataset.orbMode = 'light';
      document.documentElement.style.colorScheme = 'light';
    }
  }, [effectiveMode]);

  const isPortraitViewport = useMediaQuery('(orientation: portrait)');
  const isCompactViewport = useMediaQuery('(max-width: 899.95px)');
  const resolvedOrientation =
    orientation === 'auto' ? (!mounted || isPortraitViewport || isCompactViewport ? 'portrait' : 'landscape') : orientation;

  const [navState, setNavState] = useState({
    landscape: defaultNavigationOpen ?? true,
    portrait: false,
  });

  const internalNavOpen = navState[resolvedOrientation];
  const navigationOpen = navOpen ?? internalNavOpen;

  const updateNavigationOpen = (next: boolean) => {
    if (navOpen === undefined) {
      setNavState((prev) => ({ ...prev, [resolvedOrientation]: next }));
    }
    onNavOpenChange?.(next);
  };

  const headerLeftSlot = (
    <CStack direction="row" spacing={1} alignItems="center">
      {(!mounted || (showNavigation && resolvedOrientation === 'portrait')) ? (
        <CIconButton onClick={() => updateNavigationOpen(!navigationOpen)} sx={{ bgcolor: 'action.hover' }}>
          <MenuRoundedIcon />
        </CIconButton>
      ) : null}
      {leftHeaderSlot}
    </CStack>
  );

  const headerRightSlot = (
    <CStack direction="row" spacing={1} alignItems="center">
      {actionSlot}
      {rightHeaderSlot}
    </CStack>
  );

  const navContent = (
    <PNavIsland
      collapsed={resolvedOrientation === 'landscape' ? !navigationOpen : false}
      onToggle={() => updateNavigationOpen(!navigationOpen)}
      menuData={menuData}
      orientation={resolvedOrientation}
      colorMode={effectiveMode}
      maxHeight={resolvedOrientation === 'landscape' ? 900 : undefined}
    />
  );

  return (
    <OrbisModeProvider mode={mode}>
      <OrbcafeI18nProvider locale={locale}>
        <div
          sx={[
            (t) => ({
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              background:
                t.palette.mode === 'dark'
                  ? 'linear-gradient(180deg, var(--orb-canvas) 0%, var(--orb-surface) 55%, var(--orb-surface-2) 100%)'
                  : t.palette.background.default,
            }),
            ...(Array.isArray(containerSx) ? containerSx : [containerSx]),
          ]}
        >
          <CAppHeader
            appTitle={appTitle}
            logo={logo === undefined ? null : logo}
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
            onSearch={onSearch}
            onSearchAdd={onSearchAdd}
            leftSlot={headerLeftSlot}
            rightSlot={headerRightSlot}
          />

          {headerSlot ? (
            <div sx={{ px: { xs: 2, md: 3 }, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              {headerSlot}
            </div>
          ) : null}

          <div sx={{ flex: 1, minHeight: 0, display: 'flex', position: 'relative' }}>
            {mounted && showNavigation && resolvedOrientation === 'landscape' ? (
              <div sx={{ p: 1.5, pr: 0, flexShrink: 0 }}>{navContent}</div>
            ) : null}

            {(!mounted || (showNavigation && resolvedOrientation === 'portrait')) ? (
              <Drawer
                open={navigationOpen}
                onClose={() => updateNavigationOpen(false)}
                PaperProps={{
                  sx: {
                    width: 'min(88vw, 360px)',
                    p: 1.25,
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                  },
                }}
              >
                {navContent}
              </Drawer>
            ) : null}

            <div
              sx={{
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                overflow: 'auto',
                p: 1.5,
                ...contentSx,
              }}
            >
              <CStack spacing={1.5}>
                {showWorkloadNav && workloadItems.length > 0 ? (
                  <PWorkloadNav
                    items={workloadItems}
                    selectedId={workloadSelectedId}
                    orientation={resolvedOrientation}
                    onItemSelect={onWorkloadSelect}
                  />
                ) : null}

                <CPaper
                  elevation={0}
                  sx={{
                    flex: 1,
                    minHeight: resolvedOrientation === 'portrait' ? 420 : 560,
                    p: { xs: 1.25, md: 1.5 },
                    borderRadius: 5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor:
                      'color-mix(in oklch, var(--orb-canvas) 72%, transparent)',
                    backdropFilter: 'blur(12px)',
                    color: 'text.primary',
                  }}
                >
                  {children}
                </CPaper>
              </CStack>
            </div>
          </div>

          {resolvedOrientation === 'portrait' && portraitBottomSlot ? (
            <>
              <CDivider />
              <div sx={{ p: 1.5 }}>{portraitBottomSlot}</div>
            </>
          ) : null}
        </div>
      </OrbcafeI18nProvider>
    </OrbisModeProvider>
  );
};
