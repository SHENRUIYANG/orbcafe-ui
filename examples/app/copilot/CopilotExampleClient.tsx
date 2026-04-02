'use client'

import React, { useEffect, useRef, useState } from 'react'
import { CopilotChat, type ChatMessage, type AgentUICardHookEvent } from 'orbcafe-ui'
import { MessageCircle } from 'lucide-react'

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const PANEL_GAP = 24
const PANEL_MIN_WIDTH = 320
const PANEL_MIN_HEIGHT = 420
const RESIZE_HIT_SIZE = 12

const getCornerPosition = (corner: Corner, width: number, height: number) => {
  const maxX = window.innerWidth - width - PANEL_GAP
  const maxY = window.innerHeight - height - PANEL_GAP
  if (corner === 'top-left') return { x: PANEL_GAP, y: PANEL_GAP }
  if (corner === 'top-right') return { x: maxX, y: PANEL_GAP }
  if (corner === 'bottom-left') return { x: PANEL_GAP, y: maxY }
  return { x: maxX, y: maxY }
}

const clampPosition = (x: number, y: number, width: number, height: number) => {
  const minX = PANEL_GAP
  const minY = PANEL_GAP
  const maxX = Math.max(PANEL_GAP, window.innerWidth - width - PANEL_GAP)
  const maxY = Math.max(PANEL_GAP, window.innerHeight - height - PANEL_GAP)
  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY)
  }
}

const getSnapCorner = (x: number, y: number, width: number, height: number): Corner => {
  const centerX = x + width / 2
  const centerY = y + height / 2
  const horizontal = centerX <= window.innerWidth / 2 ? 'left' : 'right'
  const vertical = centerY <= window.innerHeight / 2 ? 'top' : 'bottom'
  return `${vertical}-${horizontal}` as Corner
}

