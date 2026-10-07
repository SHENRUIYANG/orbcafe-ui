/**
 * OMPHPanel 文件预览窗格
 *
 * 内容大纲：
 * - 头部：文件图标、文件名、目录路径、操作按钮
 * - 信息条：类型、大小、行区间
 * - 正文：加载骨架、失败、缺失、不支持、以及三种查看器
 * - 并排时的拖拽把手
 *
 * 作者：ORBAICODER
 * 版本：1.0.0
 * 日期：2026-10-04
 *
 * 作用：对齐 DSH 右栏的文件预览。并排（大屏）时是右侧窗格，覆盖（小屏）时盖住整个正文区并以返回键收起。
 *
 * 代码逻辑大纲：
 * 1. 窗格始终挂载，开合由 data-open 驱动，这样滑入滑出有过渡，关闭后不可聚焦。
 * 2. 内容区按阶段与 body.kind 分支；文件缺失不给重试，读取失败给重试。
 * 3. 复制按钮在文本类内容复制正文，否则复制路径。
 *
 * ChangeLog：
 * - 1.0.0 2026-10-04 初始版本。
 */

'use client'

import { useEffect, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { AlertCircle, Check, ChevronLeft, Copy, Expand, File, Image, X } from '../../Icons'
import { OmphCodeView, OmphImageView, OmphMarkdownView } from './omph-file-viewers'
import { baseName, describeLanguage, dirName, extensionOf, formatBytes } from './omph-file-link'
import type { OMPHFilePreviewState } from './use-omph-file-preview'
import type { useOmphPreviewLayout } from './use-omph-preview-layout'
import type { OMPHPanelLabels } from './omph-panel-types'
import type { OMPHFileRef } from './omph-file-preview-types'

const COPY_FEEDBACK_MS = 1000
const SKELETON_ROWS = 9
const ICON_SIZE = 16

type GripProps = ReturnType<typeof useOmphPreviewLayout>['gripProps']

interface OmphFilePreviewProps {
  state: OMPHFilePreviewState
  placement: 'split' | 'overlay'
  expanded: boolean
  canExpand: boolean
  labels: OMPHPanelLabels
  gripProps: GripProps
  paneRef: { current: HTMLElement | null }
  onClose: (restoreFocus: boolean) => void
  onRetry: () => void
  onToggleExpand: () => void
  onOpenExternally?: (ref: OMPHFileRef) => void
}

const Notice = ({
  tone,
  icon,
  title,
  text,
  action,
}: {
  tone: 'neutral' | 'error'
  icon: ReactNode
  title: string
  text?: string
  action?: ReactNode
}) => (
  <div className="orb-omph-pv-notice" data-tone={tone} role={tone === 'error' ? 'alert' : undefined}>
    <span className="orb-omph-pv-notice-icon" aria-hidden="true">{icon}</span>
    <div className="orb-omph-pv-notice-title">{title}</div>
    {text && <p className="orb-omph-pv-notice-text">{text}</p>}
    {action}
  </div>
)

export const OmphFilePreview = ({
  state,
  placement,
  expanded,
  canExpand,
  labels,
  gripProps,
  paneRef,
  onClose,
  onRetry,
  onToggleExpand,
  onOpenExternally,
}: OmphFilePreviewProps) => {
  const [wrap, setWrap] = useState(true)
  const [copied, setCopied] = useState(false)
  const { open, ref, phase, data } = state
  const body = data?.body

  useEffect(() => {
    if (!copied) return undefined
    const timer = window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  useEffect(() => {
    if (open) paneRef.current?.focus({ preventScroll: true })
  }, [open, paneRef, ref?.path])

  const fullPath = data?.absolutePath ?? ref?.path ?? ''
  const copyText = body && (body.kind === 'markdown' || body.kind === 'code') ? body.text : fullPath
  const copyLabel = copyText === fullPath ? labels.previewCopyPath : labels.previewCopyContent
  const language = body?.kind === 'code' && ref ? describeLanguage(ref.path, body.language) : null

  const meta: string[] = []
  if (language) meta.push(language.label)
  if (body?.kind === 'markdown') meta.push('Markdown')
  if (body?.kind === 'image' && ref) meta.push(extensionOf(ref.path).toUpperCase())
  if (data?.size !== undefined) meta.push(formatBytes(data.size))
  if (body?.kind === 'code' && ref?.startLine !== undefined) {
    meta.push(labels.previewLines(ref.startLine, ref.endLine ?? ref.startLine))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape') return
    event.stopPropagation()
    onClose(true)
  }

  const retry = (
    <button type="button" className="orb-omph-pv-action" onClick={onRetry}>{labels.previewRetry}</button>
  )

  const renderBody = () => {
    if (!ref) return null
    if (phase === 'loading') {
      return (
        <div className="orb-omph-pv-skel" role="status" aria-label={labels.previewLoading}>
          {Array.from({ length: SKELETON_ROWS }, (_, index) => <span key={index} />)}
        </div>
      )
    }
    if (phase === 'error' || !body) {
      return <Notice tone="error" icon={<AlertCircle size={ICON_SIZE} />} title={labels.previewFailed} text={fullPath} action={retry} />
    }
    switch (body.kind) {
      case 'missing':
        return <Notice tone="neutral" icon={<File size={ICON_SIZE} />} title={labels.previewMissing} text={body.message ?? fullPath} />
      case 'unsupported':
        return (
          <Notice
            tone="neutral"
            icon={<File size={ICON_SIZE} />}
            title={labels.previewUnsupported}
            text={body.message ?? fullPath}
            action={onOpenExternally && (
              <button type="button" className="orb-omph-pv-action" onClick={() => onOpenExternally(ref)}>
                {labels.previewOpenExternal}
              </button>
            )}
          />
        )
      case 'markdown':
        return <OmphMarkdownView key={ref.path} text={body.text} />
      case 'code':
        return (
          <OmphCodeView
            key={ref.path}
            text={body.text}
            language={describeLanguage(ref.path, body.language).prism}
            startLine={ref.startLine}
            endLine={ref.endLine}
            wrap={wrap}
            labels={labels}
          />
        )
      case 'image':
        return <OmphImageView key={body.url} url={body.url} alt={body.alt} labels={labels} />
      default:
        return null
    }
  }

  const overlay = placement === 'overlay'
  const Glyph = body?.kind === 'image' ? Image : File

  return (
    <aside
      ref={paneRef}
      className="orb-omph-preview"
      data-open={open || undefined}
      data-placement={placement}
      role={overlay ? 'dialog' : 'complementary'}
      aria-label={labels.previewTitle}
      aria-hidden={!open || undefined}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      {!overlay && open && (
        <div className="orb-omph-pv-grip" aria-label={labels.previewResize} {...gripProps} />
      )}
      <div className="orb-omph-pv">
        <header className="orb-omph-pv-head">
          {overlay && (
            <button type="button" className="orb-omph-icon-button" aria-label={labels.previewBack} onClick={() => onClose(true)}>
              <ChevronLeft size={ICON_SIZE} />
            </button>
          )}
          <span className="orb-omph-pv-glyph" aria-hidden="true"><Glyph size={ICON_SIZE} /></span>
          <div className="orb-omph-pv-titles">
            <div className="orb-omph-pv-name" title={fullPath}>{ref ? baseName(ref.path) : ''}</div>
            <div className="orb-omph-pv-path" title={fullPath}><bdi>{dirName(fullPath)}</bdi></div>
          </div>
          <div className="orb-omph-pv-actions">
            {body?.kind === 'code' && (
              <button
                type="button"
                className="orb-omph-text-button"
                aria-pressed={wrap}
                onClick={() => setWrap((value) => !value)}
              >
                {labels.previewWrap}
              </button>
            )}
            {ref && (
              <button
                type="button"
                className="orb-omph-icon-button"
                aria-label={copied ? labels.copied : copyLabel}
                title={copied ? labels.copied : copyLabel}
                onClick={() => {
                  void navigator.clipboard.writeText(copyText).then(() => setCopied(true))
                }}
              >
                {copied ? <Check size={ICON_SIZE} /> : <Copy size={ICON_SIZE} />}
              </button>
            )}
            {/* canExpand 为真时只有两种情形：并排，或已展开（此时 placement 为 overlay）。 */}
            {canExpand && (
              <button
                type="button"
                className="orb-omph-icon-button"
                aria-pressed={expanded}
                aria-label={expanded ? labels.previewCollapse : labels.previewExpand}
                title={expanded ? labels.previewCollapse : labels.previewExpand}
                onClick={onToggleExpand}
              >
                <Expand size={ICON_SIZE} />
              </button>
            )}
            {!overlay && (
              <button type="button" className="orb-omph-icon-button" aria-label={labels.previewClose} onClick={() => onClose(true)}>
                <X size={ICON_SIZE} />
              </button>
            )}
          </div>
        </header>
        <div className="orb-omph-pv-meta">{meta.join(' · ')}</div>
        <div className="orb-omph-pv-body" data-kind={phase === 'ready' ? body?.kind : undefined}>
          {renderBody()}
        </div>
      </div>
    </aside>
  )
}
