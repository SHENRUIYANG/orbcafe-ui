'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Plus, Mic } from 'lucide-react'
import { ChatMessage, type ChatMessage as ChatMessageType, type AssistantActionContext } from '../components/core/ChatMessage'
import { cn } from '../lib/utils'
import type { AgentUICardHooks } from '../components/cardTypes'

type CopilotCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
const oppositeCornerMap: Record<CopilotCorner, CopilotCorner> = {
  'top-left': 'bottom-right',
  'top-right': 'bottom-left',
  'bottom-left': 'top-right',
  'bottom-right': 'top-left'
}

export interface CopilotChatProps {
  messages: ChatMessageType[]
  onSend: (content: string, files?: File[]) => Promise<void>
  onStop?: () => void
  onRegenerate?: (messageId: string) => Promise<void>
  isResponding?: boolean
  className?: string
  placeholder?: string
  title?: string
  corner?: CopilotCorner
  onCollapse?: () => void
  onHeaderPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void
  onPlusClick?: () => void
  onMicClick?: () => void
  streamIntervalMs?: number
  streamChunkSize?: number
  onMessageStreamingComplete?: (messageId: string) => void
  cardHooks?: AgentUICardHooks
}

export const CopilotChat: React.FC<CopilotChatProps> = ({
  messages,
  onSend,
  onRegenerate,
  isResponding = false,
  className,
  placeholder,
  title = 'Copilot',
  corner = 'bottom-right',
  onCollapse,
  onHeaderPointerDown,
  onPlusClick,
  onMicClick,
  streamIntervalMs,
  streamChunkSize,
  onMessageStreamingComplete,
  cardHooks
}) => {
  const [query, setQuery] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const outerCorner = oppositeCornerMap[corner]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isResponding])

  const handleSend = useCallback(async () => {
    const content = query.trim()
    if (!content || isResponding) return
    setQuery('')
    await onSend(content)
  }, [isResponding, onSend, query])

  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault()
      await handleSend()
    }
  }, [handleSend, isComposing])

  return (
    <div className={cn("relative flex h-full w-full min-h-[460px] min-w-[340px] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-none dark:border-gray-800 dark:bg-gray-900", className)}>
      {onCollapse && (
        <button
          onClick={onCollapse}
          className={cn(
            "absolute z-20 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-transparent dark:hover:bg-transparent",
            outerCorner === 'top-left' && '-left-2 -top-2',
            outerCorner === 'top-right' && '-right-2 -top-2',
            outerCorner === 'bottom-left' && '-bottom-2 -left-2',
            outerCorner === 'bottom-right' && '-bottom-2 -right-2'
          )}
          type="button"
          aria-label="Collapse Copilot"
        >
          <span
            className={cn(
              'block h-4 w-4 border-[#21BCFF]',
              outerCorner === 'top-left' && 'rounded-tl-full border-l-[3px] border-t-[3px]',
              outerCorner === 'top-right' && 'rounded-tr-full border-r-[3px] border-t-[3px]',
              outerCorner === 'bottom-left' && 'rounded-bl-full border-b-[3px] border-l-[3px]',
              outerCorner === 'bottom-right' && 'rounded-br-full border-b-[3px] border-r-[3px]'
            )}
          />
        </button>
      )}
      <div
        className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800"
        onPointerDown={onHeaderPointerDown}
      >
        <div className="flex items-center">
          <h3 className="text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <div />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {messages.map((msg, index) => {
          const isLastAssistant = msg.type === 'assistant' && index === messages.length - 1
          const assistantActions: AssistantActionContext | undefined = msg.type === 'assistant' ? {
            isLatestAssistant: isLastAssistant,
            onRegenerate: onRegenerate ? () => onRegenerate(msg.id) : undefined
          } : undefined

          return (
            <ChatMessage
              key={msg.id}
              message={msg}
              assistantActions={assistantActions}
              onStreamingComplete={() => onMessageStreamingComplete?.(msg.id)}
              streamIntervalMs={streamIntervalMs}
              streamChunkSize={streamChunkSize}
              cardHooks={cardHooks}
            />
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-100 px-3 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2 rounded-xl border border-blue-300/80 bg-white px-2 py-1.5 dark:bg-gray-900">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            onClick={onPlusClick}
            type="button"
            aria-label="Add"
          >
            <Plus className="h-4 w-4" />
          </button>
          <input
            className="h-7 flex-1 border-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
            placeholder={placeholder || 'Ask Copilot...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={handleKeyDown}
            aria-label="Copilot input"
            spellCheck={false}
          />
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            onClick={onMicClick}
            type="button"
            aria-label="Microphone"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CopilotChat
