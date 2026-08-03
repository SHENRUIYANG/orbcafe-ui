'use client'

import React from 'react'
import { StdChat, type StdChatProps } from './std-chat'
import { cn } from '../lib/utils'

export type AgentPanelStatus = 'idle' | 'running' | 'success' | 'error' | 'pending'

const statusLabelMap: Record<AgentPanelStatus, string> = {
  idle: 'Idle',
  running: 'Working',
  success: 'Success',
  error: 'Error',
  pending: 'Pending'
}

export interface AgentPanelProps extends StdChatProps {
  title?: string
  description?: string
  headerActions?: React.ReactNode
  agentStatus?: AgentPanelStatus
  /** Optional status line (spinner + text) shown while running/pending. */
  statusText?: React.ReactNode
  onHeaderPointerDown?: React.PointerEventHandler<HTMLDivElement>
}

export const AgentPanel: React.FC<AgentPanelProps> = ({
  title = 'AI Agent',
  description,
  headerActions,
  className,
  agentStatus,
  statusText,
  onHeaderPointerDown,
  showInput = false,
  ...chatProps
}) => {
  const resolvedStatus: AgentPanelStatus = agentStatus ?? (chatProps.isResponding ? 'running' : 'idle')
  const busy = resolvedStatus === 'running' || resolvedStatus === 'pending'
  const subtitle = [statusLabelMap[resolvedStatus], description].filter(Boolean).join(' · ')

  return (
    <div className={cn('orb-agent-panel', className)}>
      <div
        className={cn(
          'orb-agent-header',
          onHeaderPointerDown && 'cursor-grab active:cursor-grabbing'
        )}
        onPointerDown={onHeaderPointerDown}
      >
        <span className="orb-agent-avatar" aria-hidden="true">AI</span>
        <div className="min-w-0 flex-1">
          <div className="orb-agent-title">{title}</div>
          <div className="orb-agent-subtitle">
            <span className="orb-agent-dot" data-active={busy || undefined} />
            <span className="truncate">{subtitle || 'Agent'}</span>
          </div>
        </div>
        {headerActions && (
          <div className="ml-auto flex flex-none items-center gap-1">{headerActions}</div>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <StdChat
          {...chatProps}
          showInput={showInput}
          statusLine={
            busy ? (
              <div className={cn('orb-agent-status-line', 'mb-1')}>
                <span className="orb-agent-spinner" aria-hidden="true" />
                <span>{statusText ?? `${statusLabelMap[resolvedStatus]}…`}</span>
              </div>
            ) : undefined
          }
        />
      </div>
    </div>
  )
}

export default AgentPanel
