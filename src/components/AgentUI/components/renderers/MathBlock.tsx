'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { MathBlockProps } from '../cardTypes'

const MathBlock: React.FC<MathBlockProps> = ({
  content,
  isLoading = false,
  displayMode = true,
  className = '',
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRendering, setIsRendering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)

  useEffect(() => {
    
    const renderMath = async () => {
      if (!content.trim() || !containerRef.current) return
      
      setIsRendering(true)
      setError(null)
      
      try {
        
        console.log('MathBlock: 待实现KaTeX渲染，内容:', content)

      } catch (err) {
        console.error('KaTeX渲染失败:', err)
        setError(err instanceof Error ? err.message : 'KaTeX渲染失败')
      } finally {
        setIsRendering(false)
      }
    }

    renderMath()
  }, [content, displayMode])

  const handleCopy = async () => {
    try {
      const mathContent = content
        .replace(/\$\$\n?|\n?\$\$/g, '')
        .replace(/\$|\$/g, '')
        .trim()
      await navigator.clipboard.writeText(mathContent)
      
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const cleanMathContent = content
    .replace(/\$\$\n?|\n?\$\$/g, '')
    .replace(/\$|\$/g, '')
    .trim()

  if (isLoading || isRendering) {
    return (
      <div className={`math-block loading ${className}`} style={style}>
        <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">正在渲染公式...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`math-block error ${className}`} style={style}>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h4 className="text-red-800 dark:text-red-400 font-medium">数学公式渲染错误</h4>
            </div>
          </div>
          <p className="text-red-700 dark:text-red-300 text-sm mb-3">{error}</p>
          <div className="text-sm">
            <p className="text-red-600 dark:text-red-400 mb-2">原始LaTeX代码：</p>
            <pre className="p-2 bg-red-100 dark:bg-red-900/40 rounded text-red-800 dark:text-red-200 text-xs overflow-x-auto">
              {cleanMathContent}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`math-block placeholder ${displayMode ? 'display-mode' : 'inline-mode'} ${className}`} style={style}>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            数学公式 ({displayMode ? '块级' : '行内'})
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded">
              待实现
            </div>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {showRaw ? '预览' : 'LaTeX'}
            </button>
            <button
              onClick={handleCopy}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              复制
            </button>
          </div>
        </div>

        <div className="p-4">
          {showRaw ? (
            
            <pre className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded border overflow-x-auto">
              {cleanMathContent}
            </pre>
          ) : (
            
            <div className="text-center">
              <div 
                ref={containerRef}
                className={`math-content ${displayMode ? 'text-lg' : 'text-base'}`}
              >
                <div className="text-gray-500 dark:text-gray-400 mb-3">
                  <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                  <p className="text-sm">KaTeX数学公式渲染功能开发中...</p>
                </div>
                <div className="font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-3 rounded inline-block">
                  {cleanMathContent}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* TODO: 引入KaTeX CSS */
        .math-block .katex {
          font-size: inherit;
        }
        .math-block.display-mode .katex {
          display: block;
          text-align: center;
        }
        .math-block.inline-mode .katex {
          display: inline;
        }
      `}</style>
    </div>
  )
}

export default MathBlock