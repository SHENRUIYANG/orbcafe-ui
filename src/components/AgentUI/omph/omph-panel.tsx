/**
 * OMPHPanel
 *
 * 内容大纲：
 * - ORBIS 头部与五态状态点
 * - 轮次正文、运行态扫光和已用时长
 * - 贴底滚动、回到底部、轮次轨道、更早内容
 * - 会话输入：默认关闭。需要时再打开内置输入条
 * - 文件预览：助手回复里的文件链接打开右侧窗格（大屏并排，小屏覆盖）
 *
 * 作者：ORBAICODER
 * 版本：1.3.0
 * 日期：2026-10-04
 *
 * 作用：Harness 会话面板与 AgentPanel 的并集。宿主持有轮次，组件负责 ORBIS 样式下的状态、流式、卡片和滚动。
 *
 * 代码逻辑大纲：
 * 1. agentStatus 优先；缺省时由 isResponding 落到 running 或 idle。
 * 2. pending/running 在正文末尾显示分隔线、spinner 和扫光文案，时钟只在这一行里跳。
 * 3. 助手内容按宿主已经追加的全文渲染，streaming 只负责光标，不再做打字机。
 * 4. 输入条默认不渲染。打开后，忙碌且草稿为空时变成停止，有内容时仍然发送。
 * 5. 提供 loadFilePreview 才启用文件预览；主体是一个网格：左列是对话与输入，右列是预览窗格。
 *    覆盖模式下预览盖住整个主体，被盖住的对话列设为 inert，键盘不会落到看不见的控件上。
 *
 * ChangeLog：
 * - 1.3.0 2026-10-04 输入条默认关闭，回复正文 14px。
 * - 1.2.0 2026-10-04 去掉 onBranch（OMPH 桥没有 fork 能力）。
 * - 1.1.0 2026-10-04 文件预览与大小屏两种布局。
 * - 1.0.0 2026-10-04 初始版本。AgentPanel 保持原样。
 */

'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEventHandler, type ReactNode } from 'react'
import { ArrowUp, ChevronDown, CircleStop } from '../../Icons'
import { cn } from '../lib/utils'
import type { AgentUICardHooks } from '../components/cardTypes'
import { OmphFilePreview } from './omph-file-preview'
import { parseOmphFileHref } from './omph-file-link'
import type {
  OMPHFileLinkResolver,
  OMPHFilePreviewLayout,
  OMPHFilePreviewLoader,
  OMPHFileRef,
} from './omph-file-preview-types'
import { OmphTurnList, turnRailPreview } from './omph-turn-list'
import {
  formatOmphElapsed,
  resolveOmphLabels,
  type OMPHPanelLabels,
  type OMPHPanelStatus,
  type OMPHProcessDisplay,
  type OMPHTurn,
} from './omph-panel-types'
import { useOmphFilePreview } from './use-omph-file-preview'
import { PREVIEW_PREF_VAR, PREVIEW_WIDTH_VAR, useOmphPreviewLayout } from './use-omph-preview-layout'
import { useOmphTranscriptScroll } from './use-omph-transcript-scroll'

const CLOCK_INTERVAL_MS = 1000

export interface OMPHPanelProps {
  turns: OMPHTurn[]
  title?: string
  description?: string
  headerActions?: ReactNode
  agentStatus?: OMPHPanelStatus
  isResponding?: boolean
  labels?: Partial<OMPHPanelLabels>
  processDisplay?: OMPHProcessDisplay
  showInput?: boolean
  placeholder?: string
  className?: string
  cardHooks?: AgentUICardHooks
  hasOlder?: boolean
  loadingOlder?: boolean
  onLoadOlder?: () => void
  onSend?: (content: string) => void | Promise<void>
  onStop?: () => void
  onHeaderPointerDown?: PointerEventHandler<HTMLDivElement>
  /** 提供后才启用文件预览：助手回复里的文件链接会打开预览窗格。 */
  loadFilePreview?: OMPHFilePreviewLoader
  /** 判断链接是不是文件。默认把相对路径和以 `/` 开头的路径当作文件。 */
  resolveFileLink?: OMPHFileLinkResolver
  /** 预览窗格怎么摆。默认 auto：面板够宽时并排，否则覆盖。 */
  filePreviewLayout?: OMPHFilePreviewLayout
  /** 提供后，预览里会出现“在外部打开”。 */
  onOpenFileExternally?: (ref: OMPHFileRef) => void
}

