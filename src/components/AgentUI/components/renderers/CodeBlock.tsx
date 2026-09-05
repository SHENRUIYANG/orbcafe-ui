'use client'

import React, { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Clipboard, Check } from '@/components/Icons'
import { cn } from '../../lib/utils'
import { useOrbMode } from '../../../../lib/theme'

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
  const mode = useOrbMode()
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

  const style = mode === 'dark' ? oneDark : oneLight

  return (
    <div className={cn("rounded-lg overflow-hidden border border-[var(--orb-border)] my-4", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--orb-surface)] border-b border-[var(--orb-border)]">
        <span className="text-xs font-medium text-[var(--orb-muted)] uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-[var(--orb-hover)] rounded transition-colors"
          disabled={isStreaming}
          title={isCopied ? 'Copied' : 'Copy code'}
        >
          {isCopied ? (
            <Check size={14} className="text-[var(--orb-status-success)]" />
          ) : (
            <Clipboard size={14} className="text-[var(--orb-muted)]" />
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
            backgroundColor: mode === 'dark' ? 'var(--orb-surface-2)' : 'var(--orb-canvas)',
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
