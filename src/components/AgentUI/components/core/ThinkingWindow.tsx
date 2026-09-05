'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, RefreshCw } from '@/components/Icons'
import { CButton } from '@/components/Atoms/CButton'
import { CTextArea as Textarea } from '@/components/Atoms/CTextArea'
import { cn } from '@/lib/utils'

export interface InterruptState {
  original: string;
  proposed: string;
  explanation: string;
}

interface ThinkingWindowProps {
  isStreaming: boolean
  isThinkingOpen: boolean
  streamingContent: string
  onCloseThinking: () => void
  isWaitingForInput?: boolean
  interruptState?: InterruptState | null
  onInterruptResponse?: (response: string) => void
}

export function ThinkingWindow({
  isStreaming,
  isThinkingOpen,
  streamingContent,
  onCloseThinking,
  isWaitingForInput,
  interruptState,
  onInterruptResponse
}: ThinkingWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [customInput, setCustomInput] = useState('')
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [streamingContent])

  useEffect(() => {
    if (interruptState) {
        setCustomInput(interruptState.proposed)
        setEditMode(false)
    }
  }, [interruptState])

  useEffect(() => {
    if (!isStreaming && !isWaitingForInput && isThinkingOpen && onCloseThinking) {
      const timer = setTimeout(() => {
        onCloseThinking()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isStreaming, isThinkingOpen, onCloseThinking, isWaitingForInput])

  const activeNodeMatch = streamingContent?.match(/Active Node:\s*(\w+)/g)
  const lastActiveNode = activeNodeMatch ? activeNodeMatch[activeNodeMatch.length - 1].replace('Active Node: ', '') : null

  const handleConfirmProposed = () => {
    if (onInterruptResponse && interruptState) {
        onInterruptResponse(interruptState.proposed)
    }
  }

  const handleUseOriginal = () => {
    if (onInterruptResponse && interruptState) {
        onInterruptResponse(interruptState.original)
    }
  }

  const handleSubmitCustom = () => {
    if (onInterruptResponse && customInput.trim()) {
        onInterruptResponse(customInput)
    }
  }

  return (
    <AnimatePresence>
      {isThinkingOpen && (
        <motion.div
          layout
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 w-auto min-w-[600px] max-w-[1000px] max-h-[85vh] flex flex-col z-[200]"
        >
          <div className={cn(
            "absolute -inset-4 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-3xl opacity-0 transition-opacity duration-500 blur-xl",
            isStreaming && "opacity-40 animate-pulse"
          )} />
          <div className={cn(
            "absolute -inset-[2px] bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-2xl opacity-0 transition-opacity duration-500",
            isStreaming && "opacity-100 animate-pulse"
          )} />

          <div className={cn(
            "relative w-full bg-[color-mix(in_oklch,var(--orb-canvas)_95%,transparent)] dark:bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col",
            !isStreaming && "border border-[color-mix(in_oklch,var(--orb-border)_50%,transparent)] ring-1 ring-black/5 dark:ring-white/10"
          )}>
            <div className="flex-none flex items-center justify-between px-4 pt-4 mb-2 border-b border-[var(--orb-border)] pb-2 z-10">
            <div className="flex items-center gap-2 text-sm font-semibold">
              {isWaitingForInput ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-[var(--orb-accent)] animate-pulse" />
                  <span className="text-[var(--orb-accent)]">Waiting for Confirmation...</span>
                </>
              ) : isStreaming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--orb-status-primary)]" />
                  <span className="text-[var(--orb-status-primary)]">AI Reasoning & Coding...</span>
                  {lastActiveNode && (
                    <span className="ml-2 px-2 py-0.5 bg-[var(--orb-p100)] text-[var(--orb-status-primary)] text-xs rounded-full uppercase tracking-wider border border-[var(--orb-p200)] font-bold">
                       {lastActiveNode}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-[var(--orb-status-success)]" />
                  <span className="text-[var(--orb-status-success)]">Completed</span>
                </>
              )}
            </div>
            {!isStreaming && onCloseThinking && (
              <CButton
                variant="outlined"
                size="small"
                onClick={onCloseThinking}
                className="h-6 text-xs text-[var(--orb-muted)] hover:text-[var(--orb-fg)] dark:text-[var(--orb-muted)] dark:hover:text-[var(--orb-fg)]"
              >
                Close
              </CButton>
            )}
          </div>

          <div
            ref={scrollRef}
            className={cn(
                "flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 transition-all duration-300",
                isWaitingForInput && interruptState ? "h-[200px]" : "h-[400px]"
            )}
          >
            <pre className="text-xs font-serif whitespace-pre-wrap text-[var(--orb-fg)] leading-relaxed font-[Times_New_Roman]">
              {streamingContent || 'Waiting for response...'}
            </pre>
          </div>

          <AnimatePresence>
            {isWaitingForInput && interruptState && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-[var(--orb-border)] bg-[color-mix(in_oklch,var(--orb-surface)_50%,transparent)] p-4"
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3 bg-[var(--orb-p50)] p-3 rounded-lg border border-[var(--orb-p100)]">
                             <div className="mt-0.5 text-[var(--orb-status-primary)]">
                                 <RefreshCw className="w-5 h-5" />
                             </div>
                             <div className="flex-1 space-y-1">
                                 <p className="text-sm font-medium text-[var(--orb-p700)]">
                                     Refinement Proposed
                                 </p>
                                 <p className="text-xs text-[var(--orb-status-primary)] leading-relaxed">
                                     {interruptState.explanation}
                                 </p>
                             </div>
                        </div>

                        {!editMode ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg border border-[var(--orb-border)] bg-[var(--orb-canvas)] dark:bg-black opacity-60 hover:opacity-100 transition-opacity flex flex-col">
                                    <p className="text-xs font-semibold text-[var(--orb-muted)] mb-1 uppercase tracking-wider">Original Request</p>
                                    <div className="flex-1 max-h-[200px] overflow-y-auto mb-2 scrollbar-thin scrollbar-thumb-[var(--orb-border)]">
                                        <p className="text-sm text-[var(--orb-fg)] whitespace-pre-wrap">{interruptState.original}</p>
                                    </div>
                                    <CButton variant="outlined" size="small" className="w-full text-xs h-7 border border-[var(--orb-border)]" onClick={handleUseOriginal}>Use Original</CButton>
                                </div>
                                <div className="p-3 rounded-lg border border-[color-mix(in_oklch,var(--orb-status-success)_30%,transparent)] bg-[color-mix(in_oklch,var(--orb-status-success)_5%,transparent)] ring-1 ring-[color-mix(in_oklch,var(--orb-status-success)_20%,transparent)] flex flex-col">
                                    <p className="text-xs font-semibold text-[var(--orb-status-success)] mb-1 uppercase tracking-wider">Refined Request</p>
                                    <div className="flex-1 max-h-[200px] overflow-y-auto mb-2 scrollbar-thin scrollbar-thumb-[color-mix(in_oklch,var(--orb-status-success)_30%,transparent)]">
                                        <p className="text-sm text-[var(--orb-fg)] whitespace-pre-wrap">{interruptState.proposed}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <CButton variant="outlined" size="small" className="flex-1 text-xs h-7 border-[color-mix(in_oklch,var(--orb-status-success)_30%,transparent)] text-[var(--orb-status-success)] hover:bg-[color-mix(in_oklch,var(--orb-status-success)_14%,transparent)]" onClick={() => setEditMode(true)}>
                                            Edit
                                        </CButton>
                                        <CButton size="small" className="flex-[2] text-xs h-7 bg-[var(--orb-status-success)] hover:opacity-90 text-[var(--orb-on-primary)]" onClick={handleConfirmProposed}>
                                            Confirm
                                        </CButton>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-[var(--orb-muted)] uppercase tracking-wider">Edit Request</p>
                                <Textarea
                                    value={customInput}
                                    onChange={(e: any) => setCustomInput(e.target.value)}
                                    className="text-sm min-h-[100px] resize-none"
                                    placeholder="Enter your instructions..."
                                />
                                <div className="flex justify-end gap-2">
                                    <CButton variant="outlined" size="small" onClick={() => setEditMode(false)}>Cancel</CButton>
                                    <CButton size="small" onClick={handleSubmitCustom}>Submit</CButton>
                                </div>
                            </div>
                        )}

                        {!editMode && (
                             <div className="flex justify-center">
                                 <CButton variant="text" size="small" className="text-xs text-[var(--orb-muted)]" onClick={() => setEditMode(true)}>
                                     I want to edit the request manually
                                 </CButton>
                             </div>
                        )}
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
