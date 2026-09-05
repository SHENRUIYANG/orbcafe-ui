'use client'

import React, { useState } from 'react'
import type { ErrorCardProps } from '../cardTypes'
import { AlertCircle, ChevronDown, ChevronRight, RotateCw, X } from '@/components/Icons'

const ErrorCard: React.FC<ErrorCardProps> = ({
  title = '发生错误',
  content,
  errorCode,
  stack,
  icon,
  closable = true,
  onClose,
  onRetry,
  className = '',
  ...props
}) => {
  const [showStack, setShowStack] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (!onRetry) return
    
    setIsRetrying(true)
    try {
      await onRetry()
    } catch (err) {
      console.error('重试失败:', err)
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg border border-[var(--orb-border)] bg-[var(--orb-canvas)] shadow-sm transition-all hover:shadow-md ${className}`}
      {...props}
    >
      <div className="flex p-4 border-l-4 border-l-[var(--orb-status-error)] bg-[color-mix(in_oklch,var(--orb-status-error)_8%,transparent)]">
        <div className="flex-shrink-0 mr-3 text-[var(--orb-status-error)] mt-0.5">
          {icon || <AlertCircle className="w-5 h-5" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-base font-semibold text-[var(--orb-fg)]">
              {title}
            </h4>
            {errorCode && (
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[color-mix(in_oklch,var(--orb-status-error)_14%,transparent)] text-[var(--orb-status-error)]">
                {errorCode}
              </span>
            )}
          </div>
          
          {content && (
            <div className="text-sm text-[var(--orb-muted)] mb-3 leading-relaxed">
              {typeof content === 'string' ? (
                <p className="whitespace-pre-wrap">{content}</p>
              ) : (
                content
              )}
            </div>
          )}

          {(onRetry || stack) && (
            <div className="flex items-center space-x-4 mt-2">
              {onRetry && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="flex items-center text-xs font-medium text-[var(--orb-status-error)] hover:opacity-80 transition-colors disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? '重试中...' : '重试'}
                </button>
              )}
              
              {stack && (
                <button
                  onClick={() => setShowStack(!showStack)}
                  className="flex items-center text-xs font-medium text-[var(--orb-muted)] hover:text-[var(--orb-fg)] dark:text-[var(--orb-muted)] transition-colors"
                >
                  {showStack ? <ChevronDown className="w-3.5 h-3.5 mr-1" /> : <ChevronRight className="w-3.5 h-3.5 mr-1" />}
                  {showStack ? '隐藏详情' : '查看详情'}
                </button>
              )}
            </div>
          )}
        </div>

        {closable && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 text-[var(--orb-muted)] hover:text-[var(--orb-fg)] transition-colors self-start"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {stack && showStack && (
        <div className="bg-[var(--orb-surface)] dark:bg-[var(--orb-canvas)] p-3 border-t border-[var(--orb-border)]">
          <pre className="text-xs font-mono text-[var(--orb-muted)] overflow-x-auto whitespace-pre-wrap p-2 bg-[var(--orb-canvas)] rounded border border-[var(--orb-border)]">
            {stack}
          </pre>
        </div>
      )}
    </div>
  )
}

export default ErrorCard
