'use client'

import React from 'react'
import { Copy, RefreshCw, Volume2, ThumbsUp, ThumbsDown } from '@/components/Icons'
import { cn } from '../../lib/utils'

export interface MiniAnswerIslandButton {
  type: 'copy' | 'refresh' | 'volume' | 'like' | 'dislike'
  onClick: () => void
  disabled?: boolean
  active?: boolean
  loading?: boolean
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
          aria-busy={btn.loading || undefined}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            "text-[var(--orb-muted)] hover:text-[var(--orb-fg)] dark:text-[var(--orb-muted)] dark:hover:text-[var(--orb-fg)]",
            "hover:bg-[var(--orb-hover)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            btn.active && "text-[var(--orb-primary)] bg-[var(--orb-p50)]",
            btn.type === 'refresh' && btn.loading && "animate-spin"
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