const statusLabel = (status: OMPHPanelStatus, labels: OMPHPanelLabels) => labels[status]

const contentVersionOf = (turns: OMPHTurn[]) => turns.map((turn) => [
  turn.id,
  turn.user?.content.length ?? 0,
  turn.assistant?.content.length ?? 0,
  turn.assistant?.streaming ? '1' : '0',
  turn.failure?.id ?? '',
  (turn.process ?? []).map((item) => `${item.id}:${item.status}:${item.content?.length ?? 0}`).join(','),
].join(':')).join('|')

const RunningRow = ({
  startedAt,
  labels,
}: {
  startedAt?: number
  labels: OMPHPanelLabels
}) => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), CLOCK_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [startedAt])

  const text = startedAt === undefined
    ? labels.working
    : labels.workingFor(formatOmphElapsed(Math.max(0, now - startedAt), labels))

  return (
    <div className="orb-omph-running" data-omph-running="true">
      <span className="orb-visually-hidden" role="status" aria-live="polite">{labels.working}</span>
      <span className="orb-omph-running-rule" aria-hidden="true" />
      <span className="orb-omph-running-body">
        <span className="orb-omph-spinner" aria-hidden="true" />
        <span className="orb-omph-shimmer">{text}</span>
      </span>
    </div>
  )
}

