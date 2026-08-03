/**
 * @file 10_Frontend/components/ui/molecules/navigation-island.tsx
 * 
 * @summary Core frontend navigation-island module for the ORBAI Core project
 * @author ORBAICODER
 * @version 1.0.0
 * @date 2025-01-19
 * 
 * @description
 * This file is responsible for:
 *  - Implementing navigation-island functionality within frontend workflows
 *  - Integrating with shared ORBAI Core application processes under frontend
 * 
 * @logic
 * 1. Import required dependencies and configuration
 * 2. Execute the primary logic for navigation-island
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
 * SECTION 1: navigation-island Core Logic
 * Section overview and description.
 * --------------------------
 */

'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FolderTree,
  PanelLeftOpen,
  PanelRight,
  Pin,
  Search
} from '@/components/Icons'
import { TreeMenu, TreeMenuItem } from './tree-menu'
import { useOrbcafeI18n } from '../../i18n'
import type { NavigationIslandProps } from './navigation-island.types'

export type { NavigationIslandDisplayMode, NavigationIslandProps } from './navigation-island.types'

const DEFAULT_PIN_STORAGE_KEY = 'orbcafe:navigation-island:pinned-items'
const PINNED_SECTION_ID = 'orbcafe-navigation-pinned'

const getNodeTargetUrl = (node: TreeMenuItem) => node.appurl || node.href

const collectPinnableNodes = (nodes: TreeMenuItem[]): TreeMenuItem[] => {
  const items: TreeMenuItem[] = []

  nodes.forEach((node) => {
    const hasChildren = Boolean(node.children?.length)
    const canPin = node.pinnable !== false && Boolean(getNodeTargetUrl(node)) && !hasChildren

    if (canPin) {
      items.push({
        ...node,
        children: undefined,
      })
    }

    if (node.children?.length) {
      items.push(...collectPinnableNodes(node.children))
    }
  })

  return items
}

