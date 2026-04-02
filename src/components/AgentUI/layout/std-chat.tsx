'use client'

import React, { useRef, useEffect } from 'react'
import { ChatMessage, type ChatMessage as ChatMessageType, type AssistantActionContext } from '../components/core/ChatMessage'
import { InputArea } from '../components/core/InputArea'
import { cn } from '../lib/utils'
import type { AgentUICardHooks } from '../components/cardTypes'

export interface StdChatProps {
  messages: ChatMessageType[]
  onSend?: (content: string, files?: File[]) => Promise<void>
  onStop?: () => void
  onRegenerate?: (messageId: string) => Promise<void>
  isResponding?: boolean
  className?: string
  placeholder?: string
  streamIntervalMs?: number
  streamChunkSize?: number
  onMessageStreamingComplete?: (messageId: string) => void
  cardHooks?: AgentUICardHooks
  showInput?: boolean
}

export const StdChat: React.FC<StdChatProps> = ({
  messages,
  onSend,
  onStop,
  onRegenerate,
  isResponding = false,
  className,
  placeholder,
  streamIntervalMs,
  streamChunkSize,
  onMessageStreamingComplete,
  cardHooks,
  showInput = true
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isResponding])

  return (
    <div className={cn("flex flex-col h-full w-full relative", className)}>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
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

      {showInput && (
        <div className="p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 pb-8 z-10">
          <InputArea
            onSend={onSend || (async () => {})}
            onStop={onStop || (() => {})}
            isResponding={isResponding}
            placeholder={placeholder}
          />
        </div>
      )}
    </div>
  )
}

export default StdChat
