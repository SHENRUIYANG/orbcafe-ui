/**
 * OMPHPanel 预览布局
 *
 * 内容大纲：
 * - 按面板自身宽度（不是屏幕宽度）判断并排还是覆盖
 * - 并排宽度的默认值、上下限、拖动与键盘调整
 * - 全屏展开
 *
 * 作者：ORBAICODER
 * 版本：1.0.0
 * 日期：2026-10-04
 *
 * 作用：让同一个面板放在宽区域或窄区域里都合理。数值参照 DSH 右栏：默认占 45%，最多 70%，会话区至少留 400px。
 *
 * 代码逻辑大纲：
 * 1. ResizeObserver 量主体宽度。
 * 2. auto 模式下宽度足够才并排；否则预览覆盖整个正文区。
 * 3. 拖动期间直接改 CSS 变量，松手才写入状态，避免每次移动都重渲整段对话。
 *
 * ChangeLog：
 * - 1.0.0 2026-10-04 初始版本。
 */

'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import type { OMPHFilePreviewLayout } from './omph-file-preview-types'

export const PREVIEW_WIDTH_VAR = '--orb-omph-pv-w'
export const PREVIEW_PREF_VAR = '--orb-omph-pv-pref'

const SPLIT_MIN_CONTAINER_PX = 880
const COMPACT_MAX_CONTAINER_PX = 560
const MIN_TRANSCRIPT_PX = 400
const MIN_PREVIEW_PX = 320
const DEFAULT_PREVIEW_RATIO = 0.45
const MAX_PREVIEW_RATIO = 0.7
const KEYBOARD_STEP_PX = 24

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max))

interface DragState {
  pointerId: number
  startX: number
  startWidth: number
  latest: number
}

export const useOmphPreviewLayout = ({ open, layout }: { open: boolean; layout: OMPHFilePreviewLayout }) => {
  const mainRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [preferred, setPreferred] = useState<number | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [dragging, setDragging] = useState(false)

  useLayoutEffect(() => {
    const element = mainRef.current
    if (!element) return undefined
    const measure = () => setContainerWidth(element.getBoundingClientRect().width)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) setExpanded(false)
  }, [open])

  const splitFits = layout === 'overlay'
    ? false
    : layout === 'split'
      ? containerWidth >= MIN_TRANSCRIPT_PX + MIN_PREVIEW_PX
      : containerWidth >= SPLIT_MIN_CONTAINER_PX
  const placement: 'split' | 'overlay' = splitFits && !expanded ? 'split' : 'overlay'
  const maxWidth = Math.max(MIN_PREVIEW_PX, Math.min(containerWidth * MAX_PREVIEW_RATIO, containerWidth - MIN_TRANSCRIPT_PX))
  const width = clamp(preferred ?? containerWidth * DEFAULT_PREVIEW_RATIO, MIN_PREVIEW_PX, maxWidth)
  const compact = containerWidth > 0 && containerWidth < COMPACT_MAX_CONTAINER_PX

  const writeWidth = useCallback((px: number) => {
    const element = mainRef.current
    if (!element) return
    element.style.setProperty(PREVIEW_PREF_VAR, `${px}px`)
    if (element.dataset.placement === 'split' && element.dataset.open === 'true') {
      element.style.setProperty(PREVIEW_WIDTH_VAR, `${px}px`)
    }
  }, [])

  const onPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startWidth: width, latest: width }
    setDragging(true)
  }, [width])

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    drag.latest = clamp(drag.startWidth + (drag.startX - event.clientX), MIN_PREVIEW_PX, maxWidth)
    writeWidth(drag.latest)
  }, [maxWidth, writeWidth])

  const endDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    setPreferred(drag.latest)
    setDragging(false)
  }, [])

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = {
      ArrowLeft: width + KEYBOARD_STEP_PX,
      ArrowRight: width - KEYBOARD_STEP_PX,
      Home: MIN_PREVIEW_PX,
      End: maxWidth,
    }
    if (!(event.key in steps)) return
    event.preventDefault()
    setPreferred(clamp(steps[event.key], MIN_PREVIEW_PX, maxWidth))
  }, [maxWidth, width])

  return {
    mainRef,
    placement,
    width,
    compact,
    dragging,
    expanded,
    canExpand: splitFits,
    toggleExpanded: () => setExpanded((value) => !value),
    gripProps: {
      role: 'separator' as const,
      'aria-orientation': 'vertical' as const,
      'aria-valuemin': MIN_PREVIEW_PX,
      'aria-valuemax': Math.round(maxWidth),
      'aria-valuenow': Math.round(width),
      tabIndex: 0,
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onKeyDown,
    },
  }
}
