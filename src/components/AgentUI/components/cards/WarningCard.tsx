'use client'

import React from 'react'
import type { WarningCardProps } from '../cardTypes'
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react'

const WarningCard: React.FC<WarningCardProps> = ({
  title = '警告',
  content,
  warningType,
  severity = 'warning',
  warnings = [],
  icon,
  closable = true,
  onClose,
  onConfirm,
  actionText,
  className = '',
  ...props
}) => {
  
  const getSeverityConfig = () => {
    switch (severity) {
      case 'info':
        return {
          borderLeftColor: 'border-l-blue-500',
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/10',
        }
      case 'error':
        return {
          borderLeftColor: 'border-l-red-500',
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/10',
        }
      case 'success':
        return {
          borderLeftColor: 'border-l-green-500',
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/10',
        }
      default: // warning
        return {
          borderLeftColor: 'border-l-yellow-500',
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
        }
    }
  }

  const getDefaultIcon = () => {
    switch (severity) {
      case 'info': return <Info className="w-5 h-5" />
      case 'error': return <XCircle className="w-5 h-5" />
      case 'success': return <CheckCircle className="w-5 h-5" />
      default: return <AlertTriangle className="w-5 h-5" />
    }
  }

  const config = getSeverityConfig()

  return (
    <div 
      className={`relative w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all hover:shadow-md ${className}`}
      {...props}
    >
      <div className={`flex p-4 border-l-4 ${config.borderLeftColor} ${config.bgColor}`}>
        <div className={`flex-shrink-0 mr-3 ${config.iconColor}`}>
          {icon || getDefaultIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h4>
            {warningType && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {warningType}
              </span>
            )}
          </div>
          
          {content && (
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {content}
            </div>
          )}

          {warnings && warnings.length > 0 && (
            <ul className="mt-2 space-y-1">
              {warnings.map((warning: string, index: number) => (
                <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                  <span className="mr-2 mt-1.5 w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 flex-shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {closable && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {onConfirm && (
        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex justify-end border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {actionText || '确认'}
          </button>
        </div>
      )}
    </div>
  )
}

export default WarningCard
