'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, RefreshCw } from 'lucide-react'
import { CButton as Button } from '@/components/Atoms/CButton'
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
            "relative w-full bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col",
            !isStreaming && "border border-gray-200/50 dark:border-gray-700/50 ring-1 ring-black/5 dark:ring-white/10"
          )}>
            <div className="flex-none flex items-center justify-between px-4 pt-4 mb-2 border-b border-gray-100 dark:border-gray-800 pb-2 z-10">
            <div className="flex items-center gap-2 text-sm font-semibold">
              {isWaitingForInput ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-orange-600 dark:text-orange-400">Waiting for Confirmation...</span>
                </>
              ) : isStreaming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-600 dark:text-blue-400">AI Reasoning & Coding...</span>
                  {lastActiveNode && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full uppercase tracking-wider border border-blue-200 dark:border-blue-800 font-bold">
                       {lastActiveNode}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-600 dark:text-green-400">Completed</span>
                </>
              )}
            </div>
            {!isStreaming && onCloseThinking && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={onCloseThinking}
                className="h-6 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                Close
              </Button>
            )}
          </div>
          
          <div 
            ref={scrollRef}
            className={cn(
                "flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 transition-all duration-300",
                isWaitingForInput && interruptState ? "h-[200px]" : "h-[400px]"
            )}
          >
            <pre className="text-xs font-serif whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed font-[Times_New_Roman]">
              {streamingContent || 'Waiting for response...'}
            </pre>
          </div>

          <AnimatePresence>
            {isWaitingForInput && interruptState && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4"
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                             <div className="mt-0.5 text-blue-600 dark:text-blue-400">
                                 <RefreshCw className="w-5 h-5" />
                             </div>
                             <div className="flex-1 space-y-1">
                                 <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                     Refinement Proposed
                                 </p>
                                 <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                     {interruptState.explanation}
                                 </p>
                             </div>
                        </div>

                        {!editMode ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black opacity-60 hover:opacity-100 transition-opacity flex flex-col">
                                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Original Request</p>
                                    <div className="flex-1 max-h-[200px] overflow-y-auto mb-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{interruptState.original}</p>
                                    </div>
                                    <Button variant="outlined" size="small" className="w-full text-xs h-7 border border-gray-200 dark:border-gray-800" onClick={handleUseOriginal}>Use Original</Button>
                                </div>
                                <div className="p-3 rounded-lg border border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-900/10 ring-1 ring-green-500/20 flex flex-col">
                                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1 uppercase tracking-wider">Refined Request</p>
                                    <div className="flex-1 max-h-[200px] overflow-y-auto mb-2 scrollbar-thin scrollbar-thumb-green-200 dark:scrollbar-thumb-green-900">
                                        <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{interruptState.proposed}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outlined" size="small" className="flex-1 text-xs h-7 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30" onClick={() => setEditMode(true)}>
                                            Edit
                                        </Button>
                                        <Button size="small" className="flex-[2] text-xs h-7 bg-green-600 hover:bg-green-700 text-white" onClick={handleConfirmProposed}>
                                            Confirm
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Edit Request</p>
                                <Textarea 
                                    value={customInput}
                                    onChange={(e: any) => setCustomInput(e.target.value)}
                                    className="text-sm min-h-[100px] resize-none"
                                    placeholder="Enter your instructions..."
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="outlined" size="small" onClick={() => setEditMode(false)}>Cancel</Button>
                                    <Button size="small" onClick={handleSubmitCustom}>Submit</Button>
                                </div>
                            </div>
                        )}

                        {!editMode && (
                             <div className="flex justify-center">
                                 <Button variant="text" size="small" className="text-xs text-gray-500" onClick={() => setEditMode(true)}>
                                     I want to edit the request manually
                                 </Button>
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
