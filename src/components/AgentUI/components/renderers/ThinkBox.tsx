'use client'

import React, { useState, useMemo } from 'react'

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
          ? 'bg-gray-800' 
          : 'bg-white'
      }`}
      style={{
        border: `0.5px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`
      }}
    >
      <div 
        className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors duration-200 ${
          theme === 'dark'
            ? 'bg-gray-700 hover:bg-gray-650'
            : 'bg-gray-50 hover:bg-gray-100'
        }`}
        style={{
          borderBottom: `0.5px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center">
          <span className="mr-2">🤔</span>
          <span 
            className={`font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
            style={{
              fontSize: size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px'
            }}
          >思考过程</span>
        </span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          } ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isExpanded && (
        <div 
          className={`p-4 whitespace-pre-wrap italic font-light ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
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