# AgentUI Recipes

## Recipe 1: AgentPanel

```tsx
import { AgentPanel, type AgentPanelStatus, type ChatMessage } from 'orbcafe-ui'

const [messages, setMessages] = useState<ChatMessage[]>([
  {
    id: '1',
    type: 'assistant',
    content: 'Hello! How can I help you today?',
    timestamp: new Date()
  }
])
const [status, setStatus] = useState<AgentPanelStatus>('idle')

<AgentPanel
  title="My AI Assistant"
  description="Powered by ORBAI"
  agentStatus={status}
  messages={messages}
  onSend={handleSend}
  isResponding={isResponding}
  showInput={false}
  onHeaderPointerDown={handlePanelHeaderPointerDown}
/>
```

状态切换最小模式：

```ts
setStatus('running')
setIsResponding(true)
// run task...
setStatus('success')
setIsResponding(false)
setTimeout(() => setStatus('idle'), 1200)
```

Use `onHeaderPointerDown` only when an outer shell owns dragging or panel positioning. `AgentPanel` does not store floating position.

## Recipe 2: StdChat with streaming

```tsx
import { StdChat, type ChatMessage } from 'orbcafe-ui'

<StdChat
  messages={messages}
  onSend={handleSend}
  isResponding={isResponding}
  showInput={true}
  streamIntervalMs={20}
  streamChunkSize={3}
  onMessageStreamingComplete={(messageId) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, isStreaming: false } : msg))
    )
  }}
  cardHooks={{
    onCardEvent: (event) => console.log(event.cardType, event.action)
  }}
/>
```

## Recipe 3: AIBrowserGlow for AI running state

```tsx
import { AIBrowserGlow } from 'orbcafe-ui'

<AIBrowserGlow active={isResponding} />
```

最小状态切换：

```ts
setIsResponding(true)
try {
  await runAgentTask()
} finally {
  setIsResponding(false)
}
```

Tie `active` to the real AI running state. Turn it off on success, error, cancel, and stop.

## Recipe 4: FloatingAgentPanel with the ready-made shell

```tsx
import { FloatingAgentPanel, type FloatingAgentPanelAnchor } from 'orbcafe-ui'

const [anchor, setAnchor] = useState<FloatingAgentPanelAnchor>('right')

<FloatingAgentPanel
  title="Assistant"
  messages={messages}
  isResponding={isResponding}
  anchor={anchor}
  onAnchorChange={setAnchor}
  width={380}
  cardHooks={{ onCardEvent: setLastCardEvent }}
/>
```

`FloatingAgentPanel` owns horizontal dragging and left/center/right snapping. Keep open/close, free XY positioning and resize in the host; use `CopilotChat` when those controls are required.

## Recipe 5: CopilotChat inside custom shell

```tsx
import { CopilotChat } from 'orbcafe-ui'

<div style={{ position: 'absolute', left: panelPosition.x, top: panelPosition.y, width: panelSize.width, height: panelSize.height }}>
  <CopilotChat
    title="Copilot"
    messages={messages}
    onSend={handleSend}
    isResponding={isResponding}
    corner={corner}
    onCollapse={() => setIsOpen(false)}
    onHeaderPointerDown={handleHeaderPointerDown}
    streamIntervalMs={20}
    streamChunkSize={3}
    onMessageStreamingComplete={handleStreamingComplete}
    cardHooks={{ onCardEvent: setLastCardEvent }}
  />
</div>
```

## Recipe 6: Metric chart cards in an assistant response

An assistant message can include a fenced JSON card using the `metric-chart-card` payload. The renderer maps it to the public `CMetricChartCard` style and keeps card events on `cardHooks`:

```json
{
  "type": "metric-chart-card",
  "title": "Planning controller",
  "subtitle": "Materials by responsible planner",
  "chartType": "bar",
  "data": [
    { "id": "anna", "label": "Anna Müller", "value": 148 },
    { "id": "ben", "label": "Ben Fischer", "value": 121 }
  ]
}
```

The card supports chart switching, item events, one-second hover data details, and a right-click `Show data` menu. The event payload keeps the datum and reveal source available to the host.

## Minimal state shapes

```ts
type ChatMessage = {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

const [messages, setMessages] = useState<ChatMessage[]>(...)
const [isResponding, setIsResponding] = useState(false)
const [agentStatus, setAgentStatus] = useState<AgentPanelStatus>('idle')
```

Copilot shell:

```ts
const [isOpen, setIsOpen] = useState(false)
const [corner, setCorner] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right')
const [panelSize, setPanelSize] = useState({ width: 340, height: 460 })
const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 })
```

When appending a streaming assistant message:

```ts
setMessages((prev) => [
  ...prev,
  {
    id: crypto.randomUUID(),
    type: 'assistant',
    content: answer,
    timestamp: new Date(),
    isStreaming: true,
  },
])
```

Then clear only that message's streaming flag in `onMessageStreamingComplete`.

## Recipe 5: OMPHPanel

宿主持有轮次，并按到达的全文追加。不要套 `AgentPanel` 的打字机。文件预览、过程行和滚动的完整规则在 `references/omph-panel.md`。

```tsx
import { useState } from 'react'
import { InputArea, OMPHPanel, type OMPHPanelStatus, type OMPHTurn } from 'orbcafe-ui'

const [turns, setTurns] = useState<OMPHTurn[]>([])
const [status, setStatus] = useState<OMPHPanelStatus>('idle')
const [isResponding, setIsResponding] = useState(false)

async function handleSend(content: string) {
  const id = crypto.randomUUID()
  setStatus('running')
  setIsResponding(true)
  setTurns((current) => [...current, {
    id,
    startedAt: Date.now(),
    user: { id: `${id}-user`, content, timestamp: new Date() },
    assistant: { id: `${id}-assistant`, content: '', timestamp: new Date(), streaming: true },
  }])
  try {
    // 每拿到一块文本，把 assistant.content 换成到目前为止的全文
  } finally {
    setTurns((current) => current.map((turn) => (
      turn.id === id && turn.assistant
        ? { ...turn, assistant: { ...turn.assistant, streaming: false } }
        : turn
    )))
    setIsResponding(false)
    setStatus('idle')
  }
}

<>
  <OMPHPanel
    title="Data Analysis Agent"
    turns={turns}
    agentStatus={status}
    isResponding={isResponding}
  />
  <InputArea onSend={handleSend} onStop={cancelTheRequest} isResponding={isResponding} />
</>
```

面板默认不渲染输入。只有明确要内置输入条时才传 `showInput`。等待人工确认时用 `OMPHApprovalCard` 换掉 `InputArea`。回复里的可交互 HTML 写成闭合的 `html` 围栏，放在回复末尾。启用预览时再传 `loadFilePreview`。文件不存在返回 `{ body: { kind: 'missing' } }`，暂时失败才 throw。示例：`examples/app/omph-panel/OMPHPanelExampleClient.tsx`。
