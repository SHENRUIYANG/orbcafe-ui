'use client';

import React, { useMemo, useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, IconButton, Tooltip, Box } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Providers({ children }: { children: any }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
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
        {children}
        <Box
          sx={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            zIndex: 2000,
          }}
        >
          <Tooltip title={mode === 'light' ? 'Switch to dark' : 'Switch to light'}>
            <IconButton
              color="primary"
              onClick={() => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 2,
              }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
