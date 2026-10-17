/**
 * OMPHPanel 示例
 *
 * 内容大纲：
 * - 顶栏 AI 输入条打开同一会话，关闭后再打开
 * - 面板内新建对话、对话列表和切换
 * - 历史轮次、更早一轮、输入 test 后的增量流式回复
 * - 过程行、指标图卡、状态和卡片事件
 * - 文件预览：回复里的文件链接、面板宽度与预览布局切换
 *
 * 作者：ORBAICODER
 * 版本：1.8.1
 * 日期：2026-10-14
 *
 * 作用：演示 OMPHPanel。输入 test 会按增量追加过程行和九种指标图卡，而不是一次性打字机播放。
 *
 * 代码逻辑大纲：
 * 1. 宿主保存多条会话，当前条的轮次、状态和是否仍在响应。
 * 2. 顶栏打开按钮只把面板再打开；顶栏发送则打开面板并把内容送进当前会话。
 * 3. 发送后先写入用户消息，再逐段追加推理、工具、命令和助手 Markdown。
 * 4. 冻结序列前用审批卡换掉输入区。可选冻结后重排、只重排、只监视，或 Other 输入；拒绝或停止都结束等待。
 * 5. 回复里带各种文件链接；宽度按钮改变面板容器宽度，用来在同一页看到并排与覆盖两种预览。
 *
 * ChangeLog：
 * - 1.8.1 2026-10-14 面板打开时隐藏顶栏的打开对话按钮。
 * - 1.8.0 2026-10-14 顶栏可重新打开面板；面板内可新建并切换会话。
 * - 1.7.1 2026-10-07 泛光打开时，示例开关留在浮层外面，不再压住面板。
 * - 1.7.0 2026-10-07 示例增加可开关的边缘泛光外壳，泛光画在面板外面。
 * - 1.6.0 2026-10-07 test 的完整回复里加入可交互 HTML 演示。
 * - 1.5.0 2026-10-07 审批卡改为完整单选，并带 Other 输入。
 * - 1.4.0 2026-10-07 test 在冻结序列前停住，输入区换成审批卡。
 * - 1.3.0 2026-10-04 面板只放回复，输入改用面板外的 InputArea。
 * - 1.2.0 2026-10-04 去掉分支按钮。
 * - 1.1.0 2026-10-04 文件预览演示。
 * - 1.0.0 2026-10-04 初始版本。
 */

'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CAppHeader,
  InputArea,
  OMPHApprovalCard,
  OMPHPanel,
  X,
  type AgentUICardHookEvent,
  type MetricChartCardTypeContent,
  type OMPHApprovalChoice,
  type OMPHApprovalDecision,
  type OMPHApprovalRequest,
  type OMPHFilePreviewLayout,
  type OMPHPanelStatus,
  type OMPHProcessDisplay,
  type OMPHProcessItem,
  type OMPHTurn,
} from 'orbcafe-ui'
import { createDemoFileLoader } from './omphDemoWorkspace'
import './omph-edge-bloom.css'

const STREAM_CHUNK_CHARS = 64
const STREAM_INTERVAL_MS = 16
const PROCESS_BEAT_MS = 700
const SUCCESS_HOLD_MS = 900
const OLDER_DELAY_MS = 350
const HISTORY_AT = '2024-01-01T09:00:00'
const OLDER_AT = '2024-01-01T08:40:00'
const STOPPED_SUMMARY = 'Stopped'
const INTERRUPTED_SUMMARY = 'Interrupted'
const FREEZE_TOOL_NAME = 'Freeze sequence'
const FREEZE_REASON = 'Line 2 can recover 14 hours. Choose how to use that capacity before the sequence changes.'
const FREEZE_COMMAND = 'freeze-sequence --plant 1000 --line 2'
const CHOICE_FREEZE = 'freeze-then-replan'
const CHOICE_REPLAN = 'replan-only'
const CHOICE_MONITOR = 'monitor-only'
const APPROVAL_DENIED = 'No action was approved, so this re-plan stops here. The open orders stay on the current sequence.'

const RECOVERY_CHOICES: OMPHApprovalChoice[] = [
  {
    id: CHOICE_FREEZE,
    label: 'Freeze the current sequence, then re-plan',
    description: 'Hold line 2 where it is, then move the next slot. Recommended when the live sequence must not change.',
  },
  {
    id: CHOICE_REPLAN,
    label: 'Re-plan without freezing',
    description: 'Keep the live sequence running and only move open orders in the next slot.',
  },
  {
    id: CHOICE_MONITOR,
    label: 'Keep the sequence and only monitor',
    description: 'Do not change the plan. Watch the recovered 14 hours until the next capacity check.',
  },
]

const STATUS_BUTTONS: Array<{ value: OMPHPanelStatus; label: string }> = [
  { value: 'idle', label: 'Idle' },
  { value: 'pending', label: 'Pending' },
  { value: 'running', label: 'Running' },
  { value: 'success', label: 'Success' },
  { value: 'error', label: 'Error' },
]