export default function CopilotExampleClient() {
  const [lastCardEvent, setLastCardEvent] = useState<AgentUICardHookEvent | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [corner, setCorner] = useState<Corner>('bottom-right')
  const [panelSize, setPanelSize] = useState({ width: 340, height: 460 })
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I am your Copilot. Ask me anything about the page.',
      timestamp: new Date('2024-01-01T09:00:00')
    }
  ])
  const [isResponding, setIsResponding] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const panelPositionRef = useRef({ x: 0, y: 0 })
  const panelSizeRef = useRef({ width: 340, height: 460 })
  const isResizingRef = useRef(false)
  const dragStateRef = useRef({
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0
  })

  const syncToCorner = (targetCorner: Corner, width: number, height: number) => {
    const position = getCornerPosition(targetCorner, width, height)
    const clamped = clampPosition(position.x, position.y, width, height)
    panelPositionRef.current = clamped
    setPanelPosition(clamped)
  }

  useEffect(() => {
    panelPositionRef.current = panelPosition
  }, [panelPosition])

  useEffect(() => {
    panelSizeRef.current = panelSize
  }, [panelSize])

  useEffect(() => {
    isResizingRef.current = isResizing
  }, [isResizing])

  useEffect(() => {
    if (!isOpen) return
    const handleWindowResize = () => {
      const clamped = clampPosition(panelPosition.x, panelPosition.y, panelSize.width, panelSize.height)
      const nextCorner = getSnapCorner(clamped.x, clamped.y, panelSize.width, panelSize.height)
      setPanelPosition(clamped)
      setCorner(nextCorner)
    }
    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [isOpen, panelPosition.x, panelPosition.y, panelSize.height, panelSize.width])

  useEffect(() => {
    if (!isOpen || !panelRef.current) return
    const observer = new ResizeObserver((entries) => {
      if (isResizingRef.current) return
      const entry = entries[0]
      if (!entry) return
      const nextWidth = Math.max(PANEL_MIN_WIDTH, Math.round(entry.contentRect.width))
      const nextHeight = Math.max(PANEL_MIN_HEIGHT, Math.round(entry.contentRect.height))
      setPanelSize((prev) => {
        if (prev.width === nextWidth && prev.height === nextHeight) return prev
        panelSizeRef.current = { width: nextWidth, height: nextHeight }
        return { width: nextWidth, height: nextHeight }
      })
    })
    observer.observe(panelRef.current)
    return () => observer.disconnect()
  }, [isOpen])

  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('input') || target.closest('textarea') || target.closest('a')) {
      return
    }
    const panelElement = panelRef.current
    if (panelElement) {
      const rect = panelElement.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const offsetY = e.clientY - rect.top
      const canResizeLeft = corner === 'top-right' || corner === 'bottom-right'
      const canResizeRight = corner === 'top-left' || corner === 'bottom-left'
      const canResizeTop = corner === 'bottom-left' || corner === 'bottom-right'
      const canResizeBottom = corner === 'top-left' || corner === 'top-right'
      if (
        (canResizeLeft && offsetX <= RESIZE_HIT_SIZE) ||
        (canResizeRight && rect.width - offsetX <= RESIZE_HIT_SIZE) ||
        (canResizeTop && offsetY <= RESIZE_HIT_SIZE) ||
        (canResizeBottom && rect.height - offsetY <= RESIZE_HIT_SIZE)
      ) {
        return
      }
    }
    e.preventDefault()
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: panelPosition.x,
      originY: panelPosition.y
    }
    setIsDragging(true)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - dragStateRef.current.startX
      const deltaY = moveEvent.clientY - dragStateRef.current.startY
      const nextX = dragStateRef.current.originX + deltaX
      const nextY = dragStateRef.current.originY + deltaY
      const clamped = clampPosition(nextX, nextY, panelSize.width, panelSize.height)
      panelPositionRef.current = clamped
      setPanelPosition(clamped)
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      setIsDragging(false)
      const currentPosition = panelPositionRef.current
      const nextCorner = getSnapCorner(currentPosition.x, currentPosition.y, panelSize.width, panelSize.height)
      const targetPosition = getCornerPosition(nextCorner, panelSize.width, panelSize.height)
      const clampedTarget = clampPosition(targetPosition.x, targetPosition.y, panelSize.width, panelSize.height)
      panelPositionRef.current = clampedTarget
      setCorner((prevCorner) => {
        return nextCorner || prevCorner
      })
      setPanelPosition(clampedTarget)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handleOuterEdgeResizePointerDown = (e: React.PointerEvent<HTMLDivElement>, edge: 'left' | 'right' | 'top' | 'bottom') => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    isResizingRef.current = true
    setIsResizing(true)
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = panelSizeRef.current.width
    const startHeight = panelSizeRef.current.height
    const startPosition = panelPositionRef.current

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      const maxWidth = Math.max(PANEL_MIN_WIDTH, window.innerWidth - PANEL_GAP * 2)
      const maxHeight = Math.max(PANEL_MIN_HEIGHT, window.innerHeight - PANEL_GAP * 2)
      let nextWidth = startWidth
      let nextHeight = startHeight
      let nextX = startPosition.x
      let nextY = startPosition.y

      if (edge === 'right') {
        nextWidth = Math.min(maxWidth, Math.max(PANEL_MIN_WIDTH, startWidth + deltaX))
      }

      if (edge === 'left') {
        nextWidth = Math.min(maxWidth, Math.max(PANEL_MIN_WIDTH, startWidth - deltaX))
        nextX = startPosition.x + (startWidth - nextWidth)
      }

      if (edge === 'bottom') {
        nextHeight = Math.min(maxHeight, Math.max(PANEL_MIN_HEIGHT, startHeight + deltaY))
      }

      if (edge === 'top') {
        nextHeight = Math.min(maxHeight, Math.max(PANEL_MIN_HEIGHT, startHeight - deltaY))
        nextY = startPosition.y + (startHeight - nextHeight)
      }

      const clamped = clampPosition(nextX, nextY, nextWidth, nextHeight)

      panelPositionRef.current = clamped
      panelSizeRef.current = { width: nextWidth, height: nextHeight }
      setPanelPosition(clamped)
      setPanelSize({ width: nextWidth, height: nextHeight })
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      isResizingRef.current = false
      setIsResizing(false)
      const currentPosition = panelPositionRef.current
      const currentSize = panelSizeRef.current
      const clampedPosition = clampPosition(currentPosition.x, currentPosition.y, currentSize.width, currentSize.height)
      panelPositionRef.current = clampedPosition
      setPanelPosition(clampedPosition)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handleSend = async (content: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setIsResponding(true)

    const megaResponse = `
这是一条包含所有 AgentUI 支持效果的综合测试消息！

### 1. 基础 Markdown 渲染
**粗体文本**，*斜体文本*，~~删除线~~，[链接](https://example.com)

- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2

> 这是一段引用文本。Quote block test.

### 2. 数学公式 (MathBlock)
这是行内公式 $E=mc^2$。

下面是独立块公式：
$$
\\int_{-\\infty}^\\infty e^{-x^2} dx = \\sqrt{\\pi}
$$

### 3. 代码高亮 (CodeBlock)
\`\`\`javascript
function calculateSum(a, b) {
  return a + b;
}
console.log(calculateSum(10, 20));
\`\`\`

### 4. Mermaid 图表 (MermaidBlock)
\`\`\`mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
\`\`\`

### 5. 思考块 (ThinkBox)
<think>
这里是 AI 的内部思考过程：
1. 分析用户请求：展示所有效果
2. 构造测试数据
3. 输出结果
这个思考过程默认应该是折叠的或者有特殊的样式。
</think>

### 6. 表格 (TableBlock)
| 功能 | 状态 | 备注 |
|---|---|---|
| Markdown | ✅ | 基础渲染正常 |
| Math | ✅ | 支持 KaTeX |
| Code | ✅ | 语法高亮正常 |

### 7. 动态卡片 (Dynamic Cards)

#### 错误卡片 (ErrorCard)
\`\`\`json
{
  "type": "error-card",
  "title": "数据库连接失败",
  "content": "无法连接到主数据库集群，请检查网络配置或联系管理员。",
  "errorCode": "ERR_DB_001",
  "stack": "Error: Connection timeout at db.connect()...",
  "closable": true
}
\`\`\`

#### 警告卡片 (WarningCard)
\`\`\`json
{
  "type": "warning-card",
  "title": "API 速率限制",
  "content": "您的 API 请求频率已接近上限。",
  "warnings": ["当前使用量：95%", "将在 10 分钟后重置限制"],
  "closable": true,
  "actionText": "升级套餐"
}
\`\`\`

#### 建议卡片 (SuggestionsCard)
\`\`\`json
{
  "type": "suggestions-card",
  "title": "您可能想了解",
  "content": "根据您当前的问题，为您推荐以下相关主题：",
  "suggestions": [
    "如何优化图表渲染性能？",
    "自定义卡片的开发指南",
    "React Hooks 的最佳实践"
  ],
  "maxDisplay": 3,
  "closable": true
}
\`\`\`

#### 工具结果卡片 (ToolResultCard)
\`\`\`json
{
  "type": "tool-result-card",
  "title": "数据分析完成",
  "content": "成功处理了 10,000 条记录。",
  "toolName": "DataProcessor",
  "status": "success",
  "duration": 1.25,
  "result": {
    "rows": 10000,
    "anomalies": 12
  },
  "closable": true
}
\`\`\`

#### 图表卡片 (ChartCard)
\`\`\`json
{
  "type": "bar-chart-card",
  "title": "月度访问量",
  "subtitle": "2024年第一季度",
  "data": [
    {"name": "Jan", "value": 400},
    {"name": "Feb", "value": 300},
    {"name": "Mar", "value": 500}
  ]
}
\`\`\`
`

    setTimeout(() => {
      const isTest = content.toLowerCase().includes('测试') || content.toLowerCase().includes('test')
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: isTest ? megaResponse : `Copilot response to: "${content}"`,
        timestamp: new Date(),
        isStreaming: true
      }
      setMessages(prev => [...prev, assistantMsg])
      setIsResponding(false)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {isOpen && (
        <div
          ref={panelRef}
          className="pointer-events-auto absolute transition-all duration-300 ease-in-out"
          style={{
            left: panelPosition.x,
            top: panelPosition.y,
            width: panelSize.width,
            height: panelSize.height,
            minWidth: PANEL_MIN_WIDTH,
            minHeight: PANEL_MIN_HEIGHT,
            maxWidth: '80vw',
            maxHeight: '85vh',
            overflow: 'visible',
            transitionDuration: isDragging || isResizing ? '0ms' : '200ms'
          }}
        >
          {lastCardEvent && (
            <div className="absolute -top-9 left-0 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              Card Hook: {lastCardEvent.cardType} / {lastCardEvent.action}
            </div>
          )}
          {(corner === 'top-right' || corner === 'bottom-right') && (
            <div
              className="absolute bottom-0 left-[-8px] top-0 z-30 w-[16px] cursor-ew-resize"
              onPointerDown={(event) => handleOuterEdgeResizePointerDown(event, 'left')}
            />
          )}
          {(corner === 'top-left' || corner === 'bottom-left') && (
            <div
              className="absolute bottom-0 right-[-8px] top-0 z-30 w-[16px] cursor-ew-resize"
              onPointerDown={(event) => handleOuterEdgeResizePointerDown(event, 'right')}
            />
          )}
          {(corner === 'bottom-left' || corner === 'bottom-right') && (
            <div
              className="absolute left-0 right-0 top-[-8px] z-30 h-[16px] cursor-ns-resize"
              onPointerDown={(event) => handleOuterEdgeResizePointerDown(event, 'top')}
            />
          )}
          {(corner === 'top-left' || corner === 'top-right') && (
            <div
              className="absolute bottom-[-8px] left-0 right-0 z-30 h-[16px] cursor-ns-resize"
              onPointerDown={(event) => handleOuterEdgeResizePointerDown(event, 'bottom')}
            />
          )}
          <CopilotChat
            messages={messages}
            onSend={handleSend}
            isResponding={isResponding}
            placeholder="Ask Copilot..."
            corner={corner}
            onCollapse={() => setIsOpen(false)}
            onHeaderPointerDown={handleHeaderPointerDown}
            streamChunkSize={3}
            streamIntervalMs={20}
            onMessageStreamingComplete={(messageId) => {
              setMessages((prev) =>
                prev.map((msg) => (msg.id === messageId ? { ...msg, isStreaming: false } : msg))
              )
            }}
            cardHooks={{
              onCardEvent: (event) => {
                setLastCardEvent(event)
              }
            }}
          />
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true)
            syncToCorner(corner, panelSize.width, panelSize.height)
          }}
          className="pointer-events-auto absolute h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            right: PANEL_GAP,
            bottom: PANEL_GAP
          }}
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}
    </div>
  )
}
