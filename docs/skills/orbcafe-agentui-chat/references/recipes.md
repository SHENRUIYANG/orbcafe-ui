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

<AIBrowserGlow
  active={isResponding}
  colors={['#ff3860', '#24e070', '#3090ff']}
  zIndex={2147483000}
/>
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

## Recipe 4: CopilotChat inside custom shell

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
