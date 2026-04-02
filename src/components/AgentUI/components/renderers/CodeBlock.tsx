'use client'

import React, { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from 'next-themes'
import { Clipboard, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface CodeBlockProps {
  content: string
  language?: string
  isStreaming?: boolean
  className?: string
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  content,
  language = 'text',
  isStreaming = false,
  className = ''
}) => {
  const { theme } = useTheme()
  const [isCopied, setIsCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const style = theme === 'dark' ? oneDark : oneLight

  return (
    <div className={cn("rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 my-4", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          disabled={isStreaming}
          title={isCopied ? 'Copied' : 'Copy code'}
        >
          {isCopied ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Clipboard size={14} className="text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>
      
      <div className="text-sm">
        <SyntaxHighlighter
          language={language}
          style={style}
          customStyle={{
            margin: 0,
            padding: '16px',
            fontSize: '14px',
            lineHeight: '1.5',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', 
          }}
          wrapLongLines={true}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

export default CodeBlock