const DISPLAY_OPTIONS: OMPHProcessDisplay[] = ['compact', 'standard', 'detailed', 'expanded']

const PANEL_WIDTHS = [
  { label: 'Wide', px: 1120 },
  { label: 'Medium', px: 760 },
  { label: 'Narrow', px: 420 },
] as const

const PREVIEW_LAYOUTS: OMPHFilePreviewLayout[] = ['auto', 'split', 'overlay']
const LINE2_CONVERSATION_ID = 'line-2-capacity'
const YESTERDAY_CONVERSATION_ID = 'yesterday-warning'
const NEW_CONVERSATION_TITLE = 'New conversation'
const TITLE_LIMIT = 42
const PREVIEW_LIMIT = 72

interface DemoConversation {
  id: string
  title: string
  updatedAt: Date
  turns: OMPHTurn[]
  hasOlder: boolean
}

const REASONING_TEXT = [
  'Line 2 is the constraint.',
  'Re-planning the next slot recovers capacity without moving the frozen sequence.',
].join(' ')

const TEST_CHARTS: MetricChartCardTypeContent[] = [
  {
    type: 'metric-chart-card',
    title: 'Analysis materials',
    subtitle: 'Current filtered scope',
    chartType: 'metric',
    showChartTypeControl: false,
    data: [{ id: 'total', label: 'Classified materials', value: 768, secondaryValue: 86 }],
    secondaryValueLabel: 'Classification coverage',
    secondaryValueSuffix: '%',
  },
  {
    type: 'metric-chart-card',
    title: 'Classification change',
    subtitle: 'Compared with the previous run',
    chartType: 'progress',
    data: [
      { id: 'changed', label: 'Changed', value: 186 },
      { id: 'unchanged', label: 'Unchanged', value: 582 },
    ],
  },
  {
    type: 'metric-chart-card',
    title: 'Classification distribution',
    subtitle: 'Materials by class',
    chartType: 'donut',
    data: [
      { id: 'ax', label: 'AX', value: 184 },
      { id: 'ay', label: 'AY', value: 142 },
      { id: 'az', label: 'AZ', value: 96 },
      { id: 'bx', label: 'BX', value: 76 },
    ],
  },
  {
    type: 'metric-chart-card',
    title: 'Planning controller',
    subtitle: 'Materials by responsible planner',
    chartType: 'bar',
    data: [
      { id: 'anna', label: 'Anna Müller', value: 148 },
      { id: 'ben', label: 'Ben Fischer', value: 121 },
      { id: 'chi', label: 'Chi Zhang', value: 96 },
    ],
  },
  {
    type: 'metric-chart-card',
    title: 'Storage location',
    subtitle: 'Materials by plant location',
    chartType: 'column',
    data: [
      { id: 'de10', label: 'DE10 Berlin', value: 168 },
      { id: 'de20', label: 'DE20 Munich', value: 132 },
      { id: 'cn10', label: 'CN10 Shanghai', value: 118 },
    ],
  },
  {
    type: 'metric-chart-card',
    title: 'Acquisition type',
    subtitle: 'Sorted dimension sequence',
    chartType: 'line',
    data: [
      { id: 'inhouse', label: 'In-house', value: 210 },
      { id: 'external', label: 'External', value: 162 },
      { id: 'stock', label: 'Stock transfer', value: 120 },
      { id: 'subcontract', label: 'Subcontracting', value: 83 },
    ],
  },
  {
    type: 'metric-chart-card',
    title: 'Strategy group',
    subtitle: 'Index vs. material count',
    chartType: 'scatter',
    data: [
      { id: 'make', label: 'Make-to-stock', value: 132 },
      { id: 'order', label: 'Make-to-order', value: 108 },
      { id: 'kanban', label: 'Kanban', value: 72 },
    ],
  },
  {
    type: 'metric-chart-card',
    title: 'Planning group',
    subtitle: 'Count and stock value',
    chartType: 'bubble',
    secondaryValueSuffix: ' k€',
    data: [
      { id: 'p1', label: 'PG-01', value: 122, secondaryValue: 94 },
      { id: 'p2', label: 'PG-02', value: 104, secondaryValue: 66 },
      { id: 'p3', label: 'PG-03', value: 82, secondaryValue: 52 },
    ],
  },
  {
    type: 'metric-chart-card',
    title: 'Product hierarchy',
    subtitle: 'Accessible tabular view',
    chartType: 'list',
    data: [
      { id: 'finished', label: 'Finished product', value: 212 },
      { id: 'semi', label: 'Semi-finished', value: 156 },
      { id: 'component', label: 'Component', value: 118 },
    ],
  },
]

