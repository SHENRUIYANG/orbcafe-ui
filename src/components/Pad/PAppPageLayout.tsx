'use client';

import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import type { PAppPageLayoutProps } from './types';
import { PNavIsland } from './PNavIsland';
import { PWorkloadNav } from './PWorkloadNav';

export const PAppPageLayout = ({
  appTitle,
  children,
  menuData = [],
  workloadItems = [],
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
}: PAppPageLayoutProps) => {
  const theme = useTheme();
  const isPortraitViewport = useMediaQuery('(orientation: portrait)');
  const isCompactViewport = useMediaQuery(theme.breakpoints.down('md'));
  const resolvedOrientation =
    orientation === 'auto' ? (isPortraitViewport || isCompactViewport ? 'portrait' : 'landscape') : orientation;

  const [internalNavOpen, setInternalNavOpen] = useState(defaultNavigationOpen ?? resolvedOrientation === 'landscape');
  const [searchText, setSearchText] = useState('');
  const navigationOpen = navOpen ?? internalNavOpen;

  useEffect(() => {
    if (navOpen !== undefined) return;
    setInternalNavOpen(resolvedOrientation === 'landscape');
  }, [navOpen, resolvedOrientation]);

  const updateNavigationOpen = (next: boolean) => {
    if (navOpen === undefined) {
      setInternalNavOpen(next);
    }
    onNavOpenChange?.(next);
  };

  const header = (
    <Paper
      elevation={0}
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, rgba(15,23,42,0.96), rgba(17,24,39,0.92))'
            : 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.94))',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        {showNavigation ? (
          <IconButton onClick={() => updateNavigationOpen(!navigationOpen)} sx={{ bgcolor: 'action.hover' }}>
            <MenuRoundedIcon />
          </IconButton>
        ) : null}

        {logo ? <Box sx={{ display: 'grid', placeItems: 'center' }}>{logo}</Box> : null}

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 900 }}>{appTitle}</Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
            {resolvedOrientation === 'portrait' ? 'Pad portrait workspace' : 'Pad landscape workspace'}
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        {onSearch ? (
          <TextField
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSearch(searchText);
              }
            }}
            size="small"
            placeholder="Search..."
            sx={{ minWidth: { md: 240 }, display: { xs: 'none', sm: 'block' } }}
            InputProps={{
              startAdornment: <SearchRoundedIcon fontSize="small" color="action" />,
            }}
          />
        ) : null}

        {actionSlot}

        {user ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={user.avatarSrc} sx={{ width: 38, height: 38 }}>
              {user.avatarText || user.name.slice(0, 1).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography sx={{ fontSize: '0.86rem', fontWeight: 800 }}>{user.name}</Typography>
              {user.subtitle ? (
                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{user.subtitle}</Typography>
              ) : null}
            </Box>
          </Stack>
        ) : null}
      </Stack>

      {headerSlot ? <Box sx={{ mt: 1.25 }}>{headerSlot}</Box> : null}
    </Paper>
  );

  const navContent = (
    <PNavIsland
      collapsed={resolvedOrientation === 'landscape' ? !navigationOpen : false}
      onToggle={() => updateNavigationOpen(!navigationOpen)}
      menuData={menuData}
      orientation={resolvedOrientation}
      colorMode={theme.palette.mode}
      maxHeight={resolvedOrientation === 'landscape' ? 900 : undefined}
    />
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, #020617 0%, #0f172a 58%, #111827 100%)'
            : 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 58%, #e2e8f0 100%)',
        ...containerSx,
      }}
    >
      {header}

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {showNavigation && resolvedOrientation === 'landscape' ? (
          <Box sx={{ p: 1.5, pr: 0, flexShrink: 0 }}>{navContent}</Box>
        ) : null}

        {showNavigation && resolvedOrientation === 'portrait' ? (
          <Drawer
            open={navigationOpen}
            onClose={() => updateNavigationOpen(false)}
            ModalProps={{ keepMounted: true }}
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
  );
};