export const NavigationIsland: React.FC<NavigationIslandProps> = ({ 
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
  const { t } = useOrbcafeI18n()
  const isDark = colorMode === 'dark'
  const isFloating = displayMode === 'floating'
  const router = useRouter()

  // -------------
  // 导航状态管理
  // -------------
  // const [menuData, setMenuData] = useState<TreeMenuItem[]>([]) // Removed internal state for menuData
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [internalPinnedItemIds, setInternalPinnedItemIds] = useState<string[]>(defaultPinnedItemIds)
  const [pinningHydrated, setPinningHydrated] = useState(false)
  const isPinningControlled = pinnedItemIds !== undefined
  const effectivePinnedItemIds = useMemo(
    () => pinnedItemIds ?? internalPinnedItemIds,
    [pinnedItemIds, internalPinnedItemIds],
  )
  const pinnedIdSet = useMemo(
    () => new Set(effectivePinnedItemIds),
    [effectivePinnedItemIds],
  )

  // 监听 collapsed 变化，当侧边栏折叠时，清空所有展开状态
  useEffect(() => {
    if (collapsed) {
      setExpandedNodes(new Set())
    }
  }, [collapsed])

  useEffect(() => {
    if (!enablePinning || isPinningControlled) {
      setPinningHydrated(true)
      return
    }

    try {
      const savedPinnedItemIds = window.localStorage.getItem(pinStorageKey)
      if (savedPinnedItemIds) {
        const parsedPinnedItemIds = JSON.parse(savedPinnedItemIds)
        if (Array.isArray(parsedPinnedItemIds)) {
          setInternalPinnedItemIds(parsedPinnedItemIds.filter((id): id is string => typeof id === 'string'))
        }
      }
    } catch {
      // ignore storage access failures
    } finally {
      setPinningHydrated(true)
    }
  }, [enablePinning, isPinningControlled, pinStorageKey])

  useEffect(() => {
    if (!enablePinning || isPinningControlled || !pinningHydrated) return

    try {
      window.localStorage.setItem(pinStorageKey, JSON.stringify(effectivePinnedItemIds))
    } catch {
      // ignore storage access failures
    }
  }, [effectivePinnedItemIds, enablePinning, isPinningControlled, pinStorageKey, pinningHydrated])

  useEffect(() => {
    if (!enablePinning || collapsed || effectivePinnedItemIds.length === 0) return

    setExpandedNodes((currentExpandedNodes) => {
      if (currentExpandedNodes.has(PINNED_SECTION_ID)) return currentExpandedNodes
      const nextExpandedNodes = new Set(currentExpandedNodes)
      nextExpandedNodes.add(PINNED_SECTION_ID)
      return nextExpandedNodes
    })
  }, [collapsed, effectivePinnedItemIds.length, enablePinning])

  const setEffectivePinnedItemIds = useCallback(
    (nextPinnedItemIds: string[]) => {
      const uniquePinnedItemIds = Array.from(new Set(nextPinnedItemIds))
      if (!isPinningControlled) {
        setInternalPinnedItemIds(uniquePinnedItemIds)
      }
      onPinnedItemIdsChange?.(uniquePinnedItemIds)
    },
    [isPinningControlled, onPinnedItemIdsChange],
  )

  const handleTogglePin = useCallback(
    (node: TreeMenuItem) => {
      const nodeId = node.id
      const nextPinnedItemIds = pinnedIdSet.has(nodeId)
        ? effectivePinnedItemIds.filter((id) => id !== nodeId)
        : [...effectivePinnedItemIds, nodeId]

      setEffectivePinnedItemIds(nextPinnedItemIds)
    },
    [effectivePinnedItemIds, pinnedIdSet, setEffectivePinnedItemIds],
  )

  const displayMenuData = useMemo(() => {
    if (!enablePinning || effectivePinnedItemIds.length === 0) {
      return menuData
    }

    const pinnableItemsById = new Map(collectPinnableNodes(menuData).map((item) => [item.id, item]))
    const pinnedItems = effectivePinnedItemIds
      .map((id) => pinnableItemsById.get(id))
      .filter((item): item is TreeMenuItem => Boolean(item))

    if (pinnedItems.length === 0) {
      return menuData
    }

    return [
      {
        id: PINNED_SECTION_ID,
        title: pinnedSectionTitle || t('navigation.pinned'),
        icon: <Pin className="w-4 h-4" />,
        children: pinnedItems,
        pinnable: false,
      },
      ...menuData,
    ]
  }, [effectivePinnedItemIds, enablePinning, menuData, pinnedSectionTitle, t])


  // -------------
  // 搜索功能
  // -------------
  const getAllNodeIds = useCallback((nodes: TreeMenuItem[]): string[] => {
    const ids: string[] = []
    const traverse = (nodeList: TreeMenuItem[]) => {
      nodeList.forEach(node => {
        ids.push(node.id)
        if (node.children) {
          traverse(node.children)
        }
      })
    }
    traverse(nodes)
    return ids
  }, [])

  const filteredMenuData = useMemo(() => {
    if (!searchTerm.trim()) {
      return displayMenuData
    }

    const filterNodes = (nodes: TreeMenuItem[]): TreeMenuItem[] => {
      return nodes.reduce((acc: TreeMenuItem[], node) => {
        const matchesSearch = node.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            node.description?.toLowerCase().includes(searchTerm.toLowerCase())
        
        const filteredChildren = node.children ? filterNodes(node.children) : []
        
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : node.children
          })
        }
        
        return acc
      }, [])
    }

    return filterNodes(displayMenuData)
  }, [searchTerm, displayMenuData])

  const searchExpandedNodes = useMemo(() => {
    if (searchTerm.trim()) {
      return new Set(getAllNodeIds(displayMenuData))
    }
    return expandedNodes
  }, [searchTerm, displayMenuData, expandedNodes, getAllNodeIds])

  // -------------
  // 交互处理
  // -------------
  const handleNodeClick = useCallback(async (node: TreeMenuItem) => {
    console.log('🖱️ 导航菜单项点击:', node)
    
    // 特殊处理：点击chat菜单项时直接创建新会话
    if (node.id === 'chat' || (node.appurl === '/chat')) {
      console.log('💬 检测到chat菜单点击，跳转到新的聊天视图')
      try {
        router.push('/chat?new=true')
      } catch (error) {
        console.error('❌ 无法跳转到新聊天视图:', error)
        router.push('/chat')
      }
      return
    }
    
    // 其他菜单项的默认行为
    const targetUrl = node.appurl || node.href
    if (targetUrl) {
      // 检查是否为外部链接 (以 http 或 https 开头)
      // 用户需求：如果是以http开头的，则直接引用这里的完整地址作为这个app的地址，方便集成其他系统
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        window.open(targetUrl, '_blank')
      } else {
        router.push(targetUrl)
      }
    }
  }, [router])

  const handleDisplayModeToggle = useCallback(() => {
    onDisplayModeChange?.(displayMode === 'fixed' ? 'floating' : 'fixed')
  }, [displayMode, onDisplayModeChange])

  // -------------
  // 渲染
  // -------------
  return (
    <div 
      className={`flex flex-col backdrop-blur-xl border ${
        isFloating
          ? 'shadow-[0_28px_80px_rgba(15,23,42,0.34)]'
          : 'shadow-[0_4px_8px_0_rgba(31,38,135,0.1)]'
      } ${
        collapsed ? 'w-14 rounded-full' : 'w-[234px] rounded-2xl'
      } relative ${className} ${
        isDark
          ? isFloating ? 'border-white/25' : 'bg-[#111111] border-white/10'
          : isFloating ? 'border-white/70' : 'bg-white/70 border-white/30'
      }`}
      style={{
        backdropFilter: isFloating ? 'blur(34px) saturate(230%) contrast(1.12)' : 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: isFloating ? 'blur(34px) saturate(230%) contrast(1.12)' : 'blur(16px) saturate(180%)',
        backgroundColor: isFloating
          ? isDark
            ? 'rgba(8, 12, 18, 0.34)'
            : 'rgba(255, 255, 255, 0.24)'
          : undefined,
        backgroundImage: isFloating
          ? isDark
            ? 'radial-gradient(circle at 28% 8%, rgba(255,255,255,0.14), rgba(255,255,255,0) 44%), linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.015) 50%, rgba(33,188,255,0.05))'
            : 'radial-gradient(circle at 28% 8%, rgba(255,255,255,0.42), rgba(255,255,255,0) 46%), linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.07) 50%, rgba(33,188,255,0.08))'
          : undefined,
        boxShadow: isFloating
          ? isDark
            ? 'inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(255,255,255,0.08), 0 26px 90px rgba(0,0,0,0.52), 0 0 0 1px rgba(255,255,255,0.06)'
            : 'inset 0 1px 0 rgba(255,255,255,0.88), inset 0 -1px 0 rgba(255,255,255,0.34), 0 26px 90px rgba(15,23,42,0.24), 0 0 0 1px rgba(255,255,255,0.35)'
          : undefined,
        transition: 'width 400ms cubic-bezier(0.4, 0.0, 0.2, 1), border-radius 0ms cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 400ms ease-out, background-color 220ms ease-out, backdrop-filter 220ms ease-out',
        maxHeight: maxHeight ? `${maxHeight}px` : undefined
      }}
    >
      {/* 搜索区域 */}
      <div className={`pt-4 pb-2 transition-all duration-500 ease-in-out ${collapsed ? 'px-1' : 'px-2'}`}>
        {collapsed ? (
          <div className="flex justify-center">
            <button
              onClick={onToggle}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 ${
                isDark
                  ? 'text-gray-300 hover:bg-gray-800'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              title={t('navigation.expand')}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className={`relative transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100 delay-200'}`}>
            <input
              type="text"
              placeholder={t('navigation.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? 'border-gray-700 bg-[#1A1A1A] text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Search className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>
        )}
      </div>

      {/* 导航菜单区域 */}
      <nav className={`flex-1 pb-4 transition-all duration-500 ease-in-out overflow-y-auto min-h-0 ${collapsed ? 'px-1' : 'px-2'}`}>
        {filteredMenuData.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
            {collapsed ? <FolderTree className="h-5 w-5" /> : (searchTerm ? t('navigation.noMatch') : t('navigation.noAccessibleApp'))}
          </div>
        ) : (
          <>
            {/* 展开状态显示完整菜单 */}
            {!collapsed && (
              <div className={`transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100 delay-200'}`}>
                <TreeMenu
                  items={filteredMenuData}
                  onItemClick={handleNodeClick}
                  className="space-y-1"
                  expandedIds={searchExpandedNodes}
                  colorMode={colorMode}
                  enablePinning={enablePinning}
                  pinnedIds={pinnedIdSet}
                  onTogglePin={handleTogglePin}
                  onToggleExpand={(id) => {
                    const newExpanded = new Set(expandedNodes)
                    
                    // 检查是否为一级菜单项
                    const isTopLevel = filteredMenuData.some(item => item.id === id)
                    
                    if (isTopLevel) {
                      // 如果是一级菜单
                      if (newExpanded.has(id)) {
                        // 如果已展开，则折叠
                        newExpanded.delete(id)
                      } else {
                        // 如果未展开，则展开该项，并折叠其他所有一级菜单
                        filteredMenuData.forEach(item => {
                          if (item.id !== id && newExpanded.has(item.id)) {
                            newExpanded.delete(item.id)
                          }
                        })
                        newExpanded.add(id)
                      }
                    } else {
                      // 非一级菜单，保持原有逻辑（多选展开）
                      if (newExpanded.has(id)) {
                        newExpanded.delete(id)
                      } else {
                        newExpanded.add(id)
                      }
                    }
                    
                    setExpandedNodes(newExpanded)
                  }}
                />
              </div>
            )}
            
            {/* 折叠状态显示简化图标 */}
            {collapsed && (
              <div className="space-y-2">
                {displayMenuData.map((category) => (
                  <div key={category.id} className="space-y-1">
                    <button
                      onClick={() => {
                        // 1. 展开侧边栏
                        onToggle()
                        // 2. 仅展开当前点击的菜单项（不保留之前的状态）
                        const newExpanded = new Set<string>([category.id])
                        setExpandedNodes(newExpanded)
                      }}
                      className={`w-full flex items-center justify-center p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                        isDark
                          ? 'text-gray-400 hover:bg-gray-800'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      title={t('navigation.expandView', { title: category.title || '' })}
                    >
                      {category.icon || (
                        <div className={`w-6 h-6 rounded text-xs flex items-center justify-center font-medium ${
                          isDark
                            ? 'bg-[#91a8d1] text-[#0b0b0b]'
                            : 'bg-[#154194] text-white'
                        }`}>
                          {category.title?.charAt(0) || '?'}
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </nav>

      {/* 折叠按钮 */}
      {!collapsed && (
        <button
          onClick={onToggle}
          className={`absolute -bottom-1 -right-1 w-6 h-6 bg-transparent rounded-full flex items-center justify-center transition-all duration-300 ease-in-out z-20 ${
            isDark ? 'hover:bg-gray-800/50' : 'hover:bg-white/20'
          }`}
          title={t('navigation.collapse')}
        >
          <div 
            className="absolute"
            style={{
              bottom: '0px',
              right: '0px',
              width: '16px',
              height: '16px',
              overflow: 'hidden'
            }}
          >
            <div
              className={isDark ? 'border-yellow-400' : ''}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '16px',
                border: '3px solid #21BCFF',
                backgroundColor: 'transparent',
                position: 'absolute',
                top: '-16px',
                left: '-16px'
              }}
            />
          </div>
        </button>
      )}

      {showDisplayModeToggle && collapsed && (
        <button
          type="button"
          onClick={handleDisplayModeToggle}
          className={`absolute -bottom-4 left-1/2 z-30 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 ${
            isDark
              ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700'
          }`}
          style={{ touchAction: 'manipulation' }}
          title={isFloating ? t('navigation.mode.switchToFixed') : t('navigation.mode.switchToFloating')}
          aria-label={isFloating ? t('navigation.mode.switchToFixed') : t('navigation.mode.switchToFloating')}
        >
          {isFloating
            ? <PanelLeftOpen className="h-4 w-4" />
            : <PanelRight className="h-4 w-4" />}
        </button>
      )}
    </div>
  )
}

export default NavigationIsland
