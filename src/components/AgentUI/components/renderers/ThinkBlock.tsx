'use client'

import React, { useState } from 'react'
import { ChevronDown as ChevronDownIcon, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import styles from '../styles/thinkblock.module.css'

interface ThinkBlockProps {
  content: string
  title?: string
  isStreaming?: boolean
  defaultExpanded?: boolean
  className?: string
}

export const ThinkBlock: React.FC<ThinkBlockProps> = ({
  content,
  title = '思考过程',
  isStreaming = false,
  defaultExpanded = false,
  className = ''
}) => {
  const { theme } = useTheme()
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const isDark = theme === 'dark'
  const textColor = isDark ? 'text-gray-400' : 'text-gray-500'
  const contentColor = isDark ? 'text-gray-300' : 'text-gray-600'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'

  return (
    <div className={`my-3 ${className}`}>
      <div 
        className="flex items-center py-1 cursor-pointer transition-opacity hover:opacity-70" 
        onClick={toggleExpanded}
      >
        <div className={`flex items-center justify-center mr-1.5 ${textColor} transition-transform duration-200`}>
          {isExpanded ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </div>
        <div className={`flex items-center flex-1 text-sm font-normal italic ${textColor}`}>
          <span className="mr-2">{title}</span>
          {isStreaming && (
            <div className="flex items-center gap-0.5">
              <div className={`w-0.5 h-0.5 rounded-full ${isDark ? 'bg-gray-400' : 'bg-gray-500'} ${styles.thinkingPulse}`} style={{ animationDelay: '0s' }}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${isDark ? 'bg-gray-400' : 'bg-gray-500'} ${styles.thinkingPulse}`} style={{ animationDelay: '0.5s' }}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${isDark ? 'bg-gray-400' : 'bg-gray-500'} ${styles.thinkingPulse}`} style={{ animationDelay: '1s' }}></div>
            </div>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className={`py-2 pl-5 ml-2 border-l-2 ${borderColor}`}>
          <div className={`text-sm italic leading-relaxed ${contentColor}`}>
            {content.split('\n').map((line, index) => {
              if (line.trim() === '') {
                return <br key={index} />
              }
              return <p key={index} className="my-1 first:mt-0 last:mb-0">{line}</p>
            })}
            {isStreaming && (
              <span className={`ml-0.5 not-italic ${textColor} ${styles.cursorBlink}`}>|</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ThinkBlock
