'use client';

import { Avatar, CIconButton, CPaper, ChevronRightRoundedIcon, Collapse, ExpandMoreRoundedIcon, MenuOpenRoundedIcon, MenuRoundedIcon, SearchRoundedIcon, useTheme } from '../../lib/orbis-compat';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CStack, CTypography, CTextField } from "../Atoms";
import { useMediaQuery } from '../../lib/hooks';
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
      <div key={item.id} sx={{ pl: level === 0 ? 0 : 1.5 }}>
        <CPaper
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
          <div
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
              appearance: 'none',
              WebkitAppearance: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 40,
                height: 40,
                bgcolor: isActive ? 'primary.main' : 'action.hover',
                color: isActive ? 'var(--orb-on-primary)' : 'text.primary',
              }}
            >
              {item.icon || (item.title || item.label || '?').slice(0, 1).toUpperCase()}
            </Avatar>

            <div sx={{ flex: 1, minWidth: 0 }}>
              <CTypography sx={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.2 }}>
                {item.title || item.label}
              </CTypography>
              {item.description ? (
                <CTypography sx={{ mt: 0.4, fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.35 }}>
                  {item.description}
                </CTypography>
              ) : null}
            </div>

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
          </div>

          {hasChildren ? (
            <Collapse in={isExpanded}>
              <div sx={{ px: 1.25, pb: 1.25 }}>{item.children?.map((child) => renderItem(child, level + 1))}</div>
            </Collapse>
          ) : null}
        </CPaper>
      </div>
    );
  };

  if (collapsed) {
    return (
      <CPaper
        elevation={0}
        className={className}
        sx={{
          width: resolvedOrientation === 'portrait' ? '100%' : 88,
          p: 1,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: isDark ? 'var(--orb-surface)' : 'color-mix(in oklch, var(--orb-canvas) 88%, transparent)',
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          overflowY: 'auto',
        }}
      >
        <CStack spacing={1}>
          <CIconButton
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
          </CIconButton>

          {menuData.map((item) => (
            <CIconButton
              key={item.id}
              onClick={() => handleItemPress(item)}
              sx={{
                width: 56,
                height: 56,
                alignSelf: 'center',
                borderRadius: 3,
                bgcolor: isActiveItem(item) ? 'primary.main' : 'action.hover',
                color: isActiveItem(item) ? 'var(--orb-on-primary)' : 'text.primary',
              }}
            >
              {item.icon || (item.title || item.label || '?').slice(0, 1).toUpperCase()}
            </CIconButton>
          ))}
        </CStack>
      </CPaper>
    );
  }

  return (
    <CPaper
      elevation={0}
      className={className}
      sx={{
        width: resolvedOrientation === 'portrait' ? '100%' : 320,
        p: 1.25,
        borderRadius: 5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: isDark ? 'var(--orb-surface)' : 'color-mix(in oklch, var(--orb-canvas) 88%, transparent)',
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CStack spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
        <CStack direction="row" spacing={1} alignItems="center">
          <CTextField
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('navigation.searchPlaceholder')}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <SearchRoundedIcon fontSize="small" color="action" />,
            }}
          />

          {resolvedOrientation === 'landscape' && !collapsed ? (
            <CIconButton onClick={onToggle} sx={{ bgcolor: 'action.hover' }}>
              <MenuOpenRoundedIcon />
            </CIconButton>
          ) : null}
        </CStack>

        {headerSlot}

        <div sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.25 }}>
          {filteredMenuData.length > 0 ? (
            filteredMenuData.map((item) => renderItem(item))
          ) : (
            <CTypography sx={{ p: 2, fontSize: '0.88rem', color: 'text.secondary', textAlign: 'center' }}>
              {t('navigation.noMatch')}
            </CTypography>
          )}
        </div>

        {footerSlot}
      </CStack>
    </CPaper>
  );
};
