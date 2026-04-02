'use client'

import React, { useState } from 'react'
import type { ToolResultCardProps } from '../cardTypes'
import { CheckCircle, Clock, XCircle, Loader2, ChevronDown, ChevronRight, Terminal, Box, X } from 'lucide-react'

const ToolResultCard: React.FC<ToolResultCardProps> = ({
  title,
  content,
  toolName,
  parameters,
  result,
  status,
  duration,
  icon,
  closable = false,
  onClose,
  onAction,
  actionText,
  className = '',
  ...props
}) => {
  const [showParameters, setShowParameters] = useState(false)
  const [showResult, setShowResult] = useState(true)

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          iconColor: 'text-blue-500',
          badgeBg: 'bg-blue-50 dark:bg-blue-900/30',
          badgeText: 'text-blue-600 dark:text-blue-400',
          label: '执行中'
        }
      case 'error':
        return {
          iconColor: 'text-red-500',
          badgeBg: 'bg-red-50 dark:bg-red-900/30',
          badgeText: 'text-red-600 dark:text-red-400',
          label: '失败'
        }
      default: 
        return {
          iconColor: 'text-green-500',
          badgeBg: 'bg-green-50 dark:bg-green-900/30',
          badgeText: 'text-green-600 dark:text-green-400',
          label: '成功'
        }
    }
  }

  const getDefaultIcon = () => {
    switch (status) {
      case 'pending': return <Loader2 className="w-5 h-5 animate-spin" />
      case 'error': return <XCircle className="w-5 h-5" />
      default: return <CheckCircle className="w-5 h-5" />
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return ''
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const config = getStatusConfig()
  const displayTitle = title || toolName || '工具调用'

  return (
    <div 
      className={`w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all hover:shadow-md ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            {icon || getDefaultIcon()}
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {displayTitle}
              </h4>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.badgeBg} ${config.badgeText}`}>
                {config.label}
              </span>
            </div>
            {toolName && title && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                <Terminal className="w-3 h-3 mr-1" />
                {toolName}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          {duration && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              <Clock className="w-3 h-3 mr-1" />
              {formatDuration(duration)}
            </div>
          )}
          {closable && onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {content && (
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            {content}
          </div>
        )}

        {parameters && (
          <div className="mb-3">
            <button 
              onClick={() => setShowParameters(!showParameters)}
              className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-2"
            >
              {showParameters ? <ChevronDown className="w-3.5 h-3.5 mr-1" /> : <ChevronRight className="w-3.5 h-3.5 mr-1" />}
              <Box className="w-3.5 h-3.5 mr-1.5" />
              输入参数
            </button>
            
            {showParameters && (
              <div className="bg-gray-50 dark:bg-gray-950 rounded border border-gray-100 dark:border-gray-800 overflow-hidden">
                <pre className="p-3 text-xs font-mono text-gray-600 dark:text-gray-400 overflow-x-auto">
                  {JSON.stringify(parameters, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {result && (
          <div>
             <button 
              onClick={() => setShowResult(!showResult)}
              className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-2"
            >
              {showResult ? <ChevronDown className="w-3.5 h-3.5 mr-1" /> : <ChevronRight className="w-3.5 h-3.5 mr-1" />}
              <Terminal className="w-3.5 h-3.5 mr-1.5" />
              执行结果
            </button>

            {showResult && (
              <div className="bg-gray-50 dark:bg-gray-950 rounded border border-gray-100 dark:border-gray-800 overflow-hidden">
                <pre className="p-3 text-xs font-mono text-gray-600 dark:text-gray-400 overflow-x-auto">
                  {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {onAction && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button
              onClick={onAction}
              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {actionText || '执行操作'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ToolResultCard
