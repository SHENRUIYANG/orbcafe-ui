'use client'

import React from 'react'
import { StdChat, type StdChatProps } from './std-chat'
import { cn } from '../lib/utils'
import styles from './agent-panel.module.css'

export type AgentPanelStatus = 'idle' | 'running' | 'success' | 'error' | 'pending'

const statusLabelMap: Record<AgentPanelStatus, string> = {
  idle: 'Idle',
  running: 'Running',
  success: 'Success',
  error: 'Error',
  pending: 'Pending'
}

export interface AgentPanelProps extends StdChatProps {
  title?: string
  description?: string
  headerActions?: React.ReactNode
  agentStatus?: AgentPanelStatus
}

export const AgentPanel: React.FC<AgentPanelProps> = ({
  title = "AI Agent",
  description,
  headerActions,
  className,
  agentStatus,
  showInput = false,
  ...chatProps
}) => {
  const resolvedStatus: AgentPanelStatus = agentStatus ?? (chatProps.isResponding ? 'running' : 'idle')

  return (
    <div
      className={cn("relative flex h-full w-full", styles.agentPanel, className)}
      data-status={resolvedStatus}
    >
      <div className={styles.colorHalo} data-status={resolvedStatus} aria-hidden="true" />

      <div className={styles.marqueeBorder} data-status={resolvedStatus} aria-hidden="true">
        <span className={cn(styles.edge, styles.top)} />
        <span className={cn(styles.edge, styles.right)} />
        <span className={cn(styles.edge, styles.bottom)} />
        <span className={cn(styles.edge, styles.left)} />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col rounded-xl border border-slate-200/70 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-gray-950">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-20">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100/80 dark:bg-gray-800/70">
              <span className={styles.statusDot} data-status={resolvedStatus} />
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">
                {statusLabelMap[resolvedStatus]}
              </span>
            </div>
            {headerActions}
          </div>
        </div>

        <div className="flex-1 min-h-0 relative z-10">
          <StdChat {...chatProps} showInput={showInput} />
        </div>
      </div>
    </div>
  )
}

export default AgentPanel
