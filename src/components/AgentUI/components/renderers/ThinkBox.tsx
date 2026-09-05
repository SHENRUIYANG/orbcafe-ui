'use client'

import React, { useState, useMemo } from 'react'
import { ChevronDown, Lightbulb } from '@/components/Icons'

export interface ThinkBoxProps {
  
  content: string
  
  theme?: 'light' | 'dark'
  
  size?: 'sm' | 'base' | 'lg'
  
  defaultExpanded?: boolean
}

const ThinkBox: React.FC<ThinkBoxProps> = ({
  content,
  theme = 'light',
  size = 'base',
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const contentFontSize = useMemo(() => {
    const baseSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
    return `${baseSize - 2}px`;
  }, [size]);

  return (
    <div 
      className={`my-6 rounded-lg overflow-hidden transition-all duration-200 ${
        theme === 'dark'
          ? 'bg-[var(--orb-surface-2)]'
          : 'bg-[var(--orb-canvas)]'
      }`}
      style={{
        border: '0.5px solid var(--orb-border)'
      }}
    >
      <div 
        className="px-4 py-3 cursor-pointer flex items-center justify-between transition-colors duration-200 bg-[var(--orb-surface)] hover:bg-[var(--orb-hover)]"
        style={{
          borderBottom: '0.5px solid var(--orb-border)'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center">
          <Lightbulb className="mr-2 h-4 w-4" />
          <span
            className="font-medium text-[var(--orb-fg)]"
            style={{
              fontSize: size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px'
            }}
          >思考过程</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          } text-[var(--orb-muted)]`}
        />
      </div>
      
      {isExpanded && (
        <div 
          className="p-4 whitespace-pre-wrap italic font-light text-[var(--orb-muted)]"
          style={{
            fontSize: contentFontSize,
            lineHeight: '1.3 !important',
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}

export default ThinkBox
