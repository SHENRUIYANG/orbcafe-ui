/**
 * OMPHPanel 正文滚动
 *
 * 内容大纲：
 * - 贴底跟随与离开底部后保持阅读位置
 * - 回到底部
 * - 顶部加载更早轮次时补偿滚动
 * - 轮次轨道的当前轮次
 *
 * 作者：ORBAICODER
 * 版本：1.0.0
 * 日期：2026-10-04
 *
 * 作用：让 OMPHPanel 的正文滚动对齐 Harness 会话面板：读者在底部时跟随新内容，离开后不被拽回。
 *
 * 代码逻辑大纲：
 * 1. 用离底距离判断是否跟随。
 * 2. 内容变高时，只有跟随中才把滚动位置推到底部。
 * 3. 列表头部插入更早轮次时，按高度差补偿，避免阅读位置跳动。
 * 4. 正文溢出且读者滚到顶部时，请求加载更早内容。
 *
 * ChangeLog：
 * - 1.0.0 2026-10-04 初始版本。
 */

'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const FOLLOW_THRESHOLD_PX = 48
const RAIL_MIN_WIDTH_PX = 900

interface TranscriptTurn {
  id: string
}

interface UseOmphTranscriptScrollOptions {
  turns: TranscriptTurn[]
  contentVersion: string
  hasOlder?: boolean
  loadingOlder?: boolean
  onLoadOlder?: () => void
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const useOmphTranscriptScroll = ({
  turns,
  contentVersion,
  hasOlder = false,
  loadingOlder = false,
  onLoadOlder,
}: UseOmphTranscriptScrollOptions) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const followRef = useRef(true)
  const snapshotRef = useRef({ height: 0, top: 0 })
  const firstIdRef = useRef<string | undefined>(undefined)
  const loadLockedRef = useRef(false)
  const [following, setFollowing] = useState(true)
  const [railVisible, setRailVisible] = useState(false)
  const [activeTurnId, setActiveTurnId] = useState<string | undefined>(turns[0]?.id)

  const remember = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    snapshotRef.current = { height: scroller.scrollHeight, top: scroller.scrollTop }
  }, [])

  const updateActiveTurn = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const scrollerTop = scroller.getBoundingClientRect().top
    let current = scroller.querySelector<HTMLElement>('[data-omph-turn]')?.dataset.omphTurn
    scroller.querySelectorAll<HTMLElement>('[data-omph-turn]').forEach((mark) => {
      if (mark.getBoundingClientRect().top - scrollerTop <= FOLLOW_THRESHOLD_PX) {
        current = mark.dataset.omphTurn
      }
    })
    setActiveTurnId(current)
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    const content = contentRef.current
    if (!scroller || !content) return undefined

    const sync = () => {
      setRailVisible(scroller.clientWidth > RAIL_MIN_WIDTH_PX)
      if (followRef.current) scroller.scrollTop = scroller.scrollHeight
      remember()
    }

    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(scroller)
    observer.observe(content)
    return () => observer.disconnect()
  }, [remember])

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const firstId = turns[0]?.id
    const previousFirst = firstIdRef.current
    const prepended = previousFirst !== undefined && firstId !== undefined && firstId !== previousFirst
    firstIdRef.current = firstId

    if (prepended) {
      followRef.current = false
      setFollowing(false)
      const delta = scroller.scrollHeight - snapshotRef.current.height
      scroller.scrollTop = snapshotRef.current.top + Math.max(0, delta)
      remember()
      updateActiveTurn()
      return
    }

    if (followRef.current) scroller.scrollTop = scroller.scrollHeight
    remember()
    updateActiveTurn()
  }, [contentVersion, remember, turns, updateActiveTurn])

  useEffect(() => {
    if (!loadingOlder) loadLockedRef.current = false
  }, [loadingOlder])

  const onScroll = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight
    const nextFollow = distance <= FOLLOW_THRESHOLD_PX
    if (nextFollow !== followRef.current) {
      followRef.current = nextFollow
      setFollowing(nextFollow)
    }
    remember()
    updateActiveTurn()

    const overflow = scroller.scrollHeight - scroller.clientHeight > FOLLOW_THRESHOLD_PX
    const atTop = scroller.scrollTop <= FOLLOW_THRESHOLD_PX
    if (!overflow || !atTop || nextFollow || !hasOlder || loadingOlder || !onLoadOlder || loadLockedRef.current) return
    loadLockedRef.current = true
    onLoadOlder()
  }, [hasOlder, loadingOlder, onLoadOlder, remember, updateActiveTurn])

  const returnToBottom = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    followRef.current = true
    setFollowing(true)
    scroller.scrollTo({
      top: scroller.scrollHeight,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }, [])

  const scrollToTurn = useCallback((turnId: string) => {
    const scroller = scrollerRef.current
    const mark = scroller?.querySelector<HTMLElement>(`[data-omph-turn="${CSS.escape(turnId)}"]`)
    if (!mark) return
    followRef.current = false
    setFollowing(false)
    mark.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [])

  return {
    scrollerRef,
    contentRef,
    following,
    railVisible,
    activeTurnId,
    onScroll,
    returnToBottom,
    scrollToTurn,
  }
}
