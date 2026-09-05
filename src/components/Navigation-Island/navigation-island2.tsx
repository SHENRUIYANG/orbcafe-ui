'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderTree,
  PanelLeftOpen,
  PanelRight,
  Pin,
  Search,
} from '@/components/Icons';
import { useOrbcafeI18n } from '../../i18n';
import { TreeMenu, type TreeMenuItem } from './tree-menu';
import type { NavigationIslandProps } from './navigation-island.types';

export type NavigationIsland2Props = NavigationIslandProps;

const DEFAULT_PIN_STORAGE_KEY = 'orbcafe:navigation-island:pinned-items';
const PINNED_SECTION_ID = 'orbcafe-navigation-pinned';

const getNodeTargetUrl = (node: TreeMenuItem) => node.appurl || node.href;

const collectPinnableNodes = (nodes: TreeMenuItem[]): TreeMenuItem[] =>
  nodes.flatMap((node) => {
    const hasChildren = Boolean(node.children?.length);
    const current = node.pinnable !== false && Boolean(getNodeTargetUrl(node)) && !hasChildren
      ? [{ ...node, children: undefined }]
      : [];
    return node.children?.length ? [...current, ...collectPinnableNodes(node.children)] : current;
  });

const collectNodeIds = (nodes: TreeMenuItem[]): string[] =>
  nodes.flatMap((node) => [node.id, ...(node.children ? collectNodeIds(node.children) : [])]);

const filterMenuNodes = (nodes: TreeMenuItem[], normalizedSearch: string): TreeMenuItem[] =>
  nodes.reduce<TreeMenuItem[]>((result, node) => {
    const filteredChildren = node.children
      ? filterMenuNodes(node.children, normalizedSearch)
      : [];
    const matches = [node.title, node.label, node.description]
      .some((value) => value?.toLocaleLowerCase().includes(normalizedSearch));

    if (matches || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      });
    }
    return result;
  }, []);

