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
  Search
} from 'lucide-react'
import { TreeMenu, TreeMenuItem } from './tree-menu'
import { useOrbcafeI18n } from '../../i18n'

export interface NavigationIslandProps {
  collapsed: boolean
  onToggle: () => void
  className?: string
  maxHeight?: number
  menuData?: TreeMenuItem[]
  colorMode?: 'light' | 'dark'
}

export const NavigationIsland: React.FC<NavigationIslandProps> = ({ 
  collapsed, 
  onToggle,
  className = '',
  maxHeight,
  menuData = [],
  colorMode = 'light',
}) => {
  const { t } = useOrbcafeI18n()
  const isDark = colorMode === 'dark'
  const router = useRouter()

  // -------------
  // 导航状态管理
  // -------------
  // const [menuData, setMenuData] = useState<TreeMenuItem[]>([]) // Removed internal state for menuData
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // 监听 collapsed 变化，当侧边栏折叠时，清空所有展开状态
  useEffect(() => {
    if (collapsed) {
      setExpandedNodes(new Set())
    }
  }, [collapsed])


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
      return menuData
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

    return filterNodes(menuData)
  }, [searchTerm, menuData])

  const searchExpandedNodes = useMemo(() => {
    if (searchTerm.trim()) {
      return new Set(getAllNodeIds(menuData))
    }
    return expandedNodes
  }, [searchTerm, menuData, expandedNodes, getAllNodeIds])

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

  // -------------
  // 渲染
  // -------------
  return (
    <div 
      className={`flex flex-col backdrop-blur-xl border shadow-[0_4px_8px_0_rgba(31,38,135,0.1)] ${
        collapsed ? 'w-14 rounded-full' : 'w-[234px] rounded-2xl'
      } relative ${className} ${
        isDark
          ? 'bg-[#111111] border-white/10'
          : 'bg-white/70 border-white/30'
      }`}
      style={{
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        transition: 'width 400ms cubic-bezier(0.4, 0.0, 0.2, 1), border-radius 0ms cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 400ms ease-out',
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
            {collapsed ? '📂' : (searchTerm ? t('navigation.noMatch') : t('navigation.noAccessibleApp'))}
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
                {menuData.map((category) => (
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
                            ? 'bg-[#90caf9] text-[#0b0b0b]'
                            : 'bg-[#1976d2] text-white'
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
    </div>
  )
}

export default NavigationIsland
