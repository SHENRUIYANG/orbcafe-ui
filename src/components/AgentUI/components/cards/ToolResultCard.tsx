'use client'

import React, { useState } from 'react'
import type { ToolResultCardProps } from '../cardTypes'
import { CheckCircle, Clock, XCircle, Loader2, ChevronDown, ChevronRight, Terminal, X } from '@/components/Icons'

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
          iconColor: 'text-[var(--orb-primary)]',
          badgeBg: 'bg-[var(--orb-p50)]',
          badgeText: 'text-[var(--orb-status-primary)]',
          label: '执行中'
        }
      case 'error':
        return {
          iconColor: 'text-[var(--orb-status-error)]',
          badgeBg: 'bg-[color-mix(in_oklch,var(--orb-status-error)_10%,transparent)]',
          badgeText: 'text-[var(--orb-status-error)]',
          label: '失败'
        }
      default: 
        return {
          iconColor: 'text-[var(--orb-status-success)]',
          badgeBg: 'bg-[color-mix(in_oklch,var(--orb-status-success)_8%,transparent)]',
          badgeText: 'text-[var(--orb-status-success)]',
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
      className={`w-full overflow-hidden rounded-lg border border-[var(--orb-border)] bg-[var(--orb-canvas)] shadow-sm transition-all hover:shadow-md ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--orb-border)] bg-[color-mix(in_oklch,var(--orb-surface)_50%,transparent)]">
        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            {icon || getDefaultIcon()}
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-[var(--orb-fg)]">
                {displayTitle}
              </h4>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.badgeBg} ${config.badgeText}`}>
                {config.label}
              </span>
            </div>
            {toolName && title && (
              <div className="text-xs text-[var(--orb-muted)] flex items-center mt-0.5">
                <Terminal className="w-3 h-3 mr-1" />
                {toolName}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[var(--orb-muted)]">
          {duration && (
            <div className="flex items-center bg-[var(--orb-surface)] px-2 py-1 rounded">
              <Clock className="w-3 h-3 mr-1" />
              {formatDuration(duration)}
            </div>
          )}
          {closable && onClose && (
            <button
              onClick={onClose}
              className="text-[var(--orb-muted)] hover:text-[var(--orb-fg)] transition-colors p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {content && (
          <div className="text-sm text-[var(--orb-muted)] mb-4 leading-relaxed">
            {content}
          </div>
        )}

        {parameters && (
          <div className="mb-3">
            <button 
              onClick={() => setShowParameters(!showParameters)}
              className="flex items-center text-xs font-medium text-[var(--orb-muted)] hover:text-[var(--orb-fg)] dark:text-[var(--orb-muted)] mb-2"
            >
              {showParameters ? <ChevronDown className="w-3.5 h-3.5 mr-1" /> : <ChevronRight className="w-3.5 h-3.5 mr-1" />}
              <div className="w-3.5 h-3.5 mr-1.5" />
              输入参数
            </button>
            
            {showParameters && (
              <div className="bg-[var(--orb-surface)] dark:bg-[var(--orb-canvas)] rounded border border-[var(--orb-border)] overflow-hidden">
                <pre className="p-3 text-xs font-mono text-[var(--orb-muted)] overflow-x-auto">
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
              className="flex items-center text-xs font-medium text-[var(--orb-muted)] hover:text-[var(--orb-fg)] dark:text-[var(--orb-muted)] mb-2"
            >
              {showResult ? <ChevronDown className="w-3.5 h-3.5 mr-1" /> : <ChevronRight className="w-3.5 h-3.5 mr-1" />}
              <Terminal className="w-3.5 h-3.5 mr-1.5" />
              执行结果
            </button>

            {showResult && (
              <div className="bg-[var(--orb-surface)] dark:bg-[var(--orb-canvas)] rounded border border-[var(--orb-border)] overflow-hidden">
                <pre className="p-3 text-xs font-mono text-[var(--orb-muted)] overflow-x-auto">
                  {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {onAction && (
          <div className="mt-3 pt-3 border-t border-[var(--orb-border)] flex justify-end">
            <button
              onClick={onAction}
              className="px-4 py-1.5 text-sm font-medium text-[var(--orb-on-primary)] bg-[var(--orb-primary)] hover:bg-[var(--orb-p600)] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--orb-primary)] focus:ring-offset-2 dark:focus:ring-offset-gray-900"
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
