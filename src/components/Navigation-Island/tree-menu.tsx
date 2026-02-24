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
import { ChevronRight } from 'lucide-react'
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
}

export function TreeMenu({
  items,
  onItemClick,
  className = '',
  level = 0,
  expandedIds,
  onToggleExpand,
  colorMode = 'light',
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
        <div className="text-sm text-gray-500 p-2">{t('navigation.noItems')}</div>
      </div>
    )
  }

  return (
    <div className={cn('tree-menu', className)}>
      {items.map((item) => {
        const isExpanded = currentExpandedItems.has(item.id) || item.isExpanded
        const hasChildren = item.children && item.children.length > 0
        
        // 判断是否选中：
        // 1. 完全匹配 appurl 或 href
        // 2. 或者是当前路径的父路径 (可选，视需求而定，这里先做精确匹配)
        const targetUrl = item.appurl || item.href
        const isActive = mounted && targetUrl ? pathname === targetUrl : false
        
        return (
          <div key={item.id} className="tree-menu-item relative">
            {/* 选中态背景指示条 - 仅对非折叠父菜单或叶子节点显示 */}
            {isActive && (
              <div
                className={cn(
                  'absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full z-10',
                  isDark ? 'bg-[#90caf9]' : 'bg-[#1976d2]',
                )}
              />
            )}
            
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-2 h-auto py-2 relative overflow-hidden group',
                `ml-${level * 4}`,
                isActive 
                  ? (isDark
                      ? 'bg-transparent text-[#90caf9] hover:bg-gray-800/35'
                      : 'bg-transparent text-[#1976d2] hover:bg-gray-100/60')
                  : (isDark
                      ? 'hover:bg-gray-800/50 text-gray-300'
                      : 'hover:bg-gray-100/50 text-gray-700')
              )}
              onClick={() => handleItemClick(item)}
            >
              {hasChildren && (
                <div className={cn(
                  "flex-shrink-0 transition-transform duration-200",
                  isExpanded && "rotate-90",
                  isActive
                    ? (isDark ? 'text-[#90caf9]' : 'text-[#1976d2]')
                    : (isDark
                        ? "text-gray-500 group-hover:text-gray-300"
                        : "text-gray-400 group-hover:text-gray-600")
                )}>
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
              
              {!hasChildren && (
                <div className="w-4 h-4 flex-shrink-0" />
              )}
              
              {item.icon && (
                <div className={cn(
                  "flex-shrink-0 transition-colors duration-200",
                  isActive
                    ? (isDark ? 'text-[#90caf9]' : 'text-[#1976d2]')
                    : (isDark
                        ? "text-gray-500 group-hover:text-gray-300"
                        : "text-gray-400 group-hover:text-gray-600")
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
                      ? (isDark ? 'text-[#90caf9]/70' : 'text-[#1976d2]/75')
                      : (isDark ? "text-gray-400" : "text-gray-500")
                  )} title={item.description}>
                    {item.description}
                  </div>
                )}
              </div>
            </Button>
            
            {hasChildren && (
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-in-out",
                  isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <TreeMenu
                    items={item.children!}
                    onItemClick={onItemClick}
                    level={level + 1}
                    expandedIds={expandedIds}
                    onToggleExpand={onToggleExpand}
                    colorMode={colorMode}
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
