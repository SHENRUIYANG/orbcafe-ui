'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import mermaid from 'mermaid'

export interface MermaidBlockProps {
  content: string
  isLoading?: boolean
  chartType?: string
  theme?: string
  className?: string
  style?: React.CSSProperties
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
  const { theme: currentTheme } = useTheme()

  useEffect(() => {
    let cancelled = false

    const renderMermaid = async () => {
      if (!content.trim() || !containerRef.current) return
      
      setIsRendering(true)
      setError(null)
      
      try {
        
        mermaid.initialize({
          startOnLoad: false,
          theme: currentTheme === 'dark' ? 'dark' : 'default',
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
  }, [content, currentTheme])

  return (
    <div className={`mermaid-block ${className}`} style={style}>
      {(isLoading || isRendering) && (
        <div className="flex items-center justify-center rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-blue-500" />
          <span className="text-sm text-gray-500">Generating Diagram...</span>
        </div>
      )}

      {error && (
        <div className="overflow-auto rounded border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <p className="mb-2 font-semibold">Mermaid Error:</p>
          <pre>{error}</pre>
          <pre className="mt-4 text-xs text-gray-500">{content}</pre>
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
