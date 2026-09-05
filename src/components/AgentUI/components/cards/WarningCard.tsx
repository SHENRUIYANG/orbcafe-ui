'use client'

import React from 'react'
import type { WarningCardProps } from '../cardTypes'
import { AlertTriangle, CheckCircle, Info, XCircle, X } from '@/components/Icons'

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
          iconColor: 'text-[var(--orb-primary)]',
          bgColor: 'bg-[var(--orb-p50)]',
        }
      case 'error':
        return {
          borderLeftColor: 'border-l-[var(--orb-status-error)]',
          iconColor: 'text-[var(--orb-status-error)]',
          bgColor: 'bg-[color-mix(in_oklch,var(--orb-status-error)_8%,transparent)]',
        }
      case 'success':
        return {
          borderLeftColor: 'border-l-green-500',
          iconColor: 'text-[var(--orb-status-success)]',
          bgColor: 'bg-[color-mix(in_oklch,var(--orb-status-success)_8%,transparent)]',
        }
      default: // warning
        return {
          borderLeftColor: 'border-l-yellow-500',
          iconColor: 'text-[var(--orb-status-warning)]',
          bgColor: 'bg-[color-mix(in_oklch,var(--orb-status-warning)_8%,transparent)]',
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
      className={`relative w-full overflow-hidden rounded-lg border border-[var(--orb-border)] bg-[var(--orb-canvas)] shadow-sm transition-all hover:shadow-md ${className}`}
      {...props}
    >
      <div className={`flex p-4 border-l-4 ${config.borderLeftColor} ${config.bgColor}`}>
        <div className={`flex-shrink-0 mr-3 ${config.iconColor}`}>
          {icon || getDefaultIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-base font-semibold text-[var(--orb-fg)]">
              {title}
            </h4>
            {warningType && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--orb-surface)] text-[var(--orb-muted)]">
                {warningType}
              </span>
            )}
          </div>
          
          {content && (
            <div className="text-sm text-[var(--orb-muted)] mb-2">
              {content}
            </div>
          )}

          {warnings && warnings.length > 0 && (
            <ul className="mt-2 space-y-1">
              {warnings.map((warning: string, index: number) => (
                <li key={index} className="flex items-start text-sm text-[var(--orb-muted)]">
                  <span className="mr-2 mt-1.5 w-1 h-1 rounded-full bg-[var(--orb-muted)] flex-shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {closable && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 text-[var(--orb-muted)] hover:text-[var(--orb-fg)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {onConfirm && (
        <div className="bg-[color-mix(in_oklch,var(--orb-surface)_50%,transparent)] px-4 py-3 flex justify-end border-t border-[var(--orb-border)]">
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-sm font-medium text-[var(--orb-on-primary)] bg-[var(--orb-primary)] hover:bg-[var(--orb-p600)] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--orb-primary)] focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {actionText || '确认'}
          </button>
        </div>
      )}
    </div>
  )
}

export default WarningCard
