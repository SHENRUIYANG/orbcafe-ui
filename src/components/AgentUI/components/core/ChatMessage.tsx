'use client'

import React from 'react'
import StreamingMarkdown from './StreamingRenderer'
import { MiniAnswerIsland, type MiniAnswerIslandButton } from './MiniAnswerIsland'
import type { AgentUICardHooks } from '../cardTypes'

export interface AssistantActionContext {
  isLatestAssistant: boolean
  isResponding?: boolean
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
  
  const bodyStyle: React.CSSProperties = {
    lineHeight: 1.55,
    fontSize: 13,
    fontWeight: 300,
    fontFamily: 'var(--orb-font, "Montserrat", system-ui, sans-serif)',
    color: 'var(--orb-fg, #555555)',
    borderRadius: 'var(--orb-r, 10px)',
    padding: '10px 14px',
  }
  const timeStyle: React.CSSProperties = {
    marginTop: 6,
    fontSize: 11,
    color: 'var(--orb-muted, #8c8c8c)',
  }

  if (message.type === 'assistant') {
    const isAssistantActionBusy = Boolean(assistantActions?.isResponding || message.isStreaming)

    return (
      <div className="mb-4 flex justify-start">
        <div
          className="mr-auto w-full"
          style={{
            ...bodyStyle,
            background: 'var(--orb-surface, #f5f5f5)',
            border: '1px solid var(--orb-border, #dbdbdb)',
          }}
        >
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
            <div
              className="mt-3 flex flex-row justify-start gap-2 border-t pt-2"
              style={{ borderColor: 'var(--orb-border, #dbdbdb)' }}
            >
              <MiniAnswerIsland
                buttons={[
                  {
                    type: 'refresh',
                    onClick: () => { void assistantActions?.onRegenerate?.() },
                    disabled: isAssistantActionBusy || !assistantActions?.onRegenerate,
                    loading: isAssistantActionBusy
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
          <div style={timeStyle}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 flex justify-end">
      <div
        className="ml-auto max-w-[80%]"
        style={{
          ...bodyStyle,
          background: 'var(--orb-p50, #eef2f9)',
          border: '1px solid var(--orb-p100, #e4e9f5)',
        }}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div style={timeStyle}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
