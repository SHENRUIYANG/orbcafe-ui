/**
 * OMPHPanel 文件预览状态
 *
 * 内容大纲：
 * - 打开、关闭、重试
 * - 切换文件时取消上一次读取，忽略过期响应
 * - 同一文件只换行区间时不重新读取
 *
 * 作者：ORBAICODER
 * 版本：1.0.0
 * 日期：2026-10-04
 *
 * 作用：管理预览窗格里“当前是哪个文件、读到了没有”，不关心布局。
 *
 * 代码逻辑大纲：
 * 1. open：同路径且已就绪时只更新行区间；否则发起读取。
 * 2. 每次读取带 AbortController 与递增的请求号，过期或被取消的结果不写入状态。
 * 3. close 取消读取并可把焦点还给触发它的链接。
 *
 * ChangeLog：
 * - 1.0.0 2026-10-04 初始版本。
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { OMPHFilePreviewData, OMPHFilePreviewLoader, OMPHFileRef } from './omph-file-preview-types'

export type OMPHFilePreviewPhase = 'loading' | 'ready' | 'error'

export interface OMPHFilePreviewState {
  open: boolean
  ref: OMPHFileRef | null
  phase: OMPHFilePreviewPhase
  data: OMPHFilePreviewData | null
}

const INITIAL_STATE: OMPHFilePreviewState = { open: false, ref: null, phase: 'loading', data: null }

export const useOmphFilePreview = (loader?: OMPHFilePreviewLoader) => {
  const [state, setState] = useState<OMPHFilePreviewState>(INITIAL_STATE)
  const stateRef = useRef(state)
  stateRef.current = state
  const loaderRef = useRef(loader)
  loaderRef.current = loader
  const controllerRef = useRef<AbortController | null>(null)
  const requestRef = useRef(0)
  const openerRef = useRef<HTMLElement | null>(null)

  const load = useCallback((ref: OMPHFileRef) => {
    const loadFile = loaderRef.current
    if (!loadFile) return
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    requestRef.current += 1
    const requestId = requestRef.current

    setState({ open: true, ref, phase: 'loading', data: null })
    loadFile(ref, controller.signal).then(
      (data) => {
        if (requestId !== requestRef.current) return
        setState((current) => ({ ...current, phase: 'ready', data }))
      },
      () => {
        if (requestId !== requestRef.current || controller.signal.aborted) return
        setState((current) => ({ ...current, phase: 'error', data: null }))
      },
    )
  }, [])

  const open = useCallback((ref: OMPHFileRef, opener?: HTMLElement | null) => {
    openerRef.current = opener ?? null
    const current = stateRef.current
    if (current.ref?.path === ref.path && current.phase === 'ready') {
      setState({ ...current, open: true, ref })
      return
    }
    load(ref)
  }, [load])

  const close = useCallback((restoreFocus = false) => {
    requestRef.current += 1
    controllerRef.current?.abort()
    setState((current) => ({ ...current, open: false }))
    const opener = openerRef.current
    if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true })
  }, [])

  const reload = useCallback(() => {
    const { ref } = stateRef.current
    if (ref) load(ref)
  }, [load])

  useEffect(() => () => {
    controllerRef.current?.abort()
  }, [])

  return { state, open, close, reload }
}
