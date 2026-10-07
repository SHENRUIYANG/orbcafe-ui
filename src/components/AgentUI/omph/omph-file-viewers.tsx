/**
 * OMPHPanel 文件查看器
 *
 * 内容大纲：
 * - 代码查看器：行号、行区间高亮、换行开关、超长截断
 * - Markdown 查看器：限定阅读宽度
 * - 图片查看器：适应宽度与缩放
 *
 * 作者：ORBAICODER
 * 版本：1.0.1
 * 日期：2026-10-04
 *
 * 作用：把宿主交回的文件内容画出来。颜色全部来自 ORBIS 令牌，代码高亮由 CSS 按 token 类名上色，不引入外部主题。
 *
 * 代码逻辑大纲：
 * 1. 代码：超过上限的行数不渲染，只给提示；有行区间时把起始行滚到视口上三分之一处。
 * 2. 图片：默认适应宽度且不放大；缩放按固定档位，以图片固有宽度为基准。
 * 3. Markdown 直接复用 AgentUI 的 MarkdownRenderer。
 *
 * ChangeLog：
 * - 1.0.1 2026-10-04 代码容器不再套用 Prism 默认浅色主题（黑字 + 白字阴影），深色底上的标识符改为继承前景色。
 * - 1.0.0 2026-10-04 初始版本。
 */

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, HTMLProps } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import MarkdownRenderer from '../components/renderers/MarkdownRenderer'
import type { OMPHPanelLabels } from './omph-panel-types'

const MAX_PREVIEW_LINES = 2000
const SCROLL_ANCHOR_RATIO = 1 / 3
const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4] as const
const PERCENT = 100

/**
 * Prism 在关闭行内 token 色之后，仍会把默认浅色主题写到代码标签上
 * （黑字、白色文字阴影）。这里改成继承容器，颜色只由 ORBIS 的 token 规则决定。
 */
const CODE_SURFACE_STYLE: CSSProperties = {
  color: 'inherit',
  background: 'transparent',
  textShadow: 'none',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  textAlign: 'left',
  wordSpacing: 'normal',
  wordBreak: 'normal',
  overflowWrap: 'normal',
  tabSize: 'inherit',
  hyphens: 'none',
}

type LineProps = HTMLProps<HTMLElement>

export const OmphCodeView = ({
  text,
  language,
  startLine,
  endLine,
  wrap,
  labels,
}: {
  text: string
  language: string
  startLine?: number
  endLine?: number
  wrap: boolean
  labels: OMPHPanelLabels
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null)

  const view = useMemo(() => {
    const lines = text.split('\n')
    if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop()
    const shownCount = Math.min(lines.length, MAX_PREVIEW_LINES)
    return { shown: lines.slice(0, shownCount).join('\n'), shownCount, total: lines.length }
  }, [text])

  const lineProps = useCallback((lineNumber: number): LineProps => {
    const last = endLine ?? startLine
    const hit = startLine !== undefined && last !== undefined && lineNumber >= startLine && lineNumber <= last
    return { className: 'orb-omph-code-line', 'data-line': lineNumber, ...(hit ? { 'data-hit': 'true' } : {}) } as LineProps
  }, [endLine, startLine])

  useEffect(() => {
    const root = rootRef.current
    const scroller = root?.closest<HTMLElement>('.orb-omph-pv-body')
    if (!root || !scroller) return
    if (startLine === undefined) {
      scroller.scrollTop = 0
      return
    }
    const target = root.querySelector<HTMLElement>(`[data-line="${startLine}"]`)
    if (!target) return
    const offset = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
    scroller.scrollTop = Math.max(0, offset - scroller.clientHeight * SCROLL_ANCHOR_RATIO)
  }, [startLine, view.shown])

  const style = { '--orb-omph-digits': String(view.shownCount).length } as CSSProperties

  return (
    <div ref={rootRef} className="orb-omph-code" data-wrap={wrap || undefined} style={style}>
      <SyntaxHighlighter
        language={language}
        useInlineStyles={false}
        PreTag="div"
        CodeTag="div"
        showLineNumbers
        wrapLines
        lineProps={lineProps}
        customStyle={CODE_SURFACE_STYLE}
        codeTagProps={{
          className: `language-${language}`,
          style: CODE_SURFACE_STYLE,
        }}
      >
        {view.shown}
      </SyntaxHighlighter>
      {view.total > view.shownCount && (
        <div className="orb-omph-pv-note">{labels.previewTruncated(view.shownCount, view.total)}</div>
      )}
    </div>
  )
}

export const OmphMarkdownView = ({ text }: { text: string }) => (
  <div className="orb-omph-pv-doc">
    <MarkdownRenderer content={text} />
  </div>
)

type Zoom = 'fit' | number

export const OmphImageView = ({ url, alt, labels }: { url: string; alt?: string; labels: OMPHPanelLabels }) => {
  const [zoom, setZoom] = useState<Zoom>('fit')
  const [naturalWidth, setNaturalWidth] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)

  const effective = zoom === 'fit' ? 1 : zoom
  const canZoomIn = ZOOM_STEPS.some((step) => step > effective)
  const canZoomOut = ZOOM_STEPS.some((step) => step < effective)
  /** 基于当前值前进一档，连续点击也不会读到过期状态。 */
  const stepZoom = (direction: 1 | -1) => setZoom((current) => {
    const from = current === 'fit' ? 1 : current
    const next = direction > 0
      ? ZOOM_STEPS.find((step) => step > from)
      : [...ZOOM_STEPS].reverse().find((step) => step < from)
    return next ?? current
  })
  const imageStyle: CSSProperties = zoom === 'fit' || naturalWidth === null
    ? { maxWidth: '100%', height: 'auto' }
    : { width: naturalWidth * zoom, maxWidth: 'none', height: 'auto' }

  if (failed) {
    return <div className="orb-omph-pv-note" role="alert">{alt ? `${labels.imageFailed} · ${alt}` : labels.imageFailed}</div>
  }

  return (
    <div className="orb-omph-img">
      <div className="orb-omph-img-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt ?? ''}
          draggable={false}
          style={imageStyle}
          onLoad={(event) => setNaturalWidth(event.currentTarget.naturalWidth)}
          onError={() => setFailed(true)}
        />
      </div>
      <div className="orb-omph-img-zoom" role="group" aria-label={labels.zoomFit}>
        <button
          type="button"
          aria-label={labels.zoomOut}
          disabled={!canZoomOut}
          onClick={() => stepZoom(-1)}
        >
          −
        </button>
        <button type="button" aria-label={labels.zoomFit} data-active={zoom === 'fit' || undefined} onClick={() => setZoom('fit')}>
          {zoom === 'fit' ? labels.zoomFit : `${Math.round(zoom * PERCENT)}%`}
        </button>
        <button
          type="button"
          aria-label={labels.zoomIn}
          disabled={!canZoomIn}
          onClick={() => stepZoom(1)}
        >
          +
        </button>
      </div>
    </div>
  )
}
