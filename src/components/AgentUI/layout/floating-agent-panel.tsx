'use client'

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AgentPanel, type AgentPanelProps } from './agent-panel'
import { cn } from '../lib/utils'

export type FloatingAgentPanelAnchor = 'left' | 'center' | 'right'

interface FloatingAgentPanelDragState {
  pointerId: number
  startClientX: number
  startX: number
  currentX: number
  captureElement: HTMLElement
}

export interface FloatingAgentPanelProps extends AgentPanelProps {
  anchor?: FloatingAgentPanelAnchor
  defaultAnchor?: FloatingAgentPanelAnchor
  onAnchorChange?: (anchor: FloatingAgentPanelAnchor) => void
  width?: number | string
  top?: number | string
  bottom?: number | string
  inset?: number
  zIndex?: number
  shellClassName?: string
  shellStyle?: React.CSSProperties
}

const DEFAULT_PANEL_WIDTH = 520
const DEFAULT_PANEL_TOP = 88
const DEFAULT_PANEL_BOTTOM = 88
const DEFAULT_PANEL_INSET = 24
const MOBILE_BREAKPOINT = 640

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max))

const toCssLength = (value: number | string | undefined) =>
  typeof value === 'number' ? `${value}px` : value

const shouldIgnoreDrag = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest('button,input,a,textarea,select,[role="button"],[contenteditable="true"]'))
}

export const FloatingAgentPanel: React.FC<FloatingAgentPanelProps> = ({
  anchor,
  defaultAnchor = 'right',
  onAnchorChange,
  width = DEFAULT_PANEL_WIDTH,
  top = DEFAULT_PANEL_TOP,
  bottom = DEFAULT_PANEL_BOTTOM,
  inset = DEFAULT_PANEL_INSET,
  zIndex = 1300,
  shellClassName,
  shellStyle,
  className,
  onHeaderPointerDown,
  ...agentPanelProps
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef<FloatingAgentPanelDragState | null>(null)
  const [internalAnchor, setInternalAnchor] = useState<FloatingAgentPanelAnchor>(defaultAnchor)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [panelWidth, setPanelWidth] = useState(
    typeof width === 'number' ? width : DEFAULT_PANEL_WIDTH,
  )
  const [positionX, setPositionX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const resolvedAnchor = anchor ?? internalAnchor

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth)
    updateViewportWidth()
    window.addEventListener('resize', updateViewportWidth)
    return () => window.removeEventListener('resize', updateViewportWidth)
  }, [])

  useLayoutEffect(() => {
    const updatePanelWidth = () => {
      const rect = panelRef.current?.getBoundingClientRect()
      if (rect?.width) {
        setPanelWidth(rect.width)
      } else if (typeof width === 'number') {
        setPanelWidth(width)
      }
    }

    updatePanelWidth()
    if (!panelRef.current || typeof ResizeObserver === 'undefined') return undefined

    const observer = new ResizeObserver(updatePanelWidth)
    observer.observe(panelRef.current)
    return () => observer.disconnect()
  }, [width])

  const getAnchorX = useCallback(
    (nextAnchor: FloatingAgentPanelAnchor) => {
      if (!viewportWidth) return inset

      const effectiveInset = viewportWidth < MOBILE_BREAKPOINT ? 12 : inset
      const maxX = Math.max(effectiveInset, viewportWidth - panelWidth - effectiveInset)

      if (viewportWidth < MOBILE_BREAKPOINT) return effectiveInset
      if (nextAnchor === 'left') return effectiveInset
      if (nextAnchor === 'center') return clampNumber((viewportWidth - panelWidth) / 2, effectiveInset, maxX)
      return maxX
    },
    [inset, panelWidth, viewportWidth],
  )

  const snapXToAnchor = useCallback(
    (x: number): FloatingAgentPanelAnchor => {
      const candidates: FloatingAgentPanelAnchor[] = ['left', 'center', 'right']
      return candidates.reduce((best, candidate) => {
        const bestDistance = Math.abs(x - getAnchorX(best))
        const candidateDistance = Math.abs(x - getAnchorX(candidate))
        return candidateDistance < bestDistance ? candidate : best
      }, 'right' as FloatingAgentPanelAnchor)
    },
    [getAnchorX],
  )

  const setResolvedAnchor = useCallback(
    (nextAnchor: FloatingAgentPanelAnchor) => {
      if (anchor === undefined) {
        setInternalAnchor(nextAnchor)
      }
      onAnchorChange?.(nextAnchor)
    },
    [anchor, onAnchorChange],
  )

  useEffect(() => {
    if (isDragging) return
    setPositionX(getAnchorX(resolvedAnchor))
  }, [getAnchorX, isDragging, resolvedAnchor])

  const handleHeaderPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      onHeaderPointerDown?.(event)
      if (event.defaultPrevented || shouldIgnoreDrag(event.target)) return

      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)

      dragStateRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startX: positionX,
        currentX: positionX,
        captureElement: event.currentTarget,
      }
      setIsDragging(true)
    },
    [onHeaderPointerDown, positionX],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) return

      const effectiveInset = viewportWidth < MOBILE_BREAKPOINT ? 12 : inset
      const maxX = Math.max(effectiveInset, viewportWidth - panelWidth - effectiveInset)
      const nextX = clampNumber(dragState.startX + event.clientX - dragState.startClientX, effectiveInset, maxX)

      dragState.currentX = nextX
      setPositionX(nextX)
    },
    [inset, panelWidth, viewportWidth],
  )

  const finishDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) return

      try {
        dragState.captureElement.releasePointerCapture(event.pointerId)
      } catch {
        // Pointer capture may already be released.
      }

      const nextAnchor = snapXToAnchor(dragState.currentX)
      dragStateRef.current = null
      setIsDragging(false)
      setResolvedAnchor(nextAnchor)
      setPositionX(getAnchorX(nextAnchor))
    },
    [getAnchorX, setResolvedAnchor, snapXToAnchor],
  )

  const shellPositionStyle = useMemo<React.CSSProperties>(() => ({
    position: 'fixed',
    top: toCssLength(top),
    bottom: toCssLength(bottom),
    left: positionX,
    width: toCssLength(width),
    maxWidth: `calc(100vw - ${(viewportWidth < MOBILE_BREAKPOINT ? 24 : inset * 2)}px)`,
    zIndex,
    pointerEvents: 'auto',
    transition: isDragging ? 'none' : 'left 180ms ease-out',
    touchAction: 'none',
    ...shellStyle,
  }), [bottom, inset, isDragging, positionX, shellStyle, top, viewportWidth, width, zIndex])

  return (
    <div
      ref={panelRef}
      className={cn('orbcafe-floating-agent-panel min-w-0', shellClassName)}
      data-anchor={resolvedAnchor}
      data-dragging={isDragging ? 'true' : 'false'}
      style={shellPositionStyle}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
    >
      <AgentPanel
        {...agentPanelProps}
        className={className}
        onHeaderPointerDown={handleHeaderPointerDown}
      />
    </div>
  )
}

export default FloatingAgentPanel
