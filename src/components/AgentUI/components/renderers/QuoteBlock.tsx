'use client'

import React from 'react'
import type { QuoteBlockProps } from '../cardTypes'

const QuoteBlock: React.FC<QuoteBlockProps> = ({
  content,
  author,
  source,
  type = 'quote',
  isLoading = false,
  className = '',
  style
}) => {
  
  const cleanContent = content.replace(/^>\s?/gm, '').trim()

  const handleCopy = async () => {
    try {
      let copyText = cleanContent
      if (author) copyText += `\n\n— ${author}`
      if (source) copyText += ` (${source})`
      
      await navigator.clipboard.writeText(copyText)
      
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const getTypeConfig = () => {
    switch (type) {
      case 'cite':
        return {
          borderColor: 'border-l-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/10',
          iconColor: 'text-green-500',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ),
          label: '引用'
        }
      case 'reference':
        return {
          borderColor: 'border-l-purple-500',
          bgColor: 'bg-purple-50 dark:bg-purple-900/10',
          iconColor: 'text-purple-500',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: '参考'
        }
      default: 
        return {
          borderColor: 'border-l-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/10',
          iconColor: 'text-blue-500',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2a2 2 0 002 2h1V9zm0 0V7a2 2 0 012-2h1v2H8a1 1 0 00-1 1zm6 0h2v2a2 2 0 01-2 2h-1V9zm0 0V7a2 2 0 00-2-2h-1v2h2a1 1 0 011 1z" clipRule="evenodd" />
            </svg>
          ),
          label: '引用'
        }
    }
  }

  const typeConfig = getTypeConfig()

  if (isLoading) {
    return (
      <div className={`quote-block loading ${className}`} style={style}>
        <div className="animate-pulse border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-4 rounded-r-lg">
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`quote-block ${className}`} style={style}>
      <div className={`border-l-4 ${typeConfig.borderColor} ${typeConfig.bgColor} rounded-r-lg`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className={typeConfig.iconColor}>
              {typeConfig.icon}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {typeConfig.label}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors"
            title="复制引用"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-4">
          <blockquote className="text-gray-700 dark:text-gray-300 leading-relaxed">
            <div className="flex items-start space-x-2">
              <svg className="w-8 h-6 text-gray-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.828 7.172c1.173-1.172 1.172-3.071 0-4.243-1.172-1.172-3.071-1.172-4.243 0L6.343 7.172A4 4 0 008 14h2v6a2 2 0 002 2h4a2 2 0 002-2v-6h2a4 4 0 001.657-6.828L14.828 7.172z" />
              </svg>
              <div className="flex-1 min-w-0">
                {cleanContent.split('\n\n').map((paragraph, index) => (
                  <p key={index} className={`${index > 0 ? 'mt-4' : ''} whitespace-pre-wrap`}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </blockquote>

          {(author || source) && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                {author && (
                  <span className="font-medium">— {author}</span>
                )}
                {author && source && (
                  <span className="mx-2">•</span>
                )}
                {source && (
                  <span className="italic">{source}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={`h-1 ${typeConfig.borderColor.replace('border-l-', 'bg-')} opacity-20`}></div>
      </div>
    </div>
  )
}

export default QuoteBlock