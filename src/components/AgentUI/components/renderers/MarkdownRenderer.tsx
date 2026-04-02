'use client'

import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import type { Components } from 'react-markdown'
import { cn } from '../../lib/utils'
import ThinkBox from './ThinkBox'
import CodeBlock from './CodeBlock'
import MermaidBlock from './MermaidBlock'
import ErrorCard from '../cards/ErrorCard'
import WarningCard from '../cards/WarningCard'
import SuggestionsCard from '../cards/SuggestionsCard'
import ToolResultCard from '../cards/ToolResultCard'
import TableCard from '../cards/TableCard'
import ChartCard from '../cards/ChartCard'
import SAPCard from '../cards/SAPCard'
import { parseCardPayload } from '../utils/cardParsing'
import type { AgentUICardAction, AgentUICardHooks, AgentUICardType } from '../cardTypes'

export interface MarkdownRendererProps {
  
  content: string
  
  theme?: 'light' | 'dark'
  
  size?: 'sm' | 'base' | 'lg'
  
  className?: string
  
  enableCodeHighlight?: boolean
  
  enableMath?: boolean
  
  enableMermaid?: boolean
  
  enableCodeCopy?: boolean
  messageId?: string
  cardHooks?: AgentUICardHooks
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  theme: propTheme,
  size = 'base',
  className,
  enableCodeHighlight = true,
  enableMermaid = true,
  messageId,
  cardHooks
}) => {
  
  const processedContent = useMemo(() => {
    if (!content) return ''
    return content.replace(
      /<think>([\s\S]*?)<\/think>/g,
      (_, thinkContent) => {
        const encodedContent = encodeURIComponent(thinkContent.trim())
        return `<div data-component="thinkbox" data-think-content="${encodedContent}"></div>`
      }
    )
  }, [content])

  const emitCardEvent = (
    cardType: AgentUICardType,
    action: AgentUICardAction,
    title?: string,
    payload?: unknown,
    rawData?: unknown
  ) => {
    cardHooks?.onCardEvent?.({
      messageId,
      cardType,
      action,
      title,
      payload,
      rawData
    })
  }

  const createHookedHandler = (
    cardType: AgentUICardType,
    action: AgentUICardAction,
    title: string | undefined,
    rawData: any,
    originalHandler?: (...args: any[]) => unknown,
    payloadFactory?: (...args: any[]) => unknown
  ) => {
    if (!originalHandler && !cardHooks?.onCardEvent) return undefined
    return (...args: any[]) => {
      const result = originalHandler?.(...args)
      const payload = payloadFactory ? payloadFactory(...args) : undefined
      emitCardEvent(cardType, action, title, payload, rawData)
      return result
    }
  }

  const components: Components = useMemo(() => ({
    
    div(props: any) {
      const { 'data-component': dataComponent, 'data-think-content': thinkContent, ...rest } = props
      if (dataComponent === 'thinkbox' && thinkContent) {
        return (
          <ThinkBox
            content={decodeURIComponent(thinkContent)}
            theme={propTheme}
            size={size}
            defaultExpanded={false}
          />
        )
      }
      
      return <div {...rest} />
    },
    table({ children }: any) {
      return (
        <div className="my-4 w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            {children}
          </table>
        </div>
      )
    },
    thead({ children }: any) {
      return (
        <thead className="bg-gray-50 dark:bg-gray-900/60">
          {children}
        </thead>
      )
    },
    tbody({ children }: any) {
      return (
        <tbody className="bg-white dark:bg-gray-950">
          {children}
        </tbody>
      )
    },
    tr({ children }: any) {
      return (
        <tr className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
          {children}
        </tr>
      )
    },
    th({ children, align }: any) {
      const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
      return (
        <th className={`px-3 py-2 font-semibold text-gray-800 dark:text-gray-100 ${alignClass}`}>
          {children}
        </th>
      )
    },
    td({ children, align }: any) {
      const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
      return (
        <td className={`px-3 py-2 text-gray-700 dark:text-gray-200 align-top ${alignClass}`}>
          {children}
        </td>
      )
    },

    code({ inline, className: codeClassName, children, ...props }: any) {
      const match = /language-([\w-]+)/.exec(codeClassName || '')
      const language = match ? match[1] : ''
      if (inline) {
        return (
          <code
            className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-red-600 dark:text-red-400"
            {...props}
          >
            {children}
          </code>
        )
      }

      const codeContent = String(children).replace(/\n$/, '')

      if (enableMermaid && language === 'mermaid') {
        return (
          <MermaidBlock content={codeContent} />
        )
      }

      if (language === 'json') {
        const cardData = parseCardPayload(codeContent)
        if (cardData) {
          switch (cardData.type) {
            case 'table':
              return <TableCard data={cardData.data} />
            case 'bar-chart-card':
            case 'line-chart-card':
            case 'pie-chart-card':
            case 'combo-chart-card':
            case 'heatmap-chart-card':
            case 'fishbone-chart-card':
            case 'waterfall-chart-card':
            case 'google-map-card':
            case 'amap-card':
              return <ChartCard {...cardData} />
            case 'sap-analytical-card':
            case 'sap-list-card':
            case 'sap-object-card':
            case 'sap-component-card':
              return <SAPCard {...cardData} />
            case 'error-card': {
              const errorCardData = cardData as any
              return (
                <ErrorCard
                  {...errorCardData}
                  onClose={createHookedHandler('error-card', 'close', errorCardData.title, errorCardData, errorCardData.onClose)}
                  onRetry={createHookedHandler('error-card', 'retry', errorCardData.title, errorCardData, errorCardData.onRetry)}
                />
              )
            }
            case 'warning-card': {
              const warningCardData = cardData as any
              const onConfirm = warningCardData.onConfirm
                ? createHookedHandler('warning-card', 'confirm', warningCardData.title, warningCardData, warningCardData.onConfirm)
                : (warningCardData.actionText && cardHooks?.onCardEvent
                  ? createHookedHandler('warning-card', 'confirm', warningCardData.title, warningCardData)
                  : undefined)
              return (
                <WarningCard
                  {...warningCardData}
                  onClose={createHookedHandler('warning-card', 'close', warningCardData.title, warningCardData, warningCardData.onClose)}
                  onConfirm={onConfirm}
                />
              )
            }
            case 'suggestions-card': {
              const suggestionsCardData = cardData as any
              return (
                <SuggestionsCard
                  {...suggestionsCardData}
                  onClose={createHookedHandler('suggestions-card', 'close', suggestionsCardData.title, suggestionsCardData, suggestionsCardData.onClose)}
                  onSuggestionClick={createHookedHandler(
                    'suggestions-card',
                    'suggestion-click',
                    suggestionsCardData.title,
                    suggestionsCardData,
                    suggestionsCardData.onSuggestionClick,
                    (suggestion: string) => ({ suggestion })
                  )}
                />
              )
            }
            case 'tool-result-card': {
              const toolResultCardData = cardData as any
              return (
                <ToolResultCard
                  {...toolResultCardData}
                  onClose={createHookedHandler('tool-result-card', 'close', toolResultCardData.title, toolResultCardData, toolResultCardData.onClose)}
                  onAction={createHookedHandler('tool-result-card', 'action', toolResultCardData.title, toolResultCardData, toolResultCardData.onAction)}
                />
              )
            }
          }
        }
      }

      if (enableCodeHighlight) {
        return (
            <CodeBlock 
                content={codeContent}
                language={language}
                className="not-prose" 
            />
        )
      }

      return (
        <code className={codeClassName} {...props}>
          {children}
        </code>
      )
    }
  }), [propTheme, size, enableMermaid, enableCodeHighlight, cardHooks, messageId])
  
  return (
    <div className={cn("markdown-body prose dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer
