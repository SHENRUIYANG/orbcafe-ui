/**
 * @file 10_Frontend/components/ui/molecules/tree-menu.tsx
 * 
 * @summary Core frontend tree-menu module for the ORBAI Core project
 * @author ORBAICODER
 * @version 1.0.0
 * @date 2025-01-19
 * 
 * @description
 * This file is responsible for:
 *  - Implementing tree-menu functionality within frontend workflows
 *  - Integrating with shared ORBAI Core application processes under frontend
 * 
 * @logic
 * 1. Import required dependencies and configuration
 * 2. Execute the primary logic for tree-menu
 * 3. Export the resulting APIs, hooks, or components for reuse
 * 
 * @changelog
 * V1.0.0 - 2025-01-19 - Initial creation
 */

/**
 * File Overview
 * 
 * START CODING
 * 
 * --------------------------
 * SECTION 1: tree-menu Core Logic
 * Section overview and description.
 * --------------------------
 */

'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronRight, Pin } from '@/components/Icons'
import { cn } from '../../lib/utils'
import { Button } from './button'
import { useOrbcafeI18n } from '../../i18n'

export interface TreeMenuItem {
  id: string
  title?: string
  label?: string
  description?: string
  icon?: React.ReactNode
  href?: string
  appurl?: string
  children?: TreeMenuItem[]
  isExpanded?: boolean
  pinnable?: boolean
  data?: any
}

interface TreeMenuProps {
  items: TreeMenuItem[]
  onItemClick?: (item: TreeMenuItem) => void
  className?: string
  level?: number
  expandedIds?: Set<string>
  onToggleExpand?: (id: string) => void
  colorMode?: 'light' | 'dark'
  enablePinning?: boolean
  pinnedIds?: Set<string>
  onTogglePin?: (item: TreeMenuItem) => void
}

