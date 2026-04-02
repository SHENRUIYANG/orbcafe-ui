'use client'

import React, { useState } from 'react'
import { AgentPanel, type AgentPanelStatus, type ChatMessage } from 'orbcafe-ui'
import { Bot, MoreHorizontal, Play, RotateCcw, Settings } from 'lucide-react'

export default function AIPanelExampleClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Agent initialized. Waiting for the next workflow trigger.',
      timestamp: new Date('2024-01-01T09:00:00')
    },
    {
      id: '2',
      type: 'assistant',
      content: 'Tip: this panel is now display-only. Input area is intentionally hidden.',
      timestamp: new Date('2024-01-01T09:00:03')
    }
  ])
  const [isResponding, setIsResponding] = useState<boolean>(false)
  const [status, setStatus] = useState<AgentPanelStatus>('idle')

  const triggerRun = async () => {
    if (isResponding) return

    const runId = Date.now().toString()
    const userMsg: ChatMessage = {
      id: `${runId}-user`,
      type: 'user',
      content: 'Run KPI anomaly detection for this week and summarize the risk level.',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setStatus('running')
    setIsResponding(true)

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `${runId}-assistant`,
        type: 'assistant',
        content: [
          'Workflow completed.',
          '',
          '- 3 anomalies detected in North region',
          '- Total impact score: 7.8 / 10',
          '- Suggested action: prioritize shipment route B'
        ].join('\n'),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMsg])
      setIsResponding(false)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 1200)
    }, 2200)
  }

  const resetConversation = () => {
    const userMsg: ChatMessage = {
      id: '1',
      type: 'assistant',
      content: 'Agent initialized. Waiting for the next workflow trigger.',
      timestamp: new Date('2024-01-01T09:00:00')
    }
    const guideMsg: ChatMessage = {
      id: '2',
      type: 'assistant',
      content: 'Tip: this panel is now display-only. Input area is intentionally hidden.',
      timestamp: new Date('2024-01-01T09:00:03')
    }
    setMessages([userMsg, guideMsg])
    setIsResponding(false)
    setStatus('idle')
  }

  return (
    <div className="h-screen w-full p-4 md:p-8 bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-5xl h-[84vh] flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={triggerRun}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white transition-colors disabled:opacity-60"
            disabled={isResponding}
          >
            <Play className="w-4 h-4" />
            Trigger Agent Run
          </button>
          <button
            type="button"
            onClick={resetConversation}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-200"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button type="button" onClick={() => setStatus('pending')} className="px-3 py-2 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors dark:bg-amber-950/70 dark:text-amber-300">
            Pending
          </button>
          <button type="button" onClick={() => setStatus('running')} className="px-3 py-2 rounded-lg text-xs font-semibold bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition-colors dark:bg-cyan-950/70 dark:text-cyan-300">
            Running
          </button>
          <button type="button" onClick={() => setStatus('success')} className="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors dark:bg-emerald-950/70 dark:text-emerald-300">
            Success
          </button>
          <button type="button" onClick={() => setStatus('error')} className="px-3 py-2 rounded-lg text-xs font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors dark:bg-rose-950/70 dark:text-rose-300">
            Error
          </button>
          <button type="button" onClick={() => setStatus('idle')} className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors dark:bg-slate-800 dark:text-slate-200">
            Idle
          </button>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400">
          Current status: <span className="font-semibold uppercase">{status}</span>
        </div>

        <AgentPanel
          title="Data Analysis Agent"
          description="Display-only conversation panel with status marquee border"
          agentStatus={status}
          messages={messages}
          isResponding={isResponding}
          headerActions={
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" title="Agent">
                <Bot className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <Settings className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          }
        />
      </div>
    </div>
  )
}
