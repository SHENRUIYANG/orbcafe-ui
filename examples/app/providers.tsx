'use client';

import React, { useMemo } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { GlobalMessage } from 'orbcafe-ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Providers({ children }: { children: any }) {
  const mode: 'light' | 'dark' = 'light';
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
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
