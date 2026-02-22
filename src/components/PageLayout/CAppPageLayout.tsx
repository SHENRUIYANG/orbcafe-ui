'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material';
import { NavigationIsland } from '../Navigation-Island/navigation-island';
import { CAppHeader } from './Components/CAppHeader';
import { usePageLayout } from './Hooks/usePageLayout';
import type { CAppPageLayoutProps } from './types';

export const CAppPageLayout = ({
  appTitle,
  menuData = [],
  children,
  showNavigation = true,
  localeLabel,
  user,
  logo,
  onSearch,
  rightHeaderSlot,
  leftHeaderSlot,
  contentSx,
}: CAppPageLayoutProps) => {
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>('system');
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>('light');
  const [hydrated, setHydrated] = useState(false);
  const effectiveMode: 'light' | 'dark' =
    mode === 'system' ? (hydrated ? systemMode : 'light') : mode;

  useEffect(() => {
    setHydrated(true);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      setSystemMode(media.matches ? 'dark' : 'light');
    };
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: effectiveMode,
        },
      }),
    [effectiveMode],
  );

  const { navigationIslandProps, navigationMaxHeight } = usePageLayout({
    menuData,
    initialNavigationCollapsed: false,
  });

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={(theme) => ({
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
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
          localeLabel={localeLabel}
          user={user}
          onSearch={onSearch}
          leftSlot={leftHeaderSlot}
          rightSlot={rightHeaderSlot}
        />

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
          {showNavigation && (
            <Box sx={{ p: 1.5, display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
              <NavigationIsland
                {...navigationIslandProps}
                maxHeight={navigationMaxHeight}
                colorMode={effectiveMode}
              />
            </Box>
          )}

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
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
