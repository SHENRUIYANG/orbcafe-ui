/**
 * OMPHPanel 类型与默认文案
 *
 * 内容大纲：
 * - 面板状态、轮次消息、过程行、用量与失败行
 * - 过程展示模式
 * - 可覆盖的界面文案
 *
 * 作者：ORBAICODER
 * 版本：1.5.0
 * 日期：2026-10-07
 *
 * 作用：定义 OMPHPanel 的宿主数据契约。状态枚举保留 AgentPanel 的五态，消息改成 Harness 会话面板的轮次结构。
 *
 * 代码逻辑大纲：
 * 1. 描述一轮对话里的用户消息、过程行、助手回复、失败行和用量。
 * 2. 提供默认英文文案，宿主用 labels 覆盖，组件内部不写死业务句子。
 *
 * ChangeLog：
 * - 1.5.0 2026-10-07 审批决定增加预置选项和 Other 输入。
 * - 1.4.0 2026-10-07 增加审批卡的请求、决定和默认文案。
 * - 1.3.0 2026-10-04 增加操作条的无障碍名称。
 * - 1.2.0 2026-10-04 去掉分支文案。
 * - 1.1.0 2026-10-04 增加文件预览相关文案。
 * - 1.0.0 2026-10-04 初始版本。
 */

export type OMPHPanelStatus = 'idle' | 'pending' | 'running' | 'success' | 'error'

export type OMPHProcessKind = 'reasoning' | 'tool' | 'command'

export type OMPHProcessStatus = 'pending' | 'running' | 'success' | 'error'

/** compact/standard/detailed 收起已完成过程；expanded 保持展开。 */
export type OMPHProcessDisplay = 'compact' | 'standard' | 'detailed' | 'expanded'

export interface OMPHTurnMessage {
  id: string
  content: string
  timestamp: Date
  /** 为真时内容已经是宿主追加后的全文，组件只画已到达的部分并显示光标。 */
  streaming?: boolean
}

export interface OMPHProcessItem {
  id: string
  kind: OMPHProcessKind
  title: string
  summary?: string
  content?: string
  status: OMPHProcessStatus
  streaming?: boolean
}

export interface OMPHTurnFailure {
  id: string
  severity: 'warning' | 'error'
  content: string
}

/** 预置选项。id 由宿主给，不要用保留值 other。 */
export interface OMPHApprovalChoice {
  id: string
  label: string
  description?: string
}

/**
 * 与 Harness 一样，卡片上不做「以后都允许」。
 * 有 choices 时，宿主收到 choice 或 other；没有 choices 时仍是 allowed-once 或 rejected。
 */
export type OMPHApprovalDecision =
  | { kind: 'allowed-once' }
  | { kind: 'rejected' }
  | { kind: 'choice'; choiceId: string }
  | { kind: 'other'; text: string }

export interface OMPHApprovalRequest {
  id: string
  toolName: string
  callId?: string
  /** 展示用标题。缺省时用 escalation(toolName)。 */
  reason?: string
  /** 等宽展示的命令或工具详情。 */
  detail?: string
  /** 给出后，卡片改为单选。最后可以再加 Other 输入。 */
  choices?: OMPHApprovalChoice[]
  /** 缺省时，有 choices 就提供 Other。 */
  allowOther?: boolean
}

export interface OMPHApprovalLabels {
  waiting: string
  choose: string
  details: string
  choices: string
  reject: string
  allowOnce: string
  confirm: string
  other: string
  otherPlaceholder: string
  escalation: (toolName: string) => string
}

export interface OMPHTurnUsage {
  inputTokens?: number
  outputTokens?: number
  durationMs?: number
}

export interface OMPHTurn {
  id: string
  /** 本轮开始的时间戳（毫秒）。运行态用它计算已经过了多久。 */
  startedAt?: number
  user?: OMPHTurnMessage
  process?: OMPHProcessItem[]
  assistant?: OMPHTurnMessage
  failure?: OMPHTurnFailure
  usage?: OMPHTurnUsage
}

