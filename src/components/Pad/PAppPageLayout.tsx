'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  useMediaQuery,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import type { PAppPageLayoutProps } from './types';
import { PNavIsland } from './PNavIsland';
import { PWorkloadNav } from './PWorkloadNav';
import { CAppHeader } from '../PageLayout/Components/CAppHeader';
import { OrbcafeI18nProvider } from '../../i18n';

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
  const [hydrated, setHydrated] = useState(false);
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

  const isPortraitViewport = useMediaQuery('(orientation: portrait)', { noSsr: true });
  const isCompactViewport = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const resolvedOrientation =
    orientation === 'auto' ? (isPortraitViewport || isCompactViewport ? 'portrait' : 'landscape') : orientation;

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
    <Stack direction="row" spacing={1} alignItems="center">
      {showNavigation && resolvedOrientation === 'portrait' ? (
        <IconButton onClick={() => updateNavigationOpen(!navigationOpen)} sx={{ bgcolor: 'action.hover' }}>
          <MenuRoundedIcon />
        </IconButton>
      ) : null}
      {leftHeaderSlot}
    </Stack>
  );

  const headerRightSlot = (
    <Stack direction="row" spacing={1} alignItems="center">
      {actionSlot}
      {rightHeaderSlot}
    </Stack>
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
    <ThemeProvider theme={theme}>
      <OrbcafeI18nProvider locale={locale}>
        <Box
          sx={[
            (t) => ({
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              background:
                t.palette.mode === 'dark'
                  ? 'linear-gradient(180deg, #0A0A0A 0%, #141414 55%, #1A1A1A 100%)'
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
            leftSlot={headerLeftSlot}
            rightSlot={headerRightSlot}
          />

          {headerSlot ? (
            <Box sx={{ px: { xs: 2, md: 3 }, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              {headerSlot}
            </Box>
          ) : null}

          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', position: 'relative' }}>
            {showNavigation && resolvedOrientation === 'landscape' ? (
              <Box sx={{ p: 1.5, pr: 0, flexShrink: 0 }}>{navContent}</Box>
            ) : null}

            {showNavigation && resolvedOrientation === 'portrait' ? (
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

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                overflow: 'auto',
                p: 1.5,
                ...contentSx,
              }}
            >
              <Stack spacing={1.5}>
                {showWorkloadNav && workloadItems.length > 0 ? (
                  <PWorkloadNav
                    items={workloadItems}
                    selectedId={workloadSelectedId}
                    orientation={resolvedOrientation}
                    onItemSelect={onWorkloadSelect}
                  />
                ) : null}

                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    minHeight: resolvedOrientation === 'portrait' ? 420 : 560,
                    p: { xs: 1.25, md: 1.5 },
                    borderRadius: 5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor:
                      theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {children}
                </Paper>
              </Stack>
            </Box>
          </Box>

          {resolvedOrientation === 'portrait' && portraitBottomSlot ? (
            <>
              <Divider />
              <Box sx={{ p: 1.5 }}>{portraitBottomSlot}</Box>
            </>
          ) : null}
        </Box>
      </OrbcafeI18nProvider>
    </ThemeProvider>
  );
};
