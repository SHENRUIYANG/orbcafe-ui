export * from './layout/agent-panel'
export * from './omph/omph-panel'
export { OMPHApprovalCard } from './omph/omph-approval-card'
export { parseOmphFileHref } from './omph/omph-file-link'
// i18n 文案合成器：宿主可用它 + ORBCAFE_I18N_MESSAGES 在面板外预合成某语言的完整 labels
export { omphLabelsFromI18n, omphApprovalLabelsFromI18n } from './omph/omph-panel-types'
export type {
  OMPHFileBody,
  OMPHFileLinkResolver,
  OMPHFilePreviewData,
  OMPHFilePreviewLayout,
  OMPHFilePreviewLoader,
  OMPHFileRef,
} from './omph/omph-file-preview-types'
export type {
  OMPHApprovalChoice,
  OMPHApprovalDecision,
  OMPHApprovalLabels,
  OMPHApprovalRequest,
  OMPHConversation,
  OMPHPanelLabels,
  OMPHPanelStatus,
  OMPHProcessDisplay,
  OMPHProcessItem,
  OMPHProcessKind,
  OMPHProcessStatus,
  OMPHTurn,
  OMPHTurnFailure,
  OMPHTurnMessage,
  OMPHTurnUsage,
  OmphTranslate,
} from './omph/omph-panel-types'
export * from './layout/floating-agent-panel'
export * from './layout/std-chat'
export { InputArea } from './components/core/InputArea'
export type { InputAreaProps } from './components/core/InputArea'
export * from './layout/copilot-chat'
export * from './components/core/AIBrowserGlow'

export type { ChatMessage } from './components/core/ChatMessage'
export type {
  AgentUICardAction,
  AgentUICardHookEvent,
  AgentUICardHooks,
  AgentUICardType,
  MetricChartCardTypeContent
} from './components/cardTypes'
