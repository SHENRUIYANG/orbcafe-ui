import { ReactNode, CSSProperties } from 'react'

export interface ErrorCardProps {
  title?: string
  content?: string
  errorCode?: string
  stack?: string
  icon?: ReactNode
  closable?: boolean
  onClose?: () => void
  onRetry?: () => void
  className?: string
}

export interface TableTypeContent {
  type: 'table';
  data: any;
}

export interface ChartCardTypeContent {
  type: 'bar-chart-card' | 'line-chart-card' | 'pie-chart-card' | 'combo-chart-card' | 'heatmap-chart-card' | 'fishbone-chart-card' | 'waterfall-chart-card' | 'google-map-card' | 'amap-card';
  title: string;
  subtitle?: string;
  data: any[];
  config?: any; // Optional config for specific chart settings (e.g. orientation)
}

export interface SAPCardTypeContent {
  type: 'sap-analytical-card' | 'sap-list-card' | 'sap-object-card' | 'sap-component-card';
  manifest: any;
}

export interface AgentUICardTypeContent {
  type: 'error-card' | 'warning-card' | 'suggestions-card' | 'tool-result-card';
  [key: string]: any;
}

export type ParsedCardData = TableTypeContent | ChartCardTypeContent | SAPCardTypeContent | AgentUICardTypeContent;

export type AgentUICardType = ParsedCardData['type']

export type AgentUICardAction =
  | 'render'
  | 'close'
  | 'retry'
  | 'confirm'
  | 'action'
  | 'suggestion-click'

export interface AgentUICardHookEvent {
  messageId?: string
  cardType: AgentUICardType
  action: AgentUICardAction
  title?: string
  payload?: unknown
  rawData?: unknown
}

export interface AgentUICardHooks {
  onCardEvent?: (event: AgentUICardHookEvent) => void
}

export interface WarningCardProps {
  title?: string
  content?: string
  warningType?: string
  severity?: 'info' | 'warning' | 'error' | 'success'
  warnings?: string[]
  icon?: ReactNode
  closable?: boolean
  onClose?: () => void
  onConfirm?: () => void
  onAction?: () => void
  actionText?: string
  className?: string
}

export interface SuggestionsCardProps {
  title?: string
  content?: string
  suggestions: string[]
  onSuggestionClick?: (suggestion: string) => void
  maxDisplay?: number
  icon?: ReactNode
  closable?: boolean
  onClose?: () => void
  className?: string
}

export interface ToolResultCardProps {
  title?: string
  content?: string
  toolName?: string
  status?: 'success' | 'error' | 'running' | 'pending'
  duration?: number
  parameters?: any
  result?: any
  icon?: ReactNode
  closable?: boolean
  onClose?: () => void
  onAction?: () => void
  actionText?: string
  className?: string
}

export interface TableColumn {
  key: string
  title: string
  dataType?: 'string' | 'number' | 'date'
  sortable?: boolean
  render?: (value: any, row: any) => ReactNode
}

export interface TableBlockProps {
  content?: string
  data?: any[]
  columns?: TableColumn[]
  isLoading?: boolean
  sortable?: boolean
  filterable?: boolean
  className?: string
  style?: CSSProperties
}

export interface MathBlockProps {
  content: string
  isLoading?: boolean
  displayMode?: boolean
  className?: string
  style?: CSSProperties
}

export interface QuoteBlockProps {
  content: string
  author?: string
  source?: string
  type?: 'quote' | 'cite' | 'reference'
  isLoading?: boolean
  className?: string
  style?: CSSProperties
}