/** Independent ORBIS navigation implementation using the offline SAP icon font. */
export const NavigationIsland2: React.FC<NavigationIsland2Props> = ({
  collapsed,
  onToggle,
  className = '',
  maxHeight,
  menuData = [],
  colorMode = 'light',
  displayMode = 'fixed',
  onDisplayModeChange,
  showDisplayModeToggle = true,
  enablePinning = true,
  pinStorageKey = DEFAULT_PIN_STORAGE_KEY,
  pinnedItemIds,
  defaultPinnedItemIds = [],
  onPinnedItemIdsChange,
  pinnedSectionTitle,
}) => {
  const { t } = useOrbcafeI18n();
  const router = useRouter();
  const isFloating = displayMode === 'floating';
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [internalPinnedItemIds, setInternalPinnedItemIds] = useState(defaultPinnedItemIds);
  const [pinningHydrated, setPinningHydrated] = useState(false);
  const isPinningControlled = pinnedItemIds !== undefined;
  const effectivePinnedItemIds = pinnedItemIds ?? internalPinnedItemIds;
  const pinnedIdSet = useMemo(() => new Set(effectivePinnedItemIds), [effectivePinnedItemIds]);

  useEffect(() => {
    if (collapsed) setExpandedNodes(new Set());
  }, [collapsed]);

  useEffect(() => {
    if (!enablePinning || isPinningControlled) {
      setPinningHydrated(true);
      return;
    }

    try {
      const savedValue = window.localStorage.getItem(pinStorageKey);
      if (savedValue) {
        const parsedValue: unknown = JSON.parse(savedValue);
        if (Array.isArray(parsedValue)) {
          setInternalPinnedItemIds(parsedValue.filter((id): id is string => typeof id === 'string'));
        }
      }
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    } finally {
      setPinningHydrated(true);
    }
  }, [enablePinning, isPinningControlled, pinStorageKey]);

  useEffect(() => {
    if (!enablePinning || isPinningControlled || !pinningHydrated) return;
    try {
      window.localStorage.setItem(pinStorageKey, JSON.stringify(effectivePinnedItemIds));
    } catch {
      // Keep navigation usable when storage writes are blocked.
    }
  }, [effectivePinnedItemIds, enablePinning, isPinningControlled, pinStorageKey, pinningHydrated]);

  useEffect(() => {
    if (!enablePinning || collapsed || effectivePinnedItemIds.length === 0) return;
    setExpandedNodes((current) => {
      if (current.has(PINNED_SECTION_ID)) return current;
      const next = new Set(current);
      next.add(PINNED_SECTION_ID);
      return next;
    });
  }, [collapsed, effectivePinnedItemIds.length, enablePinning]);

  const setEffectivePinnedItemIds = useCallback((nextIds: string[]) => {
    const uniqueIds = Array.from(new Set(nextIds));
    if (!isPinningControlled) setInternalPinnedItemIds(uniqueIds);
    onPinnedItemIdsChange?.(uniqueIds);
  }, [isPinningControlled, onPinnedItemIdsChange]);

  const handleTogglePin = useCallback((node: TreeMenuItem) => {
    setEffectivePinnedItemIds(
      pinnedIdSet.has(node.id)
        ? effectivePinnedItemIds.filter((id) => id !== node.id)
        : [...effectivePinnedItemIds, node.id],
    );
  }, [effectivePinnedItemIds, pinnedIdSet, setEffectivePinnedItemIds]);

  const displayMenuData = useMemo<TreeMenuItem[]>(() => {
    if (!enablePinning || effectivePinnedItemIds.length === 0) return menuData;

    const itemsById = new Map(collectPinnableNodes(menuData).map((item) => [item.id, item]));
    const pinnedItems = effectivePinnedItemIds
      .map((id) => itemsById.get(id))
      .filter((item): item is TreeMenuItem => Boolean(item));

    if (pinnedItems.length === 0) return menuData;
    return [{
      id: PINNED_SECTION_ID,
      title: pinnedSectionTitle || t('navigation.pinned'),
      icon: <Pin className="h-4 w-4" />,
      children: pinnedItems,
      pinnable: false,
    }, ...menuData];
  }, [effectivePinnedItemIds, enablePinning, menuData, pinnedSectionTitle, t]);

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const filteredMenuData = useMemo(
    () => normalizedSearch ? filterMenuNodes(displayMenuData, normalizedSearch) : displayMenuData,
    [displayMenuData, normalizedSearch],
  );
  const visibleExpandedNodes = useMemo(
    () => normalizedSearch ? new Set(collectNodeIds(filteredMenuData)) : expandedNodes,
    [expandedNodes, filteredMenuData, normalizedSearch],
  );

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedNodes((current) => {
      const next = new Set(current);
      const isTopLevel = filteredMenuData.some((item) => item.id === id);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (isTopLevel) filteredMenuData.forEach((item) => next.delete(item.id));
        next.add(id);
      }
      return next;
    });
  }, [filteredMenuData]);

  const handleNodeClick = useCallback((node: TreeMenuItem) => {
    const targetUrl = getNodeTargetUrl(node);
    if (!targetUrl) return;

    if (node.id === 'chat' || node.appurl === '/chat') {
      router.push('/chat?new=true');
    } else if (/^https?:\/\//.test(targetUrl)) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      router.push(targetUrl);
    }
  }, [router]);

  const handleCollapsedItemClick = (item: TreeMenuItem) => {
    onToggle();
    setExpandedNodes(new Set([item.id]));
  };

  return (
    <aside
      data-navigation-island="v2"
      data-collapsed={collapsed || undefined}
      className={`orb-navigation-island-v2 relative flex flex-col border ${
        collapsed ? 'w-14' : 'w-[234px]'
      } ${className}`}
      style={{
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        transition: 'width 320ms cubic-bezier(0.4, 0, 0.2, 1), border-radius 220ms ease, box-shadow 220ms ease',
      }}
      aria-label="Navigation"
    >
      <div className={`orb-navigation-island-v2-search ${collapsed ? 'px-1' : 'px-2'}`}>
        {collapsed ? (
          <button
            type="button"
            onClick={onToggle}
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg text-[var(--orb-muted)] transition-colors hover:bg-[var(--orb-p50)] hover:text-[var(--orb-status-primary)]"
            title={t('navigation.expand')}
            aria-label={t('navigation.expand')}
          >
            <Search className="h-5 w-5" />
          </button>
        ) : (
          <label className="relative block">
            <span className="orb-visually-hidden">{t('navigation.searchPlaceholder')}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--orb-muted)]" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t('navigation.searchPlaceholder')}
              className="w-full py-2 pl-10 pr-3 text-sm outline-none"
            />
          </label>
        )}
      </div>

      <nav className={`min-h-0 flex-1 overflow-y-auto pb-2 ${collapsed ? 'px-1' : 'px-2'}`}>
        {filteredMenuData.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-[var(--orb-muted)]">
            {collapsed
              ? <FolderTree className="h-5 w-5" />
              : normalizedSearch ? t('navigation.noMatch') : t('navigation.noAccessibleApp')}
          </div>
        ) : collapsed ? (
          <div className="space-y-1">
            {displayMenuData.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => handleCollapsedItemClick(item)}
                className="flex h-10 w-full items-center justify-center rounded-lg text-[var(--orb-muted)] transition-colors hover:bg-[var(--orb-p50)] hover:text-[var(--orb-status-primary)]"
                title={t('navigation.expandView', { title: item.title || item.label || '' })}
              >
                {item.icon || <FolderTree className="h-5 w-5" />}
              </button>
            ))}
          </div>
        ) : (
          <TreeMenu
            items={filteredMenuData}
            onItemClick={handleNodeClick}
            className="space-y-1"
            expandedIds={visibleExpandedNodes}
            onToggleExpand={handleToggleExpand}
            colorMode={colorMode}
            enablePinning={enablePinning}
            pinnedIds={pinnedIdSet}
            onTogglePin={handleTogglePin}
          />
        )}
      </nav>

      {showDisplayModeToggle && collapsed && (
        <div className="orb-navigation-island-v2-footer flex flex-col items-center gap-1 border-t px-1 py-2">
          <button
            type="button"
            onClick={() => onDisplayModeChange?.(isFloating ? 'fixed' : 'floating')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--orb-muted)] transition-colors hover:bg-[var(--orb-p50)] hover:text-[var(--orb-status-primary)]"
            title={isFloating ? t('navigation.mode.switchToFixed') : t('navigation.mode.switchToFloating')}
            aria-label={isFloating ? t('navigation.mode.switchToFixed') : t('navigation.mode.switchToFloating')}
          >
            {isFloating ? <PanelLeftOpen className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
          </button>
        </div>
      )}

      {!collapsed && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute -bottom-1 -right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-transparent transition-all duration-300 ease-in-out"
          title={t('navigation.collapse')}
          aria-label={t('navigation.collapse')}
        >
          <span
            aria-hidden="true"
            className="absolute overflow-hidden"
            style={{ bottom: 0, right: 0, width: 16, height: 16 }}
          >
            <span
              className="absolute rounded-full border-[3px] border-[var(--orb-ai-accent)]"
              style={{ width: 32, height: 32, top: -16, left: -16 }}
            />
          </span>
        </button>
      )}
    </aside>
  );
};

NavigationIsland2.displayName = 'NavigationIsland2';

export default NavigationIsland2;
