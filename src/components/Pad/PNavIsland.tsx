'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Avatar,
  Box,
  Collapse,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import type { TreeMenuItem } from '../Navigation-Island/tree-menu';
import type { PNavIslandProps } from './types';
import { useOrbcafeI18n } from '../../i18n';

const filterMenuTree = (nodes: TreeMenuItem[], term: string): TreeMenuItem[] => {
  if (!term.trim()) return nodes;

  return nodes.reduce<TreeMenuItem[]>((result, node) => {
    const matchSelf =
      node.title?.toLowerCase().includes(term.toLowerCase()) ||
      node.label?.toLowerCase().includes(term.toLowerCase()) ||
      node.description?.toLowerCase().includes(term.toLowerCase());

    const filteredChildren = node.children ? filterMenuTree(node.children, term) : [];
    if (matchSelf || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      });
    }
    return result;
  }, []);
};

const collectExpandableIds = (nodes: TreeMenuItem[]) => {
  const ids = new Set<string>();
  const walk = (items: TreeMenuItem[]) => {
    items.forEach((item) => {
      if (item.children?.length) {
        ids.add(item.id);
        walk(item.children);
      }
    });
  };
  walk(nodes);
  return ids;
};

export const PNavIsland = ({
  collapsed = false,
  onToggle,
  className = '',
  maxHeight,
  menuData = [],
  colorMode = 'light',
  orientation = 'auto',
  headerSlot,
  footerSlot,
  activeHref,
  onItemSelect,
}: PNavIslandProps) => {
  const { t } = useOrbcafeI18n();
  const theme = useTheme();
  const isPortraitViewport = useMediaQuery('(orientation: portrait)');
  const isCompactViewport = useMediaQuery(theme.breakpoints.down('md'));
  const resolvedOrientation =
    orientation === 'auto' ? (isPortraitViewport || isCompactViewport ? 'portrait' : 'landscape') : orientation;
  const isDark = colorMode === 'dark';
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filteredMenuData = useMemo(() => filterMenuTree(menuData, searchTerm), [menuData, searchTerm]);
  const searchExpanded = useMemo(() => (searchTerm.trim() ? collectExpandableIds(filteredMenuData) : expanded), [expanded, filteredMenuData, searchTerm]);

  useEffect(() => {
    if (collapsed) {
      setExpanded(new Set());
    }
  }, [collapsed]);

  const resolveHref = (item: TreeMenuItem) => item.appurl || item.href || '';

  const navigateToItem = (item: TreeMenuItem) => {
    onItemSelect?.(item);
    const href = resolveHref(item);
    if (!href) return;
    if (href.startsWith('http://') || href.startsWith('https://')) {
      window.open(href, '_blank');
      return;
    }
    router.push(href);
  };

  const handleItemPress = (item: TreeMenuItem) => {
    const hasChildren = Boolean(item.children?.length);
    if (collapsed && hasChildren) {
      onToggle?.();
      return;
    }
    if (hasChildren) {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
        return next;
      });
      return;
    }
    navigateToItem(item);
  };

  const isActiveItem = (item: TreeMenuItem) => {
    const href = activeHref || pathname;
    const target = resolveHref(item);
    return Boolean(target && href === target);
  };

  const renderItem = (item: TreeMenuItem, level = 0) => {
    const hasChildren = Boolean(item.children?.length);
    const isExpanded = searchExpanded.has(item.id);
    const isActive = isActiveItem(item);

    return (
      <Box key={item.id} sx={{ pl: level === 0 ? 0 : 1.5 }}>
        <Paper
          elevation={0}
          sx={{
            mb: 1,
            overflow: 'hidden',
            borderRadius: 3,
            border: '1px solid',
            borderColor: isActive ? 'primary.main' : 'divider',
            bgcolor: isActive ? 'action.selected' : 'background.paper',
          }}
        >
          <Box
            component="button"
            type="button"
            onClick={() => handleItemPress(item)}
            sx={{
              width: '100%',
              px: 1.5,
              py: 1.4,
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              border: 0,
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 40,
                height: 40,
                bgcolor: isActive ? 'primary.main' : 'action.hover',
                color: isActive ? '#fff' : 'text.primary',
              }}
            >
              {item.icon || (item.title || item.label || '?').slice(0, 1).toUpperCase()}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.2 }}>
                {item.title || item.label}
              </Typography>
              {item.description ? (
                <Typography sx={{ mt: 0.4, fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.35 }}>
                  {item.description}
                </Typography>
              ) : null}
            </Box>

            {hasChildren ? (
              <ExpandMoreRoundedIcon
                sx={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 180ms ease',
                }}
              />
            ) : (
              <ChevronRightRoundedIcon color="action" />
            )}
          </Box>

          {hasChildren ? (
            <Collapse in={isExpanded}>
              <Box sx={{ px: 1.25, pb: 1.25 }}>{item.children?.map((child) => renderItem(child, level + 1))}</Box>
            </Collapse>
          ) : null}
        </Paper>
      </Box>
    );
  };

  if (collapsed) {
    return (
      <Paper
        elevation={0}
        className={className}
        sx={{
          width: resolvedOrientation === 'portrait' ? '100%' : 88,
          p: 1,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: isDark ? '#101828' : 'rgba(255,255,255,0.88)',
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          overflowY: 'auto',
        }}
      >
        <Stack spacing={1}>
          <IconButton
            onClick={onToggle}
            sx={{
              width: 48,
              height: 48,
              alignSelf: 'center',
              bgcolor: 'action.hover',
            }}
            title={t('navigation.expand')}
          >
            <MenuRoundedIcon />
          </IconButton>

          {menuData.map((item) => (
            <IconButton
              key={item.id}
              onClick={() => handleItemPress(item)}
              sx={{
                width: 56,
                height: 56,
                alignSelf: 'center',
                borderRadius: 3,
                bgcolor: isActiveItem(item) ? 'primary.main' : 'action.hover',
                color: isActiveItem(item) ? '#fff' : 'text.primary',
              }}
            >
              {item.icon || (item.title || item.label || '?').slice(0, 1).toUpperCase()}
            </IconButton>
          ))}
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      className={className}
      sx={{
        width: resolvedOrientation === 'portrait' ? '100%' : 320,
        p: 1.25,
        borderRadius: 5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: isDark ? '#101828' : 'rgba(255,255,255,0.88)',
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('navigation.searchPlaceholder')}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <SearchRoundedIcon fontSize="small" color="action" />,
            }}
          />

          <IconButton onClick={onToggle} sx={{ bgcolor: 'action.hover' }}>
            <MenuOpenRoundedIcon />
          </IconButton>
        </Stack>

        {headerSlot}

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.25 }}>
          {filteredMenuData.length > 0 ? (
            filteredMenuData.map((item) => renderItem(item))
          ) : (
            <Typography sx={{ p: 2, fontSize: '0.88rem', color: 'text.secondary', textAlign: 'center' }}>
              {t('navigation.noMatch')}
            </Typography>
          )}
        </Box>

        {footerSlot}
      </Stack>
    </Paper>
  );
};
