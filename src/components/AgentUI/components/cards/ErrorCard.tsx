'use client'

import React, { useState } from 'react'
import type { ErrorCardProps } from '../cardTypes'
import { AlertCircle, ChevronDown, ChevronRight, RotateCw, X } from 'lucide-react'

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
      className={`relative w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all hover:shadow-md ${className}`} 
      {...props}
    >
      <div className="flex p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10">
        <div className="flex-shrink-0 mr-3 text-red-500 mt-0.5">
          {icon || <AlertCircle className="w-5 h-5" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h4>
            {errorCode && (
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                {errorCode}
              </span>
            )}
          </div>
          
          {content && (
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
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
                  className="flex items-center text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? '重试中...' : '重试'}
                </button>
              )}
              
              {stack && (
                <button
                  onClick={() => setShowStack(!showStack)}
                  className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
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
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors self-start"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {stack && showStack && (
        <div className="bg-gray-50 dark:bg-gray-950 p-3 border-t border-gray-100 dark:border-gray-800">
          <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
            {stack}
          </pre>
        </div>
      )}
    </div>
  )
}

export default ErrorCard
