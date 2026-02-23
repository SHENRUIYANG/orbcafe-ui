'use client';

import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LanguageIcon from '@mui/icons-material/Language';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import type { CAppHeaderProps } from '../types';

const HEADER_HEIGHT = 64;
const LIGHT_HEADER_BASE = '#E9EDF2';
const LIGHT_HEADER_GRADIENT = 'linear-gradient(90deg, #F5F7FA 0%, #E9EDF2 50%, #F5F7FA 100%)';

export const CAppHeader = ({
  appTitle,
  logo,
  mode = 'dark',
  onToggleMode,
  localeLabel = 'EN',
  searchPlaceholder = 'Ask me...',
  onSearch,
  user,
  leftSlot,
  rightSlot,
}: CAppHeaderProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [query, setQuery] = useState('');
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  const themeIcon =
    mode === 'system'
      ? <DesktopWindowsIcon fontSize="small" />
      : mode === 'dark'
        ? <DarkModeIcon fontSize="small" />
        : <LightModeIcon fontSize="small" />;
  const themeTooltip = mode === 'system' ? 'Theme: System' : mode === 'dark' ? 'Theme: Dark' : 'Theme: Light';
  const userMenuOpen = Boolean(userMenuAnchor);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={(theme) => ({
        top: 0,
        zIndex: theme.zIndex.drawer + 10,
        height: HEADER_HEIGHT,
        backgroundColor: theme.palette.mode === 'dark' ? '#0D0D0D' : LIGHT_HEADER_BASE,
        backgroundImage:
          theme.palette.mode === 'dark'
            ? [
                'radial-gradient(circle at 18% 22%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%)',
                'radial-gradient(circle at 78% 32%, rgba(144,202,249,0.14) 0%, rgba(144,202,249,0) 42%)',
                'linear-gradient(90deg, #0A0A0A 0%, #151515 50%, #0A0A0A 100%)',
                'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
                'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              ].join(',')
            : [
                'radial-gradient(circle at 22% 22%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 48%)',
                'radial-gradient(circle at 76% 24%, rgba(203,213,225,0.45) 0%, rgba(203,213,225,0) 42%)',
                LIGHT_HEADER_GRADIENT,
                'linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px)',
                'linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
              ].join(','),
        backgroundSize: 'auto, auto, auto, 24px 24px, 24px 24px',
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)',
      })}
    >
      <Toolbar sx={{ minHeight: `${HEADER_HEIGHT}px !important`, px: 2, gap: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 220 }}>
          {logo || (
            <Box
              component="img"
              src="/orbcafe.png"
              alt="ORBCAFE Logo"
              sx={{
                width: 44,
                height: 44,
                display: 'block',
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
          )}
          {appTitle && (
            <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? 'common.white' : '#111827' }}>
              {appTitle}
            </Typography>
          )}
          {leftSlot}
        </Stack>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ width: '100%', maxWidth: 540 }}>
            <TextField
              size="small"
              fullWidth
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color:
                          isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.55)',
                        fontSize: 18,
                      }}
                    />
                  </InputAdornment>
                ),
                sx: {
                  color: isDark ? 'common.white' : 'rgba(17,24,39,0.9)',
                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                  borderRadius: 999,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.35)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.55)',
                  },
                },
              }}
              inputProps={{
                style: {
                  color: isDark ? 'white' : '#111827',
                },
              }}
            />
          </Box>
        </Box>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <LanguageIcon sx={{ color: isDark ? 'common.white' : '#111827', fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: isDark ? 'common.white' : '#111827', fontWeight: 500 }}>
              {localeLabel}
            </Typography>
          </Stack>
          <IconButton size="small" sx={{ color: isDark ? 'common.white' : '#111827' }} onClick={onToggleMode} title={themeTooltip}>
            {themeIcon}
          </IconButton>

          {user && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ textAlign: 'right', minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: isDark ? 'common.white' : '#111827', fontWeight: 700, lineHeight: 1.15 }}>
                  {user.name}
                </Typography>
                {user.subtitle && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.25,
                      color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(17,24,39,0.62)',
                      fontSize: '0.72rem',
                      lineHeight: 1.1,
                      letterSpacing: '0.01em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 220,
                    }}
                    title={user.subtitle}
                  >
                    {user.subtitle}
                  </Typography>
                )}
              </Box>
              <IconButton
                size="small"
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                sx={{ p: 0 }}
              >
                <Avatar
                  src={user.avatarSrc}
                  imgProps={{ style: { objectFit: 'cover' } }}
                  sx={{ width: 34, height: 34, bgcolor: 'grey.100', color: 'grey.700', fontSize: '0.85rem' }}
                >
                  {user.avatarText || user.name.slice(0, 1).toUpperCase()}
                </Avatar>
              </IconButton>
            </Stack>
          )}

          {rightSlot}
        </Stack>
      </Toolbar>

      <Menu
        anchorEl={userMenuAnchor}
        open={userMenuOpen}
        onClose={() => setUserMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 160,
              '& .MuiMenuItem-root': {
                minHeight: 34,
                py: 0.5,
                px: 1.25,
              },
            },
          },
        }}
      >
        <MenuItem onClick={() => setUserMenuAnchor(null)}>
          <ListItemIcon>
            <SettingsIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary="Setting"
            slotProps={{
              primary: {
                sx: {
                  fontSize: '0.86rem',
                  fontWeight: 500,
                },
              },
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => setUserMenuAnchor(null)}>
          <ListItemIcon>
            <LogoutIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            slotProps={{
              primary: {
                sx: {
                  fontSize: '0.86rem',
                  fontWeight: 500,
                },
              },
            }}
          />
        </MenuItem>
      </Menu>
    </AppBar>
  );
};
