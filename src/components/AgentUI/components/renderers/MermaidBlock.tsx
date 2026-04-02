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
    const renderMermaid = async () => {
      if (!content.trim() || !containerRef.current) return
      
      setIsRendering(true)
      setError(null)
      
      try {
        
        mermaid.initialize({
          startOnLoad: false,
          theme: currentTheme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit'
        })

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

        const graphDefinition = content.replace(/```mermaid\n?|\n?```/g, '').trim()

        const { svg } = await mermaid.render(id, graphDefinition)
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
        
      } catch (err) {
        console.error('Mermaid render failed:', err)
        setError(err instanceof Error ? err.message : 'Render failed')
        
        if (containerRef.current) {
            containerRef.current.innerText = content
        }
      } finally {
        setIsRendering(false)
      }
    }

    const timer = setTimeout(() => {
        renderMermaid()
    }, 100)

    return () => clearTimeout(timer)
  }, [content, currentTheme])

  if (isLoading || isRendering) {
      return (
          <div className={`mermaid-block loading ${className}`} style={style}>
              <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-500">Generating Diagram...</span>
              </div>
          </div>
      )
  }

  if (error) {
      return (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm overflow-auto">
              <p className="font-semibold mb-2">Mermaid Error:</p>
              <pre>{error}</pre>
              <pre className="mt-4 text-xs text-gray-500">{content}</pre>
          </div>
      )
  }

  return (
    <div 
        className={`mermaid-block overflow-x-auto ${className}`} 
        style={style}
        ref={containerRef}
    />
  )
}

export default MermaidBlock