export const OMPHPanel = ({
  turns,
  title = 'OMPH Agent',
  description,
  headerActions,
  agentStatus,
  isResponding = false,
  labels: labelOverride,
  processDisplay = 'standard',
  showInput = false,
  placeholder,
  className,
  cardHooks,
  hasOlder = false,
  loadingOlder = false,
  onLoadOlder,
  onSend,
  onStop,
  onHeaderPointerDown,
  loadFilePreview,
  resolveFileLink = parseOmphFileHref,
  filePreviewLayout = 'auto',
  onOpenFileExternally,
}: OMPHPanelProps) => {
  const labels = resolveOmphLabels(labelOverride)
  const resolvedStatus: OMPHPanelStatus = agentStatus ?? (isResponding ? 'running' : 'idle')
  const busy = resolvedStatus === 'running' || resolvedStatus === 'pending'
  const subtitle = [statusLabel(resolvedStatus, labels), description].filter(Boolean).join(' · ')
  const contentVersion = useMemo(() => contentVersionOf(turns), [turns])
  const scroll = useOmphTranscriptScroll({
    turns,
    contentVersion,
    hasOlder,
    loadingOlder,
    onLoadOlder,
  })
  const [draft, setDraft] = useState('')
  const trimmed = draft.trim()
  const showStop = isResponding && trimmed.length === 0
  const liveTurn = [...turns].reverse().find((turn) =>
    Boolean(turn.assistant?.streaming) || turn.process?.some((item) => item.streaming || item.status === 'running' || item.status === 'pending')
  )
  const clockStart = busy ? liveTurn?.startedAt : undefined

  const previewEnabled = Boolean(loadFilePreview)
  const preview = useOmphFilePreview(loadFilePreview)
  const previewLayout = useOmphPreviewLayout({ open: preview.state.open, layout: filePreviewLayout })
  const paneRef = useRef<HTMLElement | null>(null)
  const centerRef = useRef<HTMLDivElement | null>(null)
  const covered = previewEnabled && preview.state.open && previewLayout.placement === 'overlay'
  const splitOpen = previewLayout.placement === 'split' && preview.state.open
  const mainStyle = {
    [PREVIEW_PREF_VAR]: `${previewLayout.width}px`,
    [PREVIEW_WIDTH_VAR]: splitOpen ? `${previewLayout.width}px` : '0px',
  } as CSSProperties

  useEffect(() => {
    centerRef.current?.toggleAttribute('inert', covered)
  }, [covered])

  const submit = async () => {
    if (!trimmed || !onSend) return
    const content = trimmed
    setDraft('')
    try {
      await onSend(content)
    } catch {
      setDraft((current) => (current.trim().length === 0 ? content : current))
    }
  }

  return (
    <div
      className={cn('orb-omph-panel', className)}
      data-omph-panel=""
      data-status={resolvedStatus}
      data-compact={previewLayout.compact || undefined}
    >
      <div
        className={cn('orb-omph-header', onHeaderPointerDown && 'cursor-grab active:cursor-grabbing')}
        onPointerDown={onHeaderPointerDown}
      >
        <span className="orb-omph-avatar" aria-hidden="true">AI</span>
        <div className="min-w-0 flex-1">
          <div className="orb-omph-title">{title}</div>
          <div className="orb-omph-subtitle">
            <span className="orb-omph-dot" data-active={busy || undefined} />
            <span className="truncate">{subtitle || labels.idle}</span>
          </div>
        </div>
        {headerActions && <div className="ml-auto flex flex-none items-center gap-1">{headerActions}</div>}
      </div>

      <div
        ref={previewLayout.mainRef}
        className="orb-omph-main"
        data-placement={previewLayout.placement}
        data-open={String(preview.state.open)}
        data-dragging={previewLayout.dragging || undefined}
        style={mainStyle}
      >
        <div ref={centerRef} className="orb-omph-center">
          <div className="orb-omph-stage" data-rail={scroll.railVisible || undefined}>
            <div ref={scroll.scrollerRef} className="orb-omph-scroll" onScroll={scroll.onScroll}>
              <div ref={scroll.contentRef} className="orb-omph-column">
                {hasOlder && onLoadOlder && (
                  <button type="button" className="orb-omph-older" disabled={loadingOlder} onClick={onLoadOlder}>
                    {loadingOlder ? labels.loadingOlder : labels.loadOlder}
                  </button>
                )}
                <OmphTurnList
                  turns={turns}
                  labels={labels}
                  processDisplay={processDisplay}
                  cardHooks={cardHooks}
                  resolveFileLink={resolveFileLink}
                  onOpenFile={previewEnabled ? preview.open : undefined}
                />
                {busy && <RunningRow startedAt={clockStart} labels={labels} />}
              </div>
            </div>

            {scroll.railVisible && turns.length > 0 && (
              <nav className="orb-omph-rail" aria-label={labels.turnRail}>
                {turns.map((turn) => (
                  <button
                    key={turn.id}
                    type="button"
                    className="orb-omph-rail-mark"
                    data-active={scroll.activeTurnId === turn.id || undefined}
                    aria-label={turnRailPreview(turn)}
                    title={turnRailPreview(turn)}
                    onClick={() => scroll.scrollToTurn(turn.id)}
                  />
                ))}
              </nav>
            )}

            {!scroll.following && (
              <button type="button" className="orb-omph-to-bottom" aria-label={labels.toBottom} onClick={scroll.returnToBottom}>
                <ChevronDown size={16} />
              </button>
            )}
          </div>

          {showInput && (
            <form
              className="orb-omph-composer"
              onSubmit={(event) => {
                event.preventDefault()
                if (showStop) onStop?.()
                else void submit()
              }}
            >
              <textarea
                className="orb-omph-input"
                value={draft}
                placeholder={placeholder}
                rows={1}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
                  event.preventDefault()
                  if (showStop) onStop?.()
                  else void submit()
                }}
              />
              <button
                type="submit"
                className={showStop ? 'orb-omph-stop' : 'orb-omph-send'}
                aria-label={showStop ? labels.stop : labels.send}
                disabled={!showStop && trimmed.length === 0}
              >
                {showStop ? <CircleStop size={16} /> : <ArrowUp size={16} />}
              </button>
            </form>
          )}
        </div>

        {previewEnabled && (
          <OmphFilePreview
            state={preview.state}
            placement={previewLayout.placement}
            expanded={previewLayout.expanded}
            canExpand={previewLayout.canExpand}
            labels={labels}
            gripProps={previewLayout.gripProps}
            paneRef={paneRef}
            onClose={preview.close}
            onRetry={preview.reload}
            onToggleExpand={previewLayout.toggleExpanded}
            onOpenExternally={onOpenFileExternally}
          />
        )}
      </div>
    </div>
  )
}

export default OMPHPanel
