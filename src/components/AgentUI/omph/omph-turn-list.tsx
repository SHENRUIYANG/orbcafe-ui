/**
 * OMPHPanel 轮次渲染
 *
 * 内容大纲：
 * - 用户气泡、过程行、助手 Markdown、失败行
 * - 已完成轮次的复制和用量
 * - 过程行折叠与组内滚动
 *
 * 作者：ORBAICODER
 * 版本：1.3.0
 * 日期：2026-10-04
 *
 * 作用：把一轮 OMPHTurn 画成 Harness 风格的阅读流，助手正文继续走 AgentUI 的 Markdown 与指标图卡。
 *
 * 代码逻辑大纲：
 * 1. 进行中的过程行默认展开，已完成过程按展示模式收起，用户手动开合会被记住。
 * 2. 最新一轮且以助手回复结束时，操作常显；更早的轮次在悬停或键盘聚焦时显示。
 * 3. 助手正文交给 ContentRenderer，卡片事件仍从 cardHooks 出去。
 * 4. 文件链接用事件委托拦截：只有宿主提供了 onOpenFile 才生效，且不改共享的 Markdown 渲染器。
 *
 * ChangeLog：
 * - 1.3.0 2026-10-04 操作行改成浅底色操作条：时间在左，Usage 居中靠分隔线，复制在右。
 * - 1.2.0 2026-10-04 去掉“从这里分支”按钮与 onBranch；操作行贴近回复。
 * - 1.1.0 2026-10-04 助手回复里的文件链接可打开预览。
 * - 1.0.0 2026-10-04 初始版本。
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { Check, ChevronDown, Copy, MessageSquare, Settings, Terminal } from '../../Icons'
import ContentRenderer from '../components/core/ContentRenderer'
import type { AgentUICardHooks } from '../components/cardTypes'
import type { OMPHFileLinkResolver, OMPHFileRef } from './omph-file-preview-types'
import type {
  OMPHPanelLabels,
  OMPHProcessDisplay,
  OMPHProcessItem,
  OMPHTurn,
  OMPHTurnUsage,
} from './omph-panel-types'

const COPY_FEEDBACK_MS = 1000
const RAIL_PREVIEW_CHARS = 50
const MS_PER_SECOND = 1000

const processIcon = (kind: OMPHProcessItem['kind']) => {
  if (kind === 'tool') return Settings
  if (kind === 'command') return Terminal
  return MessageSquare
}

const isLiveProcess = (item: OMPHProcessItem) =>
  Boolean(item.streaming) || item.status === 'running' || item.status === 'pending'

const defaultProcessOpen = (item: OMPHProcessItem, display: OMPHProcessDisplay) => {
  if (display === 'expanded') return true
  return isLiveProcess(item)
}

const hasUsage = (usage: OMPHTurnUsage | undefined) =>
  usage !== undefined && (usage.inputTokens !== undefined || usage.outputTokens !== undefined || usage.durationMs !== undefined)

const formatDuration = (durationMs: number, labels: OMPHPanelLabels) => {
  const seconds = Math.max(1, Math.round(durationMs / MS_PER_SECOND))
  return `${seconds}${labels.secondUnit}`
}

const ProcessBody = ({ content }: { content: string }) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [overflow, setOverflow] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    const measure = () => setOverflow(element.scrollHeight > element.clientHeight + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [content])

  return (
    <div ref={ref} className="orb-omph-process-body" data-overflow={overflow || undefined}>
      {content}
    </div>
  )
}

const TurnActions = ({
  turn,
  labels,
}: {
  turn: OMPHTurn
  labels: OMPHPanelLabels
}) => {
  const [copied, setCopied] = useState(false)
  const [usageOpen, setUsageOpen] = useState(false)
  const text = turn.assistant?.content ?? ''
  const usage = turn.usage

  useEffect(() => {
    if (!copied) return undefined
    const timer = window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  return (
    <div className="orb-omph-turn-actions" role="group" aria-label={labels.turnActions}>
      <span className="orb-omph-actions-time">{turn.assistant?.timestamp.toLocaleTimeString()}</span>
      {hasUsage(usage) && (
        <>
          <span className="orb-omph-actions-divider" aria-hidden="true" />
          <button
            type="button"
            className="orb-omph-text-button"
            aria-expanded={usageOpen}
            onClick={() => setUsageOpen((open) => !open)}
          >
            {labels.usage}
          </button>
        </>
      )}
      <button
        type="button"
        className="orb-omph-icon-button orb-omph-actions-end"
        aria-label={copied ? labels.copied : labels.copy}
        onClick={() => {
          void navigator.clipboard.writeText(text).then(() => setCopied(true))
        }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      {usageOpen && usage && (
        <div className="orb-omph-usage">
          {usage.inputTokens !== undefined && <span>{labels.inputTokens} {usage.inputTokens.toLocaleString()}</span>}
          {usage.outputTokens !== undefined && <span>{labels.outputTokens} {usage.outputTokens.toLocaleString()}</span>}
          {usage.durationMs !== undefined && <span>{labels.duration} {formatDuration(usage.durationMs, labels)}</span>}
        </div>
      )}
    </div>
  )
}

const ProcessRow = ({
  item,
  display,
  open,
  onToggle,
}: {
  item: OMPHProcessItem
  display: OMPHProcessDisplay
  open: boolean
  onToggle: () => void
}) => {
  const Icon = processIcon(item.kind)
  const live = isLiveProcess(item)
  const showSummary = display !== 'compact' && Boolean(item.summary)
  const showBody = open && Boolean(item.content)

  return (
    <div className="orb-omph-process" data-status={item.status} data-open={open || undefined}>
      <button type="button" className="orb-omph-process-toggle" aria-expanded={open} onClick={onToggle}>
        <ChevronDown size={12} className="orb-omph-process-chevron" />
        <Icon size={14} />
        <span className={live ? 'orb-omph-shimmer' : undefined}>{item.title}</span>
        {showSummary && <span className="orb-omph-process-summary">{item.summary}</span>}
      </button>
      {showBody && item.content && (
        <ProcessBody content={item.content} />
      )}
      {open && item.streaming && <span className="orb-omph-caret" aria-hidden="true" />}
    </div>
  )
}

export const turnRailPreview = (turn: OMPHTurn) => {
  const source = turn.user?.content || turn.assistant?.content || turn.id
  const line = source.split('\n').find((part) => part.trim()) ?? source
  return line.length > RAIL_PREVIEW_CHARS ? `${line.slice(0, RAIL_PREVIEW_CHARS)}…` : line
}

const PRIMARY_BUTTON = 0

export const OmphTurnList = ({
  turns,
  labels,
  processDisplay,
  cardHooks,
  resolveFileLink,
  onOpenFile,
}: {
  turns: OMPHTurn[]
  labels: OMPHPanelLabels
  processDisplay: OMPHProcessDisplay
  cardHooks?: AgentUICardHooks
  resolveFileLink: OMPHFileLinkResolver
  /** 提供时，助手回复里的文件链接会打开预览；不提供则链接保持默认行为。 */
  onOpenFile?: (ref: OMPHFileRef, opener: HTMLElement) => void
}) => {
  const [openProcess, setOpenProcess] = useState<Record<string, boolean>>({})

  const handleAssistantClick = (event: MouseEvent<HTMLElement>) => {
    if (!onOpenFile || event.defaultPrevented || event.button !== PRIMARY_BUTTON) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]')
    if (!anchor) return
    const ref = resolveFileLink(anchor.getAttribute('href') ?? '')
    if (!ref) return
    event.preventDefault()
    onOpenFile(ref, anchor)
  }

  return (
    <>
      {turns.map((turn, index) => {
        const assistantSettled = Boolean(turn.assistant && !turn.assistant.streaming)
        const isLatest = index === turns.length - 1
        const reveal: 'always' | 'hover' = isLatest && assistantSettled ? 'always' : 'hover'

        return (
          <article key={turn.id} className="orb-omph-turn" data-omph-turn={turn.id} data-actions-reveal={reveal}>
            {turn.user && (
              <div className="orb-omph-user">
                <div className="orb-omph-user-bubble">{turn.user.content}</div>
                <div className="orb-omph-clock">{turn.user.timestamp.toLocaleTimeString()}</div>
              </div>
            )}
            {turn.process && turn.process.length > 0 && (
              <div className="orb-omph-process-list">
                {turn.process.map((item) => {
                  const open = item.id in openProcess ? openProcess[item.id] : defaultProcessOpen(item, processDisplay)
                  return (
                    <ProcessRow
                      key={item.id}
                      item={item}
                      display={processDisplay}
                      open={open}
                      onToggle={() => setOpenProcess((current) => ({ ...current, [item.id]: !open }))}
                    />
                  )
                })}
              </div>
            )}
            {turn.assistant && (
              <div
                className="orb-omph-assistant"
                data-file-links={onOpenFile ? 'true' : undefined}
                onClick={handleAssistantClick}
              >
                <ContentRenderer content={turn.assistant.content} messageId={turn.assistant.id} cardHooks={cardHooks} />
                {turn.assistant.streaming && <span className="orb-omph-caret" aria-hidden="true" />}
              </div>
            )}
            {turn.failure && (
              <div className="orb-omph-failure" data-severity={turn.failure.severity}>
                {turn.failure.content}
              </div>
            )}
            {assistantSettled && <TurnActions turn={turn} labels={labels} />}
          </article>
        )
      })}
    </>
  )
}