const CAPACITY_DEMO_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; color: #243044; background: #f6f8fb; font: 14px/1.5 system-ui, sans-serif; }
  .card { padding: 16px; }
  h1 { margin: 0 0 6px; font-size: 16px; }
  p { margin: 0; }
  .meter { height: 10px; margin-top: 12px; overflow: hidden; border-radius: 99px; background: #e4e8ef; }
  .fill { height: 100%; width: 0; background: #154194; }
  .status { margin-top: 10px; font-weight: 600; }
  .row { display: flex; gap: 8px; margin-top: 12px; }
  button { padding: 6px 10px; border: 1px solid #154194; border-radius: 8px; background: #fff; color: #154194; font: inherit; cursor: pointer; }
  button.primary { background: #154194; color: #fff; }
</style>
</head>
<body>
<div class="card">
  <h1>Recovered hours</h1>
  <p id="readout"></p>
  <div class="meter"><div class="fill" id="fill"></div></div>
  <p class="status" id="status"></p>
  <div class="row">
    <button type="button" id="down">−2 h</button>
    <button type="button" id="up" class="primary">+2 h</button>
    <button type="button" id="reset">Reset</button>
  </div>
</div>
<script>
  const threshold = 8
  const maxHours = 16
  let hours = 0
  const readout = document.getElementById('readout')
  const fill = document.getElementById('fill')
  const status = document.getElementById('status')
  const render = () => {
    readout.textContent = hours + ' h recovered. Threshold is ' + threshold + ' h.'
    fill.style.width = Math.min(100, (hours / maxHours) * 100) + '%'
    status.textContent = hours >= threshold ? 'At or above threshold: re-plan.' : 'Below threshold: monitor.'
  }
  document.getElementById('up').onclick = () => { hours = Math.min(maxHours, hours + 2); render() }
  document.getElementById('down').onclick = () => { hours = Math.max(0, hours - 2); render() }
  document.getElementById('reset').onclick = () => { hours = 0; render() }
  render()
</script>
</body>
</html>`

const buildTestReply = (prompt: string) => [
  '# Production risk analysis',
  '',
  `Prompt: **${prompt}**`,
  '',
  '> Line 2 is the main bottleneck. Re-planning can recover **14 hours** of capacity.',
  '',
  '| Order | Material | Risk |',
  '| :--- | :--- | ---: |',
  '| **4500012383** | FERT-22901 | High |',
  '| **4500012379** | Valve block | Medium |',
  '',
  '### Files',
  '',
  'Click a file to preview it. Large panels open it beside the conversation; small ones cover it.',
  '',
  '- Plan: [docs/line2-plan.md](docs/line2-plan.md)',
  '- Capacity check: [src/capacity.ts, lines 12–18](src/capacity.ts#L12-L18)',
  '- Orders: [data/orders.json](data/orders.json)',
  '- Layout image: [assets/line2-layout.svg](assets/line2-layout.svg)',
  '- Run log, a long file: [logs/run.log](logs/run.log#L40)',
  '- Fails once, then loads: [data/flaky.csv](data/flaky.csv)',
  '- Not there: [reports/missing.txt](reports/missing.txt)',
  '- No preview: [archive/q3.zip](archive/q3.zip)',
  '',
  'Select a chart, click an item, hover for one second, or right-click and choose **Show data**.',
  '',
  ...TEST_CHARTS.flatMap((card, index) => [
    `### ${index + 1}. ${card.title}`,
    '',
    '```json',
    JSON.stringify(card, null, 2),
    '```',
    '',
  ]),
  '### Live HTML demo',
  '',
  'The block below is rendered HTML, not a code listing. Move recovered hours across the 8 hour threshold.',
  '',
  '```html',
  CAPACITY_DEMO_HTML,
  '```',
  '',
].join('\n')

const ORDER_TABLE = [
  '| Order | Material | Risk |',
  '| :--- | :--- | ---: |',
  '| **4500012383** | FERT-22901 | High |',
  '| **4500012379** | Valve block | Medium |',
  '| **4500012381** | Housing | Low |',
].join('\n')

const FILE_LINKS = [
  '### Files',
  '',
  '- Plan: [docs/line2-plan.md](docs/line2-plan.md)',
  '- Capacity check: [src/capacity.ts, lines 12–18](src/capacity.ts#L12-L18)',
  '- Orders: [data/orders.json](data/orders.json)',
].join('\n')

const withHtmlDemo = (markdown: string) => [
  markdown,
  '',
  '### Live HTML demo',
  '',
  'The block below is rendered HTML, not a code listing. Move recovered hours across the 8 hour threshold.',
  '',
  '```html',
  CAPACITY_DEMO_HTML,
  '```',
  '',
].join('\n')

const replanOnlyReply = (prompt: string) => withHtmlDemo([
  '# Re-plan without a freeze',
  '',
  `Prompt: **${prompt}**`,
  '',
  'The live sequence on line 2 keeps running. Only the next slot is moved.',
  '',
  '- **4500012383** moves to the following slot. It is the high-risk finished product.',
  '- **4500012379** stays in the next slot. The valve block is medium risk and still has material.',
  '- **4500012381** is unchanged. The housing is low risk.',
  '',
  'Recovered capacity stays at **14 hours**, but it is not protected by a freeze. A new order can still take that time before the re-plan is released.',
  '',
  ORDER_TABLE,
  '',
  FILE_LINKS,
].join('\n'))

const monitorOnlyReply = (prompt: string) => withHtmlDemo([
  '# Monitor only',
  '',
  `Prompt: **${prompt}**`,
  '',
  'No order moves. Line 2 keeps the current sequence, and the next check watches the recovered **14 hours**.',
  '',
  '- Review [src/capacity.ts, lines 12–18](src/capacity.ts#L12-L18) if recovered hours fall under 8.',
  '- Open [data/orders.json](data/orders.json) only if a high-risk order is still waiting at the next check.',
  '- Leave [docs/line2-plan.md](docs/line2-plan.md) unchanged.',
  '',
  ORDER_TABLE,
  '',
  FILE_LINKS,
].join('\n'))

const otherReply = (prompt: string, action: string) => withHtmlDemo([
  '# Custom action',
  '',
  `Prompt: **${prompt}**`,
  '',
  'The requested action is recorded below and is not one of the standard recovery paths.',
  '',
  `> ${action}`,
  '',
  'Line 2 still shows **14 hours** of recovered capacity. The open orders are listed so the action can be checked against them before anything is released.',
  '',
  ORDER_TABLE,
  '',
  FILE_LINKS,
].join('\n'))

const replyForDecision = (prompt: string, decision: OMPHApprovalDecision) => {
  if (decision.kind === 'choice' && decision.choiceId === CHOICE_FREEZE) return buildTestReply(prompt)
  if (decision.kind === 'choice' && decision.choiceId === CHOICE_REPLAN) return replanOnlyReply(prompt)
  if (decision.kind === 'choice' && decision.choiceId === CHOICE_MONITOR) return monitorOnlyReply(prompt)
  if (decision.kind === 'other') return otherReply(prompt, decision.text)
  return APPROVAL_DENIED
}

const commandResult = (decision: OMPHApprovalDecision): { status: 'success' | 'error'; summary: string; content: string } => {
  if (decision.kind === 'rejected') {
    return { status: 'error', summary: 'Rejected', content: 'The recovery action was rejected.' }
  }
  if (decision.kind === 'other') {
    return { status: 'success', summary: 'Custom action', content: decision.text }
  }
  if (decision.kind === 'choice' && decision.choiceId === CHOICE_REPLAN) {
    return { status: 'success', summary: 'Sequence left running', content: 'Open orders in the next slot can move. The live sequence was not frozen.' }
  }
  if (decision.kind === 'choice' && decision.choiceId === CHOICE_MONITOR) {
    return { status: 'success', summary: 'Not required', content: 'The sequence stays as it is. No freeze command was sent.' }
  }
  return { status: 'success', summary: 'Sequence held', content: 'Current sequence frozen before the re-plan suggestion.' }
}

const historyTurn = (): OMPHTurn => ({
  id: 'turn-history',
  startedAt: Date.parse(HISTORY_AT),
  user: {
    id: 'history-user',
    content: 'What is waiting on this agent?',
    timestamp: new Date(HISTORY_AT),
  },
  process: [
    {
      id: 'history-tool',
      kind: 'tool',
      title: 'Read open orders',
      summary: '3 orders in plant 1000',
      status: 'success',
      content: '4500012381, 4500012379, 4500012383',
    },
  ],
  assistant: {
    id: 'history-assistant',
    content: 'Agent is idle. The plan for this agent is in [docs/line2-plan.md](docs/line2-plan.md). Type `test` to stream a turn with process rows, file links and the metric chart cards.',
    timestamp: new Date('2024-01-01T09:00:04'),
  },
  usage: { inputTokens: 86, outputTokens: 28, durationMs: 1400 },
})

const olderTurn = (): OMPHTurn => ({
  id: 'turn-older',
  startedAt: Date.parse(OLDER_AT),
  user: {
    id: 'older-user',
    content: 'Check yesterday’s capacity warning.',
    timestamp: new Date(OLDER_AT),
  },
  assistant: {
    id: 'older-assistant',
    content: 'Yesterday’s run finished with a capacity warning. Hover this turn to copy it.',
    timestamp: new Date('2024-01-01T08:41:00'),
  },
  failure: {
    id: 'older-warning',
    severity: 'warning',
    content: 'Output reached 92% of the available capacity.',
  },
  usage: { inputTokens: 40, outputTokens: 18, durationMs: 900 },
})

const oneLine = (value: string) => value.replace(/\s+/g, ' ').trim()

const clipText = (value: string, limit: number) => (
  value.length > limit ? `${value.slice(0, limit).trimEnd()}…` : value
)

const conversationPreview = (source: OMPHTurn[]) => {
  for (let index = source.length - 1; index >= 0; index -= 1) {
    const turn = source[index]
    const text = oneLine(turn.assistant?.content || turn.user?.content || '')
    if (text) return clipText(text, PREVIEW_LIMIT)
  }
  return ''
}

const titleFromTurns = (source: OMPHTurn[]) => {
  const text = oneLine(source.find((turn) => oneLine(turn.user?.content ?? ''))?.user?.content ?? '')
  return text ? clipText(text, TITLE_LIMIT) : ''
}

const turnSignature = (source: OMPHTurn[]) => source.map((turn) => [
  turn.id,
  turn.user?.content.length ?? 0,
  turn.assistant?.content.length ?? 0,
  turn.assistant?.streaming ? '1' : '0',
  (turn.process ?? []).map((item) => `${item.id}:${item.status}:${item.content?.length ?? 0}`).join(','),
].join(':')).join('|')

const freezeTurns = (source: OMPHTurn[]): OMPHTurn[] => source.map((turn) => ({
  ...turn,
  assistant: turn.assistant?.streaming ? { ...turn.assistant, streaming: false } : turn.assistant,
  process: turn.process?.map((item) => (
    item.streaming || item.status === 'running' || item.status === 'pending'
      ? { ...item, streaming: false, status: 'error' as const, summary: item.summary || INTERRUPTED_SUMMARY }
      : item
  )),
}))

const seedFor = (id: string): Pick<DemoConversation, 'title' | 'turns' | 'hasOlder' | 'updatedAt'> => {
  if (id === YESTERDAY_CONVERSATION_ID) {
    return {
      title: 'Yesterday warning',
      turns: [olderTurn()],
      hasOlder: false,
      updatedAt: new Date(OLDER_AT),
    }
  }
  if (id === LINE2_CONVERSATION_ID) {
    return {
      title: 'Line 2 capacity',
      turns: [historyTurn()],
      hasOlder: true,
      updatedAt: new Date(HISTORY_AT),
    }
  }
  return {
    title: NEW_CONVERSATION_TITLE,
    turns: [],
    hasOlder: false,
    updatedAt: new Date(),
  }
}

const patchTurn = (turns: OMPHTurn[], turnId: string, recipe: (turn: OMPHTurn) => OMPHTurn) =>
  turns.map((turn) => (turn.id === turnId ? recipe(turn) : turn))

export default function OMPHPanelExampleClient() {
  const [conversations, setConversations] = useState<DemoConversation[]>(() => [
    { id: LINE2_CONVERSATION_ID, ...seedFor(LINE2_CONVERSATION_ID) },
    { id: YESTERDAY_CONVERSATION_ID, ...seedFor(YESTERDAY_CONVERSATION_ID) },
  ])
  const [activeId, setActiveId] = useState(LINE2_CONVERSATION_ID)
  const [panelOpen, setPanelOpen] = useState(true)
  const [turns, setTurns] = useState<OMPHTurn[]>(() => seedFor(LINE2_CONVERSATION_ID).turns)
  const [status, setStatus] = useState<OMPHPanelStatus>('idle')
  const [isResponding, setIsResponding] = useState(false)
  const [hasOlder, setHasOlder] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [processDisplay, setProcessDisplay] = useState<OMPHProcessDisplay>('standard')
  const [lastCardEvent, setLastCardEvent] = useState<AgentUICardHookEvent | null>(null)
  const [panelWidth, setPanelWidth] = useState<number>(PANEL_WIDTHS[0].px)
  const [previewLayout, setPreviewLayout] = useState<OMPHFilePreviewLayout>('auto')
  const [edgeGlow, setEdgeGlow] = useState(true)
  const [externalPath, setExternalPath] = useState<string | null>(null)
  const [approval, setApproval] = useState<OMPHApprovalRequest | null>(null)
  const loadFilePreview = useMemo(() => createDemoFileLoader(), [])
  const runToken = useRef(0)
  const timers = useRef<number[]>([])
  const olderTimer = useRef<number | null>(null)
  const approvalResolver = useRef<((decision: OMPHApprovalDecision) => void) | null>(null)
  const conversationSeq = useRef(1)
  const turnsRef = useRef(turns)
  const hasOlderRef = useRef(hasOlder)
  const activeIdRef = useRef(activeId)
  const conversationsRef = useRef(conversations)
  turnsRef.current = turns
  hasOlderRef.current = hasOlder
  activeIdRef.current = activeId
  conversationsRef.current = conversations

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
    if (olderTimer.current !== null) {
      window.clearTimeout(olderTimer.current)
      olderTimer.current = null
    }
  }, [])

  useEffect(() => () => {
    runToken.current += 1
    clearTimers()
  }, [clearTimers])

  const cancelApproval = useCallback(() => {
    const resolve = approvalResolver.current
    approvalResolver.current = null
    setApproval(null)
    resolve?.({ kind: 'rejected' })
  }, [])

  const requestApproval = useCallback((request: OMPHApprovalRequest) => new Promise<OMPHApprovalDecision>((resolve) => {
    approvalResolver.current = resolve
    setApproval(request)
  }), [])

  const wait = useCallback((ms: number) => new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, ms)
    timers.current.push(timer)
  }), [])

  const reveal = useCallback(async (token: number, full: string, apply: (slice: string) => void) => {
    for (let index = 0; index < full.length; index += STREAM_CHUNK_CHARS) {
      if (token !== runToken.current) return false
      apply(full.slice(0, Math.min(full.length, index + STREAM_CHUNK_CHARS)))
      await wait(STREAM_INTERVAL_MS)
    }
    return token === runToken.current
  }, [wait])

  const settleStopped = useCallback((turnId: string) => {
    setTurns((current) => patchTurn(current, turnId, (turn) => ({
      ...turn,
      assistant: turn.assistant ? { ...turn.assistant, streaming: false } : turn.assistant,
      process: turn.process?.map((item) => (
        item.streaming || item.status === 'running'
          ? { ...item, streaming: false, status: 'error', summary: STOPPED_SUMMARY }
          : item
      )),
    })))
    setIsResponding(false)
    setStatus('idle')
  }, [])

  const respond = useCallback(async (prompt: string) => {
    clearTimers()
    const token = runToken.current + 1
    runToken.current = token
    const turnId = `turn-${token}`
    const startedAt = Date.now()
    const alive = () => token === runToken.current

    setStatus('running')
    setIsResponding(true)
    setTurns((current) => [...current.map((turn) => ({
      ...turn,
      assistant: turn.assistant?.streaming ? { ...turn.assistant, streaming: false } : turn.assistant,
      process: turn.process?.map((item) => (
        item.streaming || item.status === 'running'
          ? { ...item, streaming: false, status: 'error' as const, summary: INTERRUPTED_SUMMARY }
          : item
      )),
    })), {
      id: turnId,
      startedAt,
      user: {
        id: `${turnId}-user`,
        content: prompt,
        timestamp: new Date(),
      },
    }])

    const pushProcess = (item: OMPHProcessItem) => {
      setTurns((current) => patchTurn(current, turnId, (turn) => ({
        ...turn,
        process: [...(turn.process ?? []), item],
      })))
    }
    const patchProcess = (itemId: string, recipe: (item: OMPHProcessItem) => OMPHProcessItem) => {
      setTurns((current) => patchTurn(current, turnId, (turn) => ({
        ...turn,
        process: turn.process?.map((item) => (item.id === itemId ? recipe(item) : item)),
      })))
    }

    pushProcess({
      id: `${turnId}-reasoning`,
      kind: 'reasoning',
      title: 'Read the constraint',
      status: 'running',
      streaming: true,
      content: '',
    })
    const reasoningDone = await reveal(token, REASONING_TEXT, (slice) => {
      patchProcess(`${turnId}-reasoning`, (item) => ({ ...item, content: slice }))
    })
    if (!reasoningDone || !alive()) return
    patchProcess(`${turnId}-reasoning`, (item) => ({
      ...item,
      streaming: false,
      status: 'success',
      summary: 'Line 2',
    }))

    await wait(PROCESS_BEAT_MS)
    if (!alive()) return
    pushProcess({
      id: `${turnId}-tool`,
      kind: 'tool',
      title: 'Query open orders',
      summary: 'Plant 1000',
      status: 'running',
    })
    await wait(PROCESS_BEAT_MS)
    if (!alive()) return
    patchProcess(`${turnId}-tool`, (item) => ({
      ...item,
      status: 'success',
      summary: '3 orders',
      content: '4500012381 · 4500012379 · 4500012383',
    }))

    const commandId = `${turnId}-command`
    pushProcess({
      id: commandId,
      kind: 'command',
      title: FREEZE_TOOL_NAME,
      status: 'running',
      summary: 'Waiting for approval',
    })
    const decision = await requestApproval({
      id: `${turnId}-approval`,
      toolName: FREEZE_TOOL_NAME,
      callId: commandId,
      reason: FREEZE_REASON,
      detail: FREEZE_COMMAND,
      choices: RECOVERY_CHOICES,
      allowOther: true,
    })
    if (!alive()) return
    const outcome = commandResult(decision)
    patchProcess(commandId, (item) => ({
      ...item,
      status: outcome.status,
      summary: outcome.summary,
      content: outcome.content,
    }))
    if (decision.kind === 'rejected') {
      setTurns((current) => patchTurn(current, turnId, (turn) => ({
        ...turn,
        assistant: {
          id: `${turnId}-assistant`,
          content: APPROVAL_DENIED,
          timestamp: new Date(),
          streaming: false,
        },
      })))
      setIsResponding(false)
      setStatus('idle')
      return
    }
    const reply = replyForDecision(prompt, decision)

    setTurns((current) => patchTurn(current, turnId, (turn) => ({
      ...turn,
      assistant: {
        id: `${turnId}-assistant`,
        content: '',
        timestamp: new Date(),
        streaming: true,
      },
    })))
    const replyDone = await reveal(token, reply, (slice) => {
      setTurns((current) => patchTurn(current, turnId, (turn) => ({
        ...turn,
        assistant: turn.assistant ? { ...turn.assistant, content: slice, streaming: true } : turn.assistant,
      })))
    })
    if (!replyDone || !alive()) return

    setTurns((current) => patchTurn(current, turnId, (turn) => ({
      ...turn,
      assistant: turn.assistant ? { ...turn.assistant, streaming: false } : turn.assistant,
      usage: {
        inputTokens: prompt.length,
        outputTokens: turn.assistant?.content.length,
        durationMs: Date.now() - startedAt,
      },
    })))
    setIsResponding(false)
    setStatus('success')
    await wait(SUCCESS_HOLD_MS)
    if (alive()) setStatus('idle')
  }, [clearTimers, requestApproval, reveal, wait])

  const handleSend = useCallback(async (content: string) => {
    await respond(content.trim() || 'test')
  }, [respond])

  const handleStop = useCallback(() => {
    const token = runToken.current
    runToken.current += 1
    clearTimers()
    cancelApproval()
    settleStopped(`turn-${token}`)
  }, [cancelApproval, clearTimers, settleStopped])

  const handleLoadOlder = useCallback(() => {
    if (loadingOlder || !hasOlder) return
    setLoadingOlder(true)
    olderTimer.current = window.setTimeout(() => {
      olderTimer.current = null
      setTurns((current) => [olderTurn(), ...current])
      setHasOlder(false)
      setLoadingOlder(false)
    }, OLDER_DELAY_MS)
  }, [hasOlder, loadingOlder])

  const abandonRun = useCallback(() => {
    runToken.current += 1
    clearTimers()
    cancelApproval()
    setIsResponding(false)
    setStatus('idle')
    setLoadingOlder(false)
  }, [cancelApproval, clearTimers])

  const rememberLeaving = useCallback((list: DemoConversation[], leavingId: string) => {
    const liveTurns = freezeTurns(turnsRef.current)
    return list.map((item) => {
      if (item.id !== leavingId) return item
      const changed = turnSignature(liveTurns) !== turnSignature(item.turns)
      return {
        ...item,
        title: item.title === NEW_CONVERSATION_TITLE ? (titleFromTurns(liveTurns) || item.title) : item.title,
        turns: liveTurns,
        hasOlder: hasOlderRef.current,
        updatedAt: changed ? new Date() : item.updatedAt,
      }
    })
  }, [])

  const selectConversation = (id: string) => {
    if (id === activeIdRef.current) return
    const nextList = rememberLeaving(conversationsRef.current, activeIdRef.current)
    const selected = nextList.find((item) => item.id === id)
    if (!selected) return
    abandonRun()
    setConversations(nextList)
    setActiveId(id)
    setTurns(selected.turns)
    setHasOlder(selected.hasOlder)
    setPanelOpen(true)
  }

  const createConversation = () => {
    const id = `conversation-${conversationSeq.current}`
    conversationSeq.current += 1
    const created: DemoConversation = {
      id,
      title: NEW_CONVERSATION_TITLE,
      updatedAt: new Date(),
      turns: [],
      hasOlder: false,
    }
    const nextList = [created, ...rememberLeaving(conversationsRef.current, activeIdRef.current)]
    abandonRun()
    setConversations(nextList)
    setActiveId(id)
    setTurns([])
    setHasOlder(false)
    setPanelOpen(true)
  }

  const resetConversation = () => {
    const id = activeIdRef.current
    const seed = seedFor(id)
    abandonRun()
    setTurns(seed.turns)
    setHasOlder(seed.hasOlder)
    setLastCardEvent(null)
    setExternalPath(null)
    setConversations((current) => current.map((item) => (
      item.id === id ? { ...item, ...seed } : item
    )))
  }

  const conversationItems = conversations.map((item) => {
    const live = item.id === activeId
    const itemTurns = live ? turns : item.turns
    return {
      id: item.id,
      title: live && item.title === NEW_CONVERSATION_TITLE ? (titleFromTurns(itemTurns) || item.title) : item.title,
      preview: conversationPreview(itemTurns),
      updatedAt: live && turnSignature(itemTurns) !== turnSignature(item.turns) ? new Date() : item.updatedAt,
    }
  })

  const panel = (
    <OMPHPanel
      className={edgeGlow ? 'min-h-0 w-full flex-1' : 'h-full'}
      title="Data Analysis Agent"
      description="Plant 1000 context"
      agentStatus={status}
      isResponding={isResponding}
      turns={turns}
      processDisplay={processDisplay}
      hasOlder={hasOlder}
      loadingOlder={loadingOlder}
      onLoadOlder={handleLoadOlder}
      cardHooks={{ onCardEvent: setLastCardEvent }}
      loadFilePreview={loadFilePreview}
      filePreviewLayout={previewLayout}
      onOpenFileExternally={(ref) => setExternalPath(ref.path)}
      conversations={conversationItems}
      activeConversationId={activeId}
      onNewConversation={createConversation}
      onSelectConversation={selectConversation}
      headerActions={(
        <button type="button" className="orb-omph-icon-btn" aria-label="Close panel" onClick={() => setPanelOpen(false)}>
          <X size={16} />
        </button>
      )}
    />
  )

  const chipClass = (selected: boolean) =>
    selected
      ? 'border-[var(--orb-primary,#154194)] bg-[var(--orb-p50,#eef2f9)] text-[var(--orb-primary,#154194)]'
      : 'border-[var(--orb-border,#dbdbdb)] text-[var(--orb-muted,#8c8c8c)] hover:bg-[var(--orb-hover,#eef2f9)]'

  return (
    <div className="flex h-screen min-h-0 w-full flex-col bg-[var(--orb-surface,#f5f5f5)]">
      <CAppHeader
        appTitle="OMPH Panel"
        showSearch
        panelOpen={panelOpen}
        onOpenPanel={() => setPanelOpen(true)}
        onSearch={(query) => {
          setPanelOpen(true)
          void handleSend(query)
        }}
      />
      <div className="flex shrink-0 flex-col gap-3 px-4 pb-3 pt-4 md:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPanelOpen(true)
              void handleSend('test')
            }}
            disabled={isResponding}
            className="rounded-lg bg-[var(--orb-primary,#154194)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Run test
          </button>
          <button
            type="button"
            onClick={resetConversation}
            className="rounded-lg border border-[var(--orb-border,#dbdbdb)] bg-[var(--orb-canvas,#ffffff)] px-4 py-2 text-sm font-medium text-[var(--orb-fg,#555555)]"
          >
            Reset
          </button>
          {STATUS_BUTTONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold ${chipClass(status === value)}`}
            >
              {label}
            </button>
          ))}
          {DISPLAY_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setProcessDisplay(value)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold ${chipClass(processDisplay === value)}`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--orb-muted,#8c8c8c)]">Panel width</span>
          {PANEL_WIDTHS.map(({ label, px }) => (
            <button
              key={label}
              type="button"
              onClick={() => setPanelWidth(px)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold ${chipClass(panelWidth === px)}`}
            >
              {label} · {px}
            </button>
          ))}
          <span className="ml-2 text-xs text-[var(--orb-muted,#8c8c8c)]">Preview</span>
          {PREVIEW_LAYOUTS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPreviewLayout(value)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold ${chipClass(previewLayout === value)}`}
            >
              {value}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={edgeGlow}
            onClick={() => setEdgeGlow((current) => !current)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${chipClass(edgeGlow)}`}
          >
            Edge glow
          </button>
        </div>

        <div className="text-xs text-[var(--orb-muted,#8c8c8c)]">
          Type <span className="font-semibold text-[var(--orb-primary,#154194)]">test</span> in the header or below to continue this session.
          Close the panel, then use Open conversation in the header to bring the same session back.
          New conversation and the conversation list are in the panel header.
          {externalPath && <span> Open externally requested: {externalPath}.</span>}
        </div>
        {lastCardEvent && (
          <div className="rounded-lg border border-[var(--orb-border,#dbdbdb)] bg-[var(--orb-canvas,#ffffff)] px-3 py-2 text-xs text-[var(--orb-muted,#8c8c8c)]" role="status">
            Card event: <span className="font-semibold text-[var(--orb-fg,#555555)]">{lastCardEvent.cardType}</span> / {lastCardEvent.action}
          </div>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        {!panelOpen && (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[var(--orb-muted,#8c8c8c)]">
            This session is still here. Use Open conversation in the header to bring the panel back.
          </div>
        )}
        {panelOpen && !edgeGlow && (
        <div className="mx-auto flex h-full min-h-0 w-full flex-col gap-3 px-4 pb-4 md:px-8" style={{ maxWidth: panelWidth }}>
          <div className="min-h-0 flex-1">
            {panel}
          </div>
          <div className="[&>div]:max-w-none">
            {approval ? (
              <OMPHApprovalCard request={approval} onDecide={(decision) => {
                const resolve = approvalResolver.current
                approvalResolver.current = null
                setApproval(null)
                resolve?.(decision)
              }} />
            ) : (
              <InputArea
                onSend={handleSend}
                onStop={handleStop}
                isResponding={isResponding}
                placeholder="Type test"
              />
            )}
          </div>
        </div>
        )}
        {panelOpen && edgeGlow && (
          <div className="orb-omph-bloom" style={{ '--orb-bloom-width': `${panelWidth}px` } as React.CSSProperties}>
            <div className="orb-omph-bloom-backdrop" />
            <div className="orb-omph-bloom-center">
              <div className="orb-omph-bloom-panel">
                <div className="orb-omph-bloom-glow" aria-hidden="true" />
                <div className="orb-omph-bloom-card">
                  {panel}
                </div>
              </div>
              <div className="orb-omph-bloom-composer [&>div]:max-w-none">
                {approval ? (
                  <OMPHApprovalCard request={approval} onDecide={(decision) => {
                    const resolve = approvalResolver.current
                    approvalResolver.current = null
                    setApproval(null)
                    resolve?.(decision)
                  }} />
                ) : (
                  <InputArea
                    onSend={handleSend}
                    onStop={handleStop}
                    isResponding={isResponding}
                    placeholder="Type test"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
