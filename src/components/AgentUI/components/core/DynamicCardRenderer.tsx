'use client'

import type { FC } from 'react'
import MarkdownRenderer from '../renderers/MarkdownRenderer'
import ErrorCard from '../cards/ErrorCard'
import WarningCard from '../cards/WarningCard'
import SuggestionsCard from '../cards/SuggestionsCard'
import ToolResultCard from '../cards/ToolResultCard'
import TableCard from '../cards/TableCard'
import ChartCard from '../cards/ChartCard'
import SAPCard from '../cards/SAPCard'
import { parseCardPayload } from '../utils/cardParsing'
import type { AgentUICardAction, AgentUICardHooks, AgentUICardType } from '../cardTypes'

interface DynamicCardProps {
  content: string
  messageId?: string
  cardHooks?: AgentUICardHooks
}

const DynamicCardRenderer: FC<DynamicCardProps> = ({ content, messageId, cardHooks }) => {
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
  
  const cardData = parseCardPayload(content)

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
        return <ChartCard {...(cardData as any)} />
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
      default:
        break
    }
  }

  return (
    <div className="dynamic-card-fallback">
      <MarkdownRenderer 
        content={content}
        enableCodeHighlight={true}
        enableMath={true}
        enableMermaid={true}
        messageId={messageId}
        cardHooks={cardHooks}
      />
    </div>
  )
}

export default DynamicCardRenderer