export function TreeMenu({
  items,
  onItemClick,
  className = '',
  level = 0,
  expandedIds,
  onToggleExpand,
  colorMode = 'light',
  enablePinning = false,
  pinnedIds,
  onTogglePin,
}: TreeMenuProps) {
  const { t } = useOrbcafeI18n()
  const isDark = colorMode === 'dark'
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [internalExpandedItems, setInternalExpandedItems] = useState<Set<string>>(new Set())

  const isControlled = expandedIds !== undefined && onToggleExpand !== undefined
  
  const currentExpandedItems = isControlled ? expandedIds : internalExpandedItems

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleExpanded = (itemId: string) => {
    if (isControlled) {
      onToggleExpand!(itemId)
    } else {
      const newExpanded = new Set(internalExpandedItems)
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId)
      } else {
        newExpanded.add(itemId)
      }
      setInternalExpandedItems(newExpanded)
    }
  }

  const handleItemClick = (item: TreeMenuItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id)
    }
    
    if (onItemClick) {
      onItemClick(item)
    }
  }

  // 添加防护性检查
  if (!items || !Array.isArray(items)) {
    return (
      <div className={cn('tree-menu', className)}>
        <div className="text-sm text-[var(--orb-muted)] p-2">{t('navigation.noItems')}</div>
      </div>
    )
  }

  return (
    <div className={cn('tree-menu', className)}>
      {items.map((item) => {
        const isExpanded = currentExpandedItems.has(item.id) || item.isExpanded
        const hasChildren = item.children && item.children.length > 0
        const rootContentOffset = 56
        const nestedContentOffset = rootContentOffset + Math.max(0, level - 1) * 8
        const itemPaddingLeft = level === 0
          ? 12
          : hasChildren
            ? nestedContentOffset - 24
            : nestedContentOffset
        
        // 判断是否选中：
        // 1. 完全匹配 appurl 或 href
        // 2. 或者是当前路径的父路径 (可选，视需求而定，这里先做精确匹配)
        const targetUrl = item.appurl || item.href
        const isActive = mounted && targetUrl ? pathname === targetUrl : false
        const isPinned = pinnedIds?.has(item.id) ?? false
        const canPinItem = enablePinning && item.pinnable !== false && Boolean(targetUrl) && !hasChildren
        
        return (
          <div key={item.id} className="tree-menu-item relative">
            {/* 选中态背景指示条 - 仅对非折叠父菜单或叶子节点显示 */}
            {isActive && (
              <div
                className={cn(
                  'absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full z-10',
                  'bg-[var(--orb-nav-active-fg)]',
                )}
              />
            )}
            
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start h-auto py-2 relative overflow-hidden group',
                level > 0 ? 'gap-1' : 'gap-2',
                hasChildren && isExpanded && !isActive
                  ? (isDark
                      ? 'bg-[color-mix(in_oklch,var(--orb-inverse-fg)_5%,transparent)] text-[var(--orb-fg)] hover:bg-[color-mix(in_oklch,var(--orb-inverse-fg)_8%,transparent)]'
                      : 'bg-[color-mix(in_oklch,var(--orb-surface)_70%,transparent)] text-[var(--orb-fg)] hover:bg-[var(--orb-surface)]')
                  : '',
                level >= 2 ? 'min-h-9 py-1.5 rounded-md' : level > 0 ? 'min-h-10 rounded-lg' : 'rounded-lg',
                isActive
                  ? (isDark
                      ? 'bg-transparent text-[var(--orb-nav-active-fg)] hover:bg-[color-mix(in_oklch,var(--orb-surface-2)_35%,transparent)]'
                      : 'bg-transparent text-[var(--orb-nav-active-fg)] hover:bg-[color-mix(in_oklch,var(--orb-surface)_60%,transparent)]')
                  : (isDark
                      ? 'hover:bg-[color-mix(in_oklch,var(--orb-surface-2)_50%,transparent)] text-[var(--orb-fg)]'
                      : 'hover:bg-[color-mix(in_oklch,var(--orb-surface)_50%,transparent)] text-[var(--orb-fg)]')
              )}
              style={{
                paddingLeft: `${itemPaddingLeft}px`,
                paddingRight: canPinItem ? '34px' : '10px',
              }}
              onClick={() => handleItemClick(item)}
            >
              {hasChildren && (
                <div className={cn(
                  "flex-shrink-0 transition-transform duration-200",
                  isExpanded && "rotate-90",
                  isActive
                    ? 'text-[var(--orb-nav-active-fg)]'
                    : (isDark
                        ? "text-[var(--orb-muted)] group-hover:text-[var(--orb-fg)]"
                        : "text-[var(--orb-muted)] group-hover:text-[var(--orb-muted)]")
                )}>
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
              
              {item.icon && (
                <div className={cn(
                  "flex h-4 w-4 flex-shrink-0 items-center justify-center transition-colors duration-200",
                  isActive
                    ? 'text-[var(--orb-nav-active-fg)]'
                    : (isDark
                        ? "text-[var(--orb-muted)] group-hover:text-[var(--orb-fg)]"
                        : "text-[var(--orb-muted)] group-hover:text-[var(--orb-muted)]")
                )}>
                  {item.icon}
                </div>
              )}
              
              <div className="flex-1 text-left overflow-hidden z-10">
                <div className={cn(
                  "text-sm truncate transition-colors duration-200",
                  isActive ? "font-semibold" : "font-medium"
                )}>
                  {item.title || item.label}
                </div>
                {item.description && (
                  <div className={cn(
                    "text-xs truncate transition-colors duration-200",
                    isActive
                      ? (isDark ? 'text-[color-mix(in_oklch,var(--orb-nav-active-fg)_70%,transparent)]' : 'text-[color-mix(in_oklch,var(--orb-nav-active-fg)_75%,transparent)]')
                      : "text-[var(--orb-muted)]"
                  )} title={item.description}>
                    {item.description}
                  </div>
                )}
              </div>
            </Button>

            {canPinItem && onTogglePin && (
              <button
                type="button"
                aria-label={isPinned ? t('navigation.pin.remove') : t('navigation.pin.add')}
                aria-pressed={isPinned}
                title={isPinned ? t('navigation.pin.remove') : t('navigation.pin.add')}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onTogglePin(item)
                }}
                className={cn(
                  'orb-navigation-pin-button absolute right-1 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors duration-150',
                  isPinned && 'orb-is-pinned',
                )}
              >
                <Pin className={cn('h-3.5 w-3.5', isPinned && 'fill-current')} />
              </button>
            )}
            
            {hasChildren && (
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-in-out",
                  isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className={cn("overflow-hidden", isExpanded && "pt-1")}>
                  <TreeMenu
                    items={item.children!}
                    onItemClick={onItemClick}
                    level={level + 1}
                    expandedIds={expandedIds}
                    onToggleExpand={onToggleExpand}
                    colorMode={colorMode}
                    enablePinning={enablePinning}
                    pinnedIds={pinnedIds}
                    onTogglePin={onTogglePin}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default TreeMenu
