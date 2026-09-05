'use client'

import React from 'react'
import type { QuoteBlockProps } from '../cardTypes'
import { CheckCircle, Copy, Info, MessageCircle } from '@/components/Icons'

const QuoteBlock: React.FC<QuoteBlockProps> = ({
  content,
  author,
  source,
  type = 'quote',
  isLoading = false,
  className = '',
  style
}) => {
  
  const cleanContent = content.replace(/^>\s?/gm, '').trim()

  const handleCopy = async () => {
    try {
      let copyText = cleanContent
      if (author) copyText += `\n\n— ${author}`
      if (source) copyText += ` (${source})`
      
      await navigator.clipboard.writeText(copyText)
      
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const getTypeConfig = () => {
    switch (type) {
      case 'cite':
        return {
          borderColor: 'border-l-green-500',
          bgColor: 'bg-[color-mix(in_oklch,var(--orb-status-success)_8%,transparent)]',
          iconColor: 'text-[var(--orb-status-success)]',
          icon: <Info className="w-5 h-5" />,
          label: '引用'
        }
      case 'reference':
        return {
          borderColor: 'border-l-purple-500',
          bgColor: 'bg-[color-mix(in_oklch,var(--orb-accent)_8%,transparent)]',
          iconColor: 'text-[var(--orb-accent)]',
          icon: <CheckCircle className="w-5 h-5" />,
          label: '参考'
        }
      default: 
        return {
          borderColor: 'border-l-blue-500',
          bgColor: 'bg-[var(--orb-p50)]',
          iconColor: 'text-[var(--orb-primary)]',
          icon: <MessageCircle className="w-5 h-5" />,
          label: '引用'
        }
    }
  }

  const typeConfig = getTypeConfig()

  if (isLoading) {
    return (
      <div className={`quote-block loading ${className}`} style={style}>
        <div className="animate-pulse border-l-4 border-[var(--orb-border)] bg-[var(--orb-surface)] p-4 rounded-r-lg">
          <div className="space-y-2">
            <div className="h-4 bg-[var(--orb-border)] rounded w-3/4"></div>
            <div className="h-4 bg-[var(--orb-border)] rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`quote-block ${className}`} style={style}>
      <div className={`border-l-4 ${typeConfig.borderColor} ${typeConfig.bgColor} rounded-r-lg`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--orb-border)]">
          <div className="flex items-center space-x-2">
            <div className={typeConfig.iconColor}>
              {typeConfig.icon}
            </div>
            <span className="text-sm font-medium text-[var(--orb-fg)]">
              {typeConfig.label}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="text-sm text-[var(--orb-muted)] hover:text-[var(--orb-fg)] px-2 py-1 rounded bg-[var(--orb-canvas)] hover:bg-[var(--orb-surface)] border border-[var(--orb-border)] transition-colors"
            title="复制引用"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-4">
          <blockquote className="text-[var(--orb-fg)] leading-relaxed">
            <div className="flex items-start space-x-2">
              <MessageCircle className="w-8 h-8 text-[var(--orb-muted)] flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                {cleanContent.split('\n\n').map((paragraph, index) => (
                  <p key={index} className={`${index > 0 ? 'mt-4' : ''} whitespace-pre-wrap`}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </blockquote>

          {(author || source) && (
            <div className="mt-4 pt-3 border-t border-[var(--orb-border)]">
              <div className="flex items-center text-sm text-[var(--orb-muted)]">
                {author && (
                  <span className="font-medium">— {author}</span>
                )}
                {author && source && (
                  <span className="mx-2">•</span>
                )}
                {source && (
                  <span className="italic">{source}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={`h-1 ${typeConfig.borderColor.replace('border-l-', 'bg-')} opacity-20`}></div>
      </div>
    </div>
  )
}

export default QuoteBlock
