'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { useOrbMode } from '../../../../lib/theme'

export interface MermaidBlockProps {
  content: string
  isLoading?: boolean
  chartType?: string
  theme?: string
  className?: string
  style?: React.CSSProperties
}

/** 从 mermaid 报错里提一行人话摘要；长错误与源码折叠在详情里 */
const summarizeMermaidError = (message: string): string => {
  const line = /line (\d+)/i.exec(message)?.[1]
  return line
    ? `Mermaid syntax error around line ${line} — expand for details`
    : 'Mermaid syntax error — expand for details'
}

const MermaidBlock: React.FC<MermaidBlockProps> = ({
  content,
  isLoading,
  className = '',
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRendering, setIsRendering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentMode = useOrbMode()

  useEffect(() => {
    let cancelled = false

    const renderMermaid = async () => {
      if (!content.trim() || !containerRef.current) return
      
      setIsRendering(true)
      setError(null)
      
      try {
        
        mermaid.initialize({
          startOnLoad: false,
          theme: currentMode === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
          flowchart: { htmlLabels: false }
        })

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

        const graphDefinition = content.replace(/```mermaid\n?|\n?```/g, '').trim()

        const { svg, bindFunctions } = await mermaid.render(id, graphDefinition)
        
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
          bindFunctions?.(containerRef.current)
        }
        
      } catch (err) {
        if (cancelled) return
        console.error('Mermaid render failed:', err)
        setError(err instanceof Error ? err.message : 'Render failed')
      } finally {
        if (!cancelled) setIsRendering(false)
      }
    }

    const timer = setTimeout(() => {
        renderMermaid()
    }, 100)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [content, currentMode])

  return (
    <div className={`mermaid-block ${className}`} style={style}>
      {(isLoading || isRendering) && (
        <div className="flex items-center justify-center rounded border border-[var(--orb-border)] bg-[var(--orb-surface)] p-4 dark:bg-[var(--orb-surface-2)]">
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-[var(--orb-primary)]" />
          <span className="text-sm text-[var(--orb-muted)]">Generating Diagram...</span>
        </div>
      )}

      {error && (
        <div className="rounded border border-[color-mix(in_oklch,var(--orb-status-error)_30%,transparent)] bg-[color-mix(in_oklch,var(--orb-status-error)_8%,transparent)] p-3 text-sm text-[var(--orb-status-error)]">
          <p className="font-medium">{summarizeMermaidError(error)}</p>
          <details className="mt-1">
            <summary className="cursor-pointer text-xs text-[var(--orb-muted)]">Details &amp; source</summary>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words">{error}</pre>
            <pre className="mt-2 max-h-40 overflow-auto text-xs text-[var(--orb-muted)]">{content}</pre>
          </details>
        </div>
      )}

      <div
        ref={containerRef}
        className={`overflow-x-auto ${isLoading || isRendering || error ? 'hidden' : ''}`}
      />
    </div>
  )
}

export default MermaidBlock
