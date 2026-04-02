'use client'

import React, { useState, useMemo } from 'react'
import type { SuggestionsCardProps } from '../cardTypes'
import { Lightbulb, Search, X, ChevronRight } from 'lucide-react'

const SuggestionsCard: React.FC<SuggestionsCardProps> = ({
  title = '相关推荐',
  content,
  suggestions,
  onSuggestionClick,
  maxDisplay = 5,
  icon,
  closable = false,
  onClose,
  className = '',
  ...props
}) => {
  const [showAll, setShowAll] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const filteredSuggestions = useMemo(() => {
    if (!searchText.trim()) return suggestions
    
    return suggestions.filter((suggestion: string) =>
      suggestion.toLowerCase().includes(searchText.toLowerCase())
    )
  }, [suggestions, searchText])

  const displayedSuggestions = useMemo(() => {
    if (showAll) return filteredSuggestions
    return filteredSuggestions.slice(0, maxDisplay)
  }, [filteredSuggestions, showAll, maxDisplay])

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick?.(suggestion)
  }

  if (!suggestions || suggestions.length === 0) {
    return null
  }

  return (
    <div 
      className={`w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all hover:shadow-md ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-blue-50/30 dark:bg-blue-900/10">
        <div className="flex items-center space-x-2.5">
          <div className="text-blue-500 flex-shrink-0">
            {icon || <Lightbulb className="w-5 h-5" />}
          </div>
          
          <div className="flex flex-col">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              {title}
            </h4>
            {content && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {content}
                </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {suggestions.length > 3 && (
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-1.5 rounded-md transition-colors ${showSearch ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title={showSearch ? '关闭搜索' : '搜索问题'}
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {closable && onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索相关问题..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full text-sm px-3 py-1.5 pl-8 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              autoFocus
            />
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
      )}

      <div className="p-2">
        <ul className="space-y-1">
          {displayedSuggestions.map((suggestion: string, index: number) => (
            <li key={index}>
              <button
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group flex items-start justify-between"
              >
                <span>{suggestion}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
              </button>
            </li>
          ))}
        </ul>

        {filteredSuggestions.length > maxDisplay && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-center py-2 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors border-t border-gray-50 dark:border-gray-800/50 mt-1"
          >
            {showAll ? '收起' : `查看全部 (${filteredSuggestions.length})`}
          </button>
        )}
        
        {filteredSuggestions.length === 0 && searchText && (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                没有找到匹配的建议
            </div>
        )}
      </div>
    </div>
  )
}

export default SuggestionsCard
