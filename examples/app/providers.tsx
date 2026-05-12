'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CssBaseline } from '@mui/material';
import { GlobalMessage } from 'orbcafe-ui';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Providers({ children }: { children: any }) {
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

  const theme = useMemo(
    () =>
      createTheme({
        palette:
          effectiveMode === 'dark'
            ? {
                mode: 'dark',
                primary: {
                  main: '#93c5fd',
                },
                background: {
                  default: '#060913',
                  paper: '#101826',
                },
                text: {
                  primary: '#f8fafc',
                  secondary: 'rgba(226,232,240,0.74)',
                },
                divider: 'rgba(148,163,184,0.18)',
                action: {
                  hover: 'rgba(148,163,184,0.10)',
                  selected: 'rgba(59,130,246,0.18)',
                },
              }
            : {
                mode: 'light',
                background: {
                  default: '#eef3f8',
                  paper: '#ffffff',
                },
              },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: effectiveMode === 'dark' ? '#060913' : '#eef3f8',
                color: effectiveMode === 'dark' ? '#f8fafc' : '#0f172a',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [effectiveMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <GlobalMessage />
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
}
