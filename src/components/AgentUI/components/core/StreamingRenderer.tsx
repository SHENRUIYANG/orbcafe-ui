'use client'

import React, { useState, useEffect } from 'react'
import UniversalContentRenderer from './ContentRenderer'
import type { AgentUICardHooks } from '../cardTypes'

interface StreamingMarkdownProps {
  content: string
  isStreaming?: boolean
  onComplete?: () => void
  className?: string
  streamIntervalMs?: number
  streamChunkSize?: number
  messageId?: string
  cardHooks?: AgentUICardHooks
}

const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({
  content,
  isStreaming = true,
  onComplete,
  className = '',
  streamIntervalMs = 24,
  streamChunkSize = 3,
  messageId,
  cardHooks
}) => {
  const [visibleLength, setVisibleLength] = useState(isStreaming ? 0 : content.length)
  const [isCompleted, setIsCompleted] = useState(!isStreaming)

  useEffect(() => {
    if (isStreaming) {
      setVisibleLength(0)
      setIsCompleted(false)
      return
    }
    setVisibleLength(content.length)
    setIsCompleted(true)
  }, [content, isStreaming])

  useEffect(() => {
    if (!isStreaming || isCompleted) return
    if (visibleLength >= content.length) {
      setIsCompleted(true)
      onComplete?.()
      return
    }

    const timer = window.setTimeout(() => {
      setVisibleLength((prev) => Math.min(prev + streamChunkSize, content.length))
    }, streamIntervalMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [content.length, isCompleted, isStreaming, onComplete, streamChunkSize, streamIntervalMs, visibleLength])

  const handleClick = () => {
    if (isStreaming && !isCompleted) {
      setVisibleLength(content.length)
      setIsCompleted(true)
      onComplete?.()
    }
  }

  const renderedContent = isStreaming ? content.slice(0, visibleLength) : content
  const showCursor = isStreaming && !isCompleted
  const showHint = isStreaming && !isCompleted

  return (
    <div 
      className={`streaming-markdown ${className}`}
      onClick={handleClick}
      style={{ cursor: isStreaming ? 'pointer' : 'default' }}
    >
      <div className="relative">
        <UniversalContentRenderer 
          content={renderedContent}
          messageId={messageId}
          cardHooks={cardHooks}
        />
        
        {showCursor && (
          <span 
            className="inline-block w-0.5 h-5 bg-blue-500 ml-1 animate-pulse"
            style={{
              verticalAlign: 'text-bottom'
            }}
          />
        )}
      </div>
      
      {showHint && (
        <div 
          className="streaming-hint"
          style={{
            fontSize: '9px',
            color: '#999',
            marginTop: '8px',
            fontStyle: 'italic',
            opacity: 0.7
          }}
        >
          点击此处显示完整内容
        </div>
      )}
    </div>
  )
}

export default StreamingMarkdown
