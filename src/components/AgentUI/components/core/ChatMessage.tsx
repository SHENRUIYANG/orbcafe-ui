'use client'

import React from 'react'
import StreamingMarkdown from './StreamingRenderer'
import { MiniAnswerIsland, type MiniAnswerIslandButton } from './MiniAnswerIsland'
import type { AgentUICardHooks } from '../cardTypes'

export interface AssistantActionContext {
  isLatestAssistant: boolean
  onRegenerate?: () => Promise<void>
}

export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export interface ChatMessageProps {
  message: ChatMessage
  onStreamingComplete?: () => void
  assistantActions?: AssistantActionContext
  streamIntervalMs?: number
  streamChunkSize?: number
  cardHooks?: AgentUICardHooks
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onStreamingComplete,
  assistantActions,
  streamIntervalMs,
  streamChunkSize,
  cardHooks
}) => {
  
  if (message.type === 'assistant') {
    return (
      <div className="flex justify-start mb-4">
        <div className="w-full bg-transparent text-black dark:text-gray-100 rounded-2xl px-4 py-3 mr-auto" style={{ lineHeight: '1.5', fontSize: '16px', fontWeight: '280', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          <StreamingMarkdown
            content={message.content}
            isStreaming={message.isStreaming ?? false}
            onComplete={onStreamingComplete}
            streamIntervalMs={streamIntervalMs}
            streamChunkSize={streamChunkSize}
            messageId={message.id}
            cardHooks={cardHooks}
          />
          
          {message.content && assistantActions?.isLatestAssistant && (
            <div className='flex flex-row justify-start gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700'>
              <MiniAnswerIsland 
                buttons={[
                  {
                    type: 'refresh',
                    onClick: () => assistantActions?.onRegenerate?.(),
                    disabled: !assistantActions?.onRegenerate
                  },
                  { type: 'copy', onClick: () => navigator.clipboard.writeText(message.content), disabled: false },
                  { type: 'volume', onClick: () => console.log('语音播放'), disabled: false },
                  { type: 'like', onClick: () => console.log('点赞'), disabled: false },
                  { type: 'dislike', onClick: () => console.log('点踩'), disabled: false }
                ] as MiniAnswerIslandButton[]} 
                size="sm" 
                variant="default" 
              />
            </div>
          )}
          <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex justify-end`}>
      <div className="max-w-[80%] bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl px-4 py-3 ml-auto" style={{ lineHeight: '1.5', fontSize: '16px', fontWeight: '280', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div className="whitespace-pre-wrap" style={{ lineHeight: '1.5', fontSize: '16px', fontWeight: '280', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{message.content}</div>
        <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
