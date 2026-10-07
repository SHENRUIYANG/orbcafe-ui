/**
 * OMPH 审批卡
 *
 * 内容大纲：
 * - 等待审批的警告条、原因和可选的命令详情
 * - 预置单选、Other 输入、拒绝与仅本次允许
 * - 详情区 Enter / Esc，以及作答后的锁定
 *
 * 作者：ORBAICODER
 * 版本：1.1.0
 * 日期：2026-10-07
 *
 * 作用：对齐 Harness 的人工确认。卡片换掉输入区，不画在回复里面。
 *
 * 代码逻辑大纲：
 * 1. 标题优先用请求的 reason，否则用工具名套默认越权句。
 * 2. 有 choices 时渲染单选；allowOther 不为 false 时追加 Other，选中后才可输入。
 * 3. 详情区 Enter 提交当前选择；没有选项时 Enter 是允许一次。Esc 拒绝。焦点在按钮或输入框上时不拦截。
 * 4. 作答后锁住。宿主撤掉请求或换新 id 之前，不能再答。
 *
 * ChangeLog：
 * - 1.1.0 2026-10-07 增加预置选项和 Other 输入。
 * - 1.0.0 2026-10-07 初始版本。
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import {
  resolveOmphApprovalLabels,
  type OMPHApprovalDecision,
  type OMPHApprovalLabels,
  type OMPHApprovalRequest,
} from './omph-panel-types'

const OTHER_SELECTION = 'other'

const isEditableTarget = (target: EventTarget | null) => (
  target instanceof HTMLElement
  && target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]') !== null
)

export const OMPHApprovalCard = ({
  request,
  onDecide,
  labels: labelOverride,
}: {
  request: OMPHApprovalRequest
  onDecide: (decision: OMPHApprovalDecision, request: OMPHApprovalRequest) => void
  labels?: Partial<OMPHApprovalLabels>
}) => {
  const labels = resolveOmphApprovalLabels(labelOverride)
  const detailRef = useRef<HTMLDivElement | null>(null)
  const otherRef = useRef<HTMLTextAreaElement | null>(null)
  const composing = useRef(false)
  const compositionEnded = useRef(false)
  const [answered, setAnswered] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [otherText, setOtherText] = useState('')
  const choices = request.choices ?? []
  const allowOther = request.allowOther ?? choices.length > 0
  const hasChoices = choices.length > 0 || allowOther
  const headline = request.reason?.trim() || labels.escalation(request.toolName)
  const detail = request.detail?.trim()
  const otherReady = selectedId === OTHER_SELECTION && otherText.trim().length > 0
  const canConfirm = !hasChoices || (selectedId !== null && selectedId !== OTHER_SELECTION) || otherReady

  useEffect(() => {
    setAnswered(false)
    setSelectedId(null)
    setOtherText('')
    detailRef.current?.focus()
  }, [request.id])

  useEffect(() => {
    if (selectedId === OTHER_SELECTION) otherRef.current?.focus()
  }, [selectedId])

  const decide = (decision: OMPHApprovalDecision) => {
    if (answered) return
    setAnswered(true)
    onDecide(decision, request)
  }

  const confirmSelection = () => {
    if (!canConfirm) return
    if (!hasChoices) {
      decide({ kind: 'allowed-once' })
      return
    }
    if (selectedId === OTHER_SELECTION) {
      const text = otherText.trim()
      if (!text) return
      decide({ kind: 'other', text })
      return
    }
    if (selectedId) decide({ kind: 'choice', choiceId: selectedId })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (answered || isEditableTarget(event.target)) return
    if (event.key !== 'Enter' && event.key !== 'Escape') return
    if (event.key === 'Enter' && event.target instanceof HTMLElement && event.target.closest('button, a[href], [role="button"]')) return
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
    event.preventDefault()
    event.stopPropagation()
    if (event.repeat || composing.current || compositionEnded.current || event.nativeEvent.isComposing) return
    if (event.key === 'Escape') {
      decide({ kind: 'rejected' })
      return
    }
    confirmSelection()
  }

  return (
    <div
      className="orb-omph-approval"
      data-omph-approval={request.id}
      aria-busy={answered}
      onKeyDown={onKeyDown}
      onKeyUpCapture={() => { compositionEnded.current = false }}
      onCompositionStartCapture={() => { composing.current = true }}
      onCompositionEndCapture={() => {
        composing.current = false
        compositionEnded.current = true
      }}
    >
      <div className="orb-omph-approval-card">
        <div className="orb-omph-approval-strip">
          <span className="orb-omph-approval-dot" aria-hidden="true" />
          {hasChoices ? labels.choose : labels.waiting}
        </div>
        <div
          ref={detailRef}
          className="orb-omph-approval-body"
          tabIndex={0}
          role="group"
          aria-label={labels.details}
        >
          <div className="orb-omph-approval-headline">{headline}</div>
          {detail && <div className="orb-omph-approval-detail">{detail}</div>}
          {hasChoices && (
            <fieldset className="orb-omph-approval-choices" disabled={answered}>
              <legend className="orb-visually-hidden">{labels.choices}</legend>
              {choices.map((choice) => {
                const selected = selectedId === choice.id
                return (
                  <label key={choice.id} className="orb-omph-approval-choice" data-selected={selected}>
                    <input
                      type="radio"
                      name={`omph-approval-${request.id}`}
                      value={choice.id}
                      checked={selected}
                      onChange={() => setSelectedId(choice.id)}
                    />
                    <span className="orb-omph-approval-choice-copy">
                      <span>{choice.label}</span>
                      {choice.description && (
                        <span className="orb-omph-approval-choice-description">{choice.description}</span>
                      )}
                    </span>
                  </label>
                )
              })}
              {allowOther && (
                <label className="orb-omph-approval-choice" data-selected={selectedId === OTHER_SELECTION}>
                  <input
                    type="radio"
                    name={`omph-approval-${request.id}`}
                    value={OTHER_SELECTION}
                    checked={selectedId === OTHER_SELECTION}
                    onChange={() => setSelectedId(OTHER_SELECTION)}
                  />
                  <span className="orb-omph-approval-choice-copy">
                    <span>{labels.other}</span>
                  </span>
                </label>
              )}
              {allowOther && selectedId === OTHER_SELECTION && (
                <textarea
                  ref={otherRef}
                  className="orb-omph-approval-other"
                  value={otherText}
                  placeholder={labels.otherPlaceholder}
                  rows={3}
                  aria-label={labels.other}
                  onChange={(event) => setOtherText(event.target.value)}
                />
              )}
            </fieldset>
          )}
        </div>
        <div className="orb-omph-approval-actions">
          <button
            type="button"
            className="orb-btn orb-btn-neutral orb-omph-approval-reject"
            disabled={answered}
            onClick={() => decide({ kind: 'rejected' })}
          >
            {labels.reject}
          </button>
          <button
            type="button"
            className="orb-btn orb-btn-primary"
            disabled={answered || !canConfirm}
            onClick={confirmSelection}
          >
            {hasChoices ? labels.confirm : labels.allowOnce}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OMPHApprovalCard
