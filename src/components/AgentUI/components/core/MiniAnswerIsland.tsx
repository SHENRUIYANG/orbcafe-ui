'use client'

import React from 'react'
import { Copy, RefreshCw, Volume2, ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface MiniAnswerIslandButton {
  type: 'copy' | 'refresh' | 'volume' | 'like' | 'dislike'
  onClick: () => void
  disabled?: boolean
  active?: boolean
}

export interface MiniAnswerIslandProps {
  buttons: MiniAnswerIslandButton[]
  size?: 'sm' | 'md'
  variant?: 'default' | 'ghost'
  className?: string
}

export const MiniAnswerIsland: React.FC<MiniAnswerIslandProps> = ({
  buttons,
  className
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'copy': return <Copy size={14} />
      case 'refresh': return <RefreshCw size={14} />
      case 'volume': return <Volume2 size={14} />
      case 'like': return <ThumbsUp size={14} />
      case 'dislike': return <ThumbsDown size={14} />
      default: return null
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {buttons.map((btn, index) => (
        <button
          key={`${btn.type}-${index}`}
          onClick={btn.onClick}
          disabled={btn.disabled}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            btn.active && "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
            btn.type === 'refresh' && btn.disabled && "animate-spin"
          )}
          title={btn.type}
          type="button"
        >
          {getIcon(btn.type)}
        </button>
      ))}
    </div>
  )
}
