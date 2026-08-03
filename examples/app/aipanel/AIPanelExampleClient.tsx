'use client'

import React, { useCallback, useState } from 'react'
import { AgentPanel, type AgentPanelStatus, type ChatMessage } from 'orbcafe-ui'
import { Bot, MoreHorizontal, Play, RotateCcw, Settings } from 'orbcafe-ui'

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    type: 'assistant',
    content: 'Agent initialized. Waiting for the next workflow trigger.',
    timestamp: new Date('2024-01-01T09:00:00')
  },
  {
    id: '2',
    type: 'assistant',
    content: 'Quick test: type `test` (or any message) in the input below to preview the complete Markdown rendering showcase.',
    timestamp: new Date('2024-01-01T09:00:03')
  }
]

/** Sample reply used by the quick-test feature. */
const sampleReply = [
  '# Production risk analysis',
  '',
  'This response demonstrates **bold**, *italic*, ~~strikethrough~~, and `inline code`.',
  '',
  '> **Finding:** line 2 is the main bottleneck. Re-planning can recover **14 hours** of capacity.',
  '',
  '## At-risk orders',
  '',
  '| Order | Material | Due date | Risk |',
  '| :--- | :--- | :---: | ---: |',
  '| **4500012383** | FERT-22901 | 09.08 | High |',
  '| **4500012379** | Valve block | 07.08 | Medium |',
  '| **4500012381** | ROH-100234 | 12.08 | Low |',
  '',
  '### Recommended workflow',
  '',
  '1. Freeze the current production sequence.',
  '2. Move urgent orders to the next available slot.',
  '3. Notify the responsible planner.',
  '',
  '- [x] Capacity checked',
  '- [x] Material availability confirmed',
  '- [ ] Planner approval pending',
  '',
  'Reference: [ORBIS](https://www.orbis.de/)',
  '',
  '---',
  '',
  '### Example calculation',
  '',
  'The utilization formula is $U = \\frac{planned}{available}$, giving:',
  '',
  '$$U = \\frac{86}{100} = 86\\%$$',
  '',
  '```ts',
  'const recoveredCapacityHours = 14',
  "const decision = recoveredCapacityHours >= 8 ? 're-plan' : 'monitor'",
  '```',
  '',
  '```mermaid',
  'flowchart LR',
  '  A[Capacity] --> B{Risk?}',
  '  B -- Yes --> C[Re-plan]',
  '  B -- No --> D[Continue]',
  '```'
].join('\n')

export default function AIPanelExampleClient() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [isResponding, setIsResponding] = useState<boolean>(false)
  const [status, setStatus] = useState<AgentPanelStatus>('idle')

  const statusButtons: Array<{ value: AgentPanelStatus; label: string }> = [
    { value: 'idle', label: 'Idle' },
    { value: 'pending', label: 'Pending' },
    { value: 'running', label: 'Running' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'Error' }
  ]

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message])
  }, [])

  const respond = useCallback(async (userContent: string) => {
    const runId = Date.now().toString()
    appendMessage({
      id: `${runId}-user`,
      type: 'user',
      content: userContent,
      timestamp: new Date()
    })

    setStatus('running')
    setIsResponding(true)

    // simulate agent work, then stream in a sample reply
    await new Promise(resolve => setTimeout(resolve, 1200))

    appendMessage({
      id: `${runId}-assistant`,
      type: 'assistant',
      content: sampleReply,
      timestamp: new Date(),
      isStreaming: true
    })
    setIsResponding(false)
    setStatus('success')

    // flip streaming off after the chunk animation finishes
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg => (msg.id === `${runId}-assistant` ? { ...msg, isStreaming: false } : msg))
      )
    }, 600)
    setTimeout(() => setStatus('idle'), 1200)
  }, [appendMessage])

  const handleSend = useCallback(async (content: string) => {
    await respond(content.trim() || 'test')
  }, [respond])

  const triggerRun = async () => {
    if (isResponding) return
    await respond('Run KPI anomaly detection for this week and summarize the risk level.')
  }

  const resetConversation = () => {
    setMessages(INITIAL_MESSAGES)
    setIsResponding(false)
    setStatus('idle')
  }

  const activeStatusButton = (value: AgentPanelStatus) =>
    status === value
      ? 'border-[var(--orb-primary,#154194)] bg-[var(--orb-p50,#eef2f9)] text-[var(--orb-primary,#154194)]'
      : 'border-[var(--orb-border,#dbdbdb)] text-[var(--orb-muted,#8c8c8c)] hover:bg-[var(--orb-hover,#eef2f9)] hover:text-[var(--orb-fg,#555555)]'

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--orb-surface,#f5f5f5)] p-4 md:p-8">
      <div className="flex h-[84vh] w-full max-w-5xl flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={triggerRun}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--orb-primary,#154194)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--orb-p600,#0e2d63)] disabled:opacity-60"
            disabled={isResponding}
          >
            <Play className="h-4 w-4" />
            Trigger Agent Run
          </button>
          <button
            type="button"
            onClick={resetConversation}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--orb-border,#dbdbdb)] bg-[var(--orb-canvas,#ffffff)] px-4 py-2 text-sm font-medium text-[var(--orb-fg,#555555)] transition-colors hover:bg-[var(--orb-hover,#eef2f9)]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <span className="mx-1 h-5 w-px bg-[var(--orb-border,#dbdbdb)]" aria-hidden="true" />

          {statusButtons.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${activeStatusButton(value)}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="text-xs text-[var(--orb-muted,#8c8c8c)]">
          Quick test: type <span className="font-semibold text-[var(--orb-primary,#154194)]">test</span> in the input below →
          the full Markdown showcase appears. Current status: <span className="font-semibold uppercase text-[var(--orb-fg,#555555)]">{status}</span>
          <span className="ml-2">· working state reads through motion, not color</span>
        </div>

        <AgentPanel
          title="Data Analysis Agent"
          description="Plant 1000 context"
          agentStatus={status}
          statusText={isResponding ? 'Querying open orders · 4500012381–4500012384' : undefined}
          messages={messages}
          isResponding={isResponding}
          showInput
          onSend={handleSend}
          onMessageStreamingComplete={(messageId) => {
            setMessages(prev =>
              prev.map(msg => (msg.id === messageId ? { ...msg, isStreaming: false } : msg))
            )
          }}
          headerActions={
            <div className="flex items-center gap-1">
              <button className="rounded-full p-2 text-[var(--orb-muted,#8c8c8c)] transition-colors hover:bg-[var(--orb-hover,#eef2f9)] hover:text-[var(--orb-fg,#555555)]" title="Agent">
                <Bot className="h-4 w-4" />
              </button>
              <button className="rounded-full p-2 text-[var(--orb-muted,#8c8c8c)] transition-colors hover:bg-[var(--orb-hover,#eef2f9)] hover:text-[var(--orb-fg,#555555)]">
                <Settings className="h-4 w-4" />
              </button>
              <button className="rounded-full p-2 text-[var(--orb-muted,#8c8c8c)] transition-colors hover:bg-[var(--orb-hover,#eef2f9)] hover:text-[var(--orb-fg,#555555)]">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--orb-muted,#8c8c8c)]">Suggested:</span>
          {['Re-plan line 2', 'Show capacity chart', 'Notify planner'].map(label => (
            <button
              key={label}
              type="button"
              onClick={() => handleSend(label)}
              className="rounded-full border border-[var(--orb-border,#dbdbdb)] px-3 py-1.5 text-xs font-medium text-[var(--orb-muted,#8c8c8c)] transition-colors hover:border-[var(--orb-primary,#154194)] hover:text-[var(--orb-primary,#154194)]"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