export interface OMPHPanelLabels {
  idle: string
  pending: string
  running: string
  success: string
  error: string
  working: string
  workingFor: (duration: string) => string
  loadOlder: string
  loadingOlder: string
  toBottom: string
  copy: string
  copied: string
  turnActions: string
  usage: string
  inputTokens: string
  outputTokens: string
  duration: string
  send: string
  stop: string
  turnRail: string
  secondUnit: string
  minuteUnit: string
  previewTitle: string
  previewClose: string
  previewBack: string
  previewExpand: string
  previewCollapse: string
  previewCopyContent: string
  previewCopyPath: string
  previewOpenExternal: string
  previewWrap: string
  previewLoading: string
  previewMissing: string
  previewFailed: string
  previewUnsupported: string
  previewRetry: string
  previewResize: string
  previewLines: (start: number, end: number) => string
  previewTruncated: (shown: number, total: number) => string
  imageFailed: string
  zoomIn: string
  zoomOut: string
  zoomFit: string
}

export const DEFAULT_OMPH_PANEL_LABELS: OMPHPanelLabels = {
  idle: 'Idle',
  pending: 'Pending',
  running: 'Working',
  success: 'Success',
  error: 'Error',
  working: 'Working',
  workingFor: (duration) => `Working for ${duration}`,
  loadOlder: 'Load earlier',
  loadingOlder: 'Loading earlier…',
  toBottom: 'Back to bottom',
  copy: 'Copy',
  copied: 'Copied',
  turnActions: 'Reply actions',
  usage: 'Usage',
  inputTokens: 'Input',
  outputTokens: 'Output',
  duration: 'Duration',
  send: 'Send',
  stop: 'Stop',
  turnRail: 'Turns',
  secondUnit: 's',
  minuteUnit: 'm',
  previewTitle: 'File preview',
  previewClose: 'Close preview',
  previewBack: 'Back to conversation',
  previewExpand: 'Expand preview',
  previewCollapse: 'Restore preview size',
  previewCopyContent: 'Copy content',
  previewCopyPath: 'Copy path',
  previewOpenExternal: 'Open externally',
  previewWrap: 'Wrap',
  previewLoading: 'Loading file',
  previewMissing: 'File not found',
  previewFailed: 'Could not load this file',
  previewUnsupported: 'No preview for this file type',
  previewRetry: 'Try again',
  previewResize: 'Resize preview',
  previewLines: (start, end) => (start === end ? `Line ${start}` : `Lines ${start}–${end}`),
  previewTruncated: (shown, total) => `Showing the first ${shown.toLocaleString()} of ${total.toLocaleString()} lines`,
  imageFailed: 'The image could not be displayed',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  zoomFit: 'Fit to width',
}

export const resolveOmphLabels = (override?: Partial<OMPHPanelLabels>): OMPHPanelLabels => ({
  ...DEFAULT_OMPH_PANEL_LABELS,
  ...override,
})

export const DEFAULT_OMPH_APPROVAL_LABELS: OMPHApprovalLabels = {
  waiting: 'Waiting for approval',
  choose: 'Choose an action',
  details: 'Approval details',
  choices: 'Actions',
  reject: 'Reject',
  allowOnce: 'Allow once',
  confirm: 'Continue',
  other: 'Other',
  otherPlaceholder: 'Describe the action to take',
  escalation: (toolName) => `Tool ${toolName} requests privileged execution`,
}

export const resolveOmphApprovalLabels = (override?: Partial<OMPHApprovalLabels>): OMPHApprovalLabels => ({
  ...DEFAULT_OMPH_APPROVAL_LABELS,
  ...override,
})

const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MIN_ELAPSED_MS = 1000

export const formatOmphElapsed = (elapsedMs: number, labels: OMPHPanelLabels): string => {
  const totalSeconds = Math.max(1, Math.round(Math.max(elapsedMs, MIN_ELAPSED_MS) / MS_PER_SECOND))
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE)
  const seconds = totalSeconds % SECONDS_PER_MINUTE
  if (minutes <= 0) return `${totalSeconds}${labels.secondUnit}`
  return `${minutes}${labels.minuteUnit} ${seconds}${labels.secondUnit}`
}
