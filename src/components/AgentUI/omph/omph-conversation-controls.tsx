/**
 * OMPHPanel 会话入口
 *
 * 内容大纲：
 * - 新建对话按钮
 * - 对话列表的打开、选择和关闭
 *
 * 作者：ORBAICODER
 * 版本：1.0.0
 * 日期：2026-10-14
 *
 * 作用：在面板头部画出新建和会话列表。会话数据仍由宿主持有。
 *
 * 代码逻辑大纲：
 * 1. 只有传入对应回调时才画出按钮。
 * 2. 列表打开后，点选一条交给宿主，再收起列表。
 * 3. 点到列表外面或按 Esc 只关闭列表。
 *
 * ChangeLog：
 * - 1.0.0 2026-10-14 初始版本。
 */

'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Menu, Plus } from '../../Icons'
import type { OMPHConversation, OMPHPanelLabels } from './omph-panel-types'

export interface OmphConversationControlsProps {
  conversations: OMPHConversation[]
  activeConversationId?: string
  labels: OMPHPanelLabels
  onNewConversation?: () => void
  onSelectConversation?: (conversationId: string) => void
}

const formatConversationTime = (value: Date) => {
  if (Number.isNaN(value.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
}

export const OmphConversationControls = ({
  conversations,
  activeConversationId,
  labels,
  onNewConversation,
  onSelectConversation,
}: OmphConversationControlsProps) => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listButtonRef = useRef<HTMLButtonElement>(null)
  const listId = useId()
  const showList = Boolean(onSelectConversation)

  useEffect(() => {
    if (!open) return

    const closeFromOutside = (event: PointerEvent) => {
      if (anchorRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setOpen(false)
      listButtonRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeFromOutside)
    document.addEventListener('keydown', closeFromEscape)
    return () => {
      document.removeEventListener('pointerdown', closeFromOutside)
      document.removeEventListener('keydown', closeFromEscape)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const active = listRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
    const first = listRef.current?.querySelector<HTMLButtonElement>('[role="option"]')
    ;(active ?? first)?.focus()
  }, [open])

  const moveFocus = (direction: 1 | -1) => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])
    if (items.length === 0) return
    const current = items.findIndex((item) => item === document.activeElement)
    const nextIndex = current < 0
      ? (direction === 1 ? 0 : items.length - 1)
      : (current + direction + items.length) % items.length
    items[nextIndex]?.focus()
  }

  if (!onNewConversation && !showList) return null

  return (
    <>
      {onNewConversation && (
        <button
          type="button"
          className="orb-omph-icon-btn"
          aria-label={labels.newConversation}
          onClick={() => {
            setOpen(false)
            onNewConversation()
          }}
        >
          <Plus size={16} />
        </button>
      )}
      {showList && onSelectConversation && (
        <div className="orb-omph-conversation-anchor" ref={anchorRef}>
          <button
            ref={listButtonRef}
            type="button"
            className="orb-omph-icon-btn"
            aria-label={labels.conversationList}
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((current) => !current)}
          >
            <Menu size={16} />
          </button>
          {open && (
            <div
              ref={listRef}
              id={listId}
              className="orb-omph-conversations"
              role="listbox"
              aria-label={labels.conversations}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  moveFocus(1)
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  moveFocus(-1)
                }
              }}
            >
              {conversations.length === 0 ? (
                <p className="orb-omph-conversation-empty">{labels.noConversations}</p>
              ) : conversations.map((item) => {
                const time = item.updatedAt ? formatConversationTime(item.updatedAt) : ''
                const meta = [item.preview, time].filter((part) => part && part.length > 0).join(' · ')
                const selected = item.id === activeConversationId
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    className="orb-omph-conversation"
                    aria-selected={selected}
                    data-active={selected || undefined}
                    onClick={() => {
                      onSelectConversation(item.id)
                      setOpen(false)
                    }}
                  >
                    <span className="orb-omph-conversation-title">{item.title}</span>
                    {meta && <span className="orb-omph-conversation-meta">{meta}</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </>
  )
}
