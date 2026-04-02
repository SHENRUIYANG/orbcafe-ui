# AgentUI

`AgentUI` 是 ORBCAFE 里用于聊天类交互的标准 UI 层。当前最核心的三个布局组件是：

- `AgentPanel`: 带 header 的工作台聊天面板，支持状态跑马灯和光晕。
- `StdChat`: 标准聊天容器，适合整页、卡片页、抽屉页。
- `CopilotChat`: Copilot 浮窗内容容器，适合右下角助手、可拖拽面板、悬浮问答入口。

这三个组件共用同一套消息渲染、流式输出、Markdown/卡片解析和事件回调能力。区别主要在布局壳和交互方式。

## 公共 API

当前建议作为稳定公共接口使用的只有以下内容：

- `AgentPanel`
- `type AgentPanelStatus`
- `StdChat`
- `CopilotChat`
- `type ChatMessage`
- `type AgentUICardHooks`
- `type AgentUICardHookEvent`
- `type AgentUICardAction`
- `type AgentUICardType`

推荐 import：

```tsx
import {
  AgentPanel,
  type AgentPanelStatus,
  StdChat,
  CopilotChat,
  type ChatMessage,
  type AgentUICardHooks,
  type AgentUICardHookEvent
} from 'orbcafe-ui'
```

不建议把下面这些内部实现组件视为稳定对外 API：

- `MarkdownRenderer`
- `ContentRenderer`
- `DynamicCardRenderer`
- `InputArea`
- `VoiceInputButton`
- `SimpleAnswer`
- `ThinkingWindow`

原因很直接：这些组件当前主要服务于聊天渲染链内部组合，后续仍可能按渲染策略、交互设计或依赖关系继续调整。

## 目录

```text
src/components/AgentUI/
├── components/
│   ├── cards/          # ErrorCard / WarningCard / SuggestionsCard / ToolResultCard / ChartCard
│   ├── core/           # ChatMessage / InputArea / StreamingRenderer / DynamicCardRenderer
│   └── renderers/      # Markdown / Math / Mermaid / Table / Think 等块级渲染器
├── layout/
│   ├── agent-panel.tsx
│   ├── std-chat.tsx
│   └── copilot-chat.tsx
├── lib/
└── types.ts
```

## 共享标准控件

无论使用 `AgentPanel`、`StdChat` 还是 `CopilotChat`，底层都依赖同一套标准控件：

| 控件 | 路径 | 作用 |
| --- | --- | --- |
| `ChatMessage` | `components/core/ChatMessage.tsx` | 渲染单条消息，区分用户消息和助手消息，并挂载 assistant actions |
| `StreamingRenderer` | `components/core/StreamingRenderer.tsx` | 将 `isStreaming` 的 assistant 消息按 chunk 输出 |
| `ContentRenderer` | `components/core/ContentRenderer.tsx` | 统一决定文本、Markdown、卡片内容怎么渲染 |
| `DynamicCardRenderer` | `components/core/DynamicCardRenderer.tsx` | 解析消息中的卡片 JSON，映射到具体卡片组件 |
| `InputArea` | `components/core/InputArea.tsx` | 标准输入框，支持发送、停止、文件、语音入口等交互 |
| `cardHooks` | `components/cardTypes.ts` | 将卡片点击、关闭、动作按钮等事件回传给业务层 |

### 标准能力

- 流式输出：通过 `isStreaming`、`streamIntervalMs`、`streamChunkSize` 控制。
- Markdown 富文本：支持 GFM、代码块、数学公式、Mermaid、引用、表格。
- 动态卡片：消息中输出卡片 JSON 时，自动渲染为业务卡片。
- 业务回调：卡片行为通过 `cardHooks.onCardEvent` 回传。
- 响应式输入区：`InputArea` 负责输入、多行伸缩、发送/停止按钮等基础能力。

## Hooks 与回调契约

### 当前结论

`src/components/AgentUI` 目录下目前没有独立导出的自定义 hooks。

目录内部虽然大量使用 React hooks，但对业务方真正开放的“hook 能力”是下面这些回调契约，而不是 `useXxx` 形式的 API。

### 主要回调点

| 接口 | 所在组件 | 用途 |
| --- | --- | --- |
| `onSend(content, files?)` | `AgentPanel` / `StdChat` / `CopilotChat` / `InputArea` | 发送用户输入，是最核心的数据上行入口 |
| `onStop()` | `AgentPanel` / `StdChat` / `InputArea` | 中断当前响应 |
| `onRegenerate(messageId)` | `AgentPanel` / `StdChat` / `CopilotChat` | 对最后一条 assistant 消息触发重试 |
| `onMessageStreamingComplete(messageId)` | `AgentPanel` / `StdChat` / `CopilotChat` | assistant 流式输出结束后回写消息状态 |
| `cardHooks.onCardEvent(event)` | 整个渲染链透传 | 承接 ErrorCard / WarningCard / SuggestionsCard / ToolResultCard 等卡片事件 |
| `onCollapse()` | `CopilotChat` | 收起 Copilot 面板 |
| `onHeaderPointerDown(event)` | `CopilotChat` | 将标题栏拖拽能力交给外层浮窗壳 |
| `onPlusClick()` | `CopilotChat` | 自定义底部附件/工具按钮动作 |
| `onMicClick()` | `CopilotChat` | 自定义麦克风按钮动作 |

### `cardHooks` 的推荐用法

`cardHooks` 是 AgentUI 当前最重要的业务扩展点。

```tsx
const cardHooks: AgentUICardHooks = {
  onCardEvent: (event) => {
    console.log(event.cardType, event.action, event.payload)
  }
}
```

事件对象结构：

```ts
interface AgentUICardHookEvent {
  messageId?: string
  cardType: AgentUICardType
  action: AgentUICardAction
  title?: string
  payload?: unknown
  rawData?: unknown
}
```

常见 action：

- `close`
- `retry`
- `confirm`
- `action`
- `suggestion-click`

### 语音输入相关说明

`AgentUI` 自身没有导出语音输入 hook。`VoiceInputButton` 内部复用了 `AINav` 模块里的 `useVoiceInput`。

这意味着：

- 业务方通常不需要直接接入语音 hook。
- 如果要定制语音交互，优先从页面层替换或扩展按钮行为，而不是耦合 AgentUI 内部实现。

## 组件关系

```text
业务状态(messages / isResponding / hooks / agentStatus)
  -> AgentPanel 或 StdChat 或 CopilotChat
    -> ChatMessage
      -> StreamingRenderer
      -> ContentRenderer
        -> MarkdownRenderer / DynamicCardRenderer / 其他 block renderers
    -> InputArea 或 Copilot 内置输入条
```

## 封装边界检查结果

这次检查后，当前封装边界可以总结为三层：

### 1. 推荐直接使用的层

- `AgentPanel`
- `StdChat`
- `CopilotChat`

这是业务接入时最合理的入口层。

### 2. 类型与事件契约层

- `ChatMessage`
- `AgentUICardHooks`
- `AgentUICardHookEvent`

这是推荐跟业务状态管理直接对接的类型层。

### 3. 内部渲染实现层

- `ChatMessage` 组件
- `StreamingRenderer`
- `ContentRenderer`
- `MarkdownRenderer`
- `DynamicCardRenderer`
- 各类 cards / block renderers

这层目前封装思路总体合理，因为布局层和内容渲染层已经分开；但有一个已确认的实现特征需要注意：

- 卡片解析和事件包装逻辑目前同时存在于 `MarkdownRenderer` 和 `DynamicCardRenderer` 中，能力上有重复。

这不影响现有接入，但说明当前最稳定的使用方式仍然是从布局层进入，而不是直接依赖底层渲染器。

## AgentPanel

### 定位

`AgentPanel` 是带 header 的工作台聊天面板，内部封装 `StdChat`，适合整页 Agent 工作台场景。

它在 `StdChat` 基础上额外提供：

- 标题和描述
- header actions 插槽
- 状态标记（文案 + dot）
- 状态化视觉反馈（四边跑马灯 + 彩色光晕）

实现文件：`src/components/AgentUI/layout/agent-panel.tsx`

### Props

```ts
export type AgentPanelStatus = 'idle' | 'running' | 'success' | 'error' | 'pending'

export interface AgentPanelProps extends StdChatProps {
  title?: string
  description?: string
  headerActions?: React.ReactNode
  agentStatus?: AgentPanelStatus
}
```

### 使用建议

- 展示型面板：直接用默认值（`showInput` 默认为 `false`）。
- 可输入面板：显式传 `showInput={true}` 并传入 `onSend`。
- 状态展示：优先传 `agentStatus`；若不传，会回退为 `isResponding ? 'running' : 'idle'`。

### 最小用法（展示型）

```tsx
import { AgentPanel, type AgentPanelStatus, type ChatMessage } from 'orbcafe-ui'

const [messages, setMessages] = useState<ChatMessage[]>(...)
const [isResponding, setIsResponding] = useState(false)
const [status, setStatus] = useState<AgentPanelStatus>('idle')

<AgentPanel
  title="Data Analysis Agent"
  description="Display-only conversation panel"
  messages={messages}
  isResponding={isResponding}
  agentStatus={status}
  showInput={false}
/>
```

### `examples/app/aipanel` 的效果是怎么实现的

示例文件：`examples/app/aipanel/AIPanelExampleClient.tsx`

核心状态与行为：

1. `messages`：单一消息源。
2. `isResponding`：模拟任务执行中。
3. `status`：`idle/running/success/error/pending` 手动或自动切换。
4. 通过 `Trigger Agent Run` 按钮模拟一次任务执行并回填 assistant 消息。
5. 跑马灯和光晕由 `agentStatus` 自动联动，不需要额外写边框动画代码。

## StdChat

### 定位

`StdChat` 是标准聊天主容器，负责两件事：

1. 上半区消息列表滚动与自动滚到底部。
2. 下半区固定输入区布局。

它不负责页面标题、浮窗外壳、拖拽、缩放。这些能力应该由外层页面或 `AgentPanel` 提供。

实现文件：`src/components/AgentUI/layout/std-chat.tsx`

### Props

```ts
export interface StdChatProps {
  messages: ChatMessage[]
  onSend?: (content: string, files?: File[]) => Promise<void>
  onStop?: () => void
  onRegenerate?: (messageId: string) => Promise<void>
  isResponding?: boolean
  className?: string
  placeholder?: string
  streamIntervalMs?: number
  streamChunkSize?: number
  onMessageStreamingComplete?: (messageId: string) => void
  cardHooks?: AgentUICardHooks
  showInput?: boolean
}
```

补充说明：

- `showInput` 默认 `true`。
- 当 `showInput={false}` 时，`onSend` 可以不传。
- 当 `showInput={true}` 时，必须提供可用的 `onSend`。

### 最小用法

```tsx
import { useState } from 'react'
import { StdChat, type ChatMessage } from 'orbcafe-ui'

export default function Demo() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I am your AI assistant.',
      timestamp: new Date()
    }
  ])
  const [isResponding, setIsResponding] = useState(false)

  const handleSend = async (content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), type: 'user', content, timestamp: new Date() }
    ])
    setIsResponding(true)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `I received: ${content}`,
          timestamp: new Date(),
          isStreaming: true
        }
      ])
      setIsResponding(false)
    }, 800)
  }

  return (
    <StdChat
      messages={messages}
      onSend={handleSend}
      isResponding={isResponding}
      streamIntervalMs={20}
      streamChunkSize={3}
      onMessageStreamingComplete={(messageId) => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, isStreaming: false } : msg))
        )
      }}
    />
  )
}
```

### `examples/app/chat` 的效果是怎么实现的

示例文件：`examples/app/chat/ChatExampleClient.tsx`

这个 example 的效果不是靠 `StdChat` 内部“魔法”完成的，而是靠页面层状态组织：

1. 初始化一条 assistant 欢迎消息。
2. 用户发送时，先立即 append 一条 user 消息。
3. 将 `isResponding` 设为 `true`，让输入区进入“正在响应”状态。
4. 延时模拟接口返回后，再 append 一条 `isStreaming: true` 的 assistant 消息。
5. 把 `streamIntervalMs={20}` 和 `streamChunkSize={3}` 传给 `StdChat`，启用打字机效果。
6. 在 `onMessageStreamingComplete` 里把对应消息的 `isStreaming` 改回 `false`。
7. 通过 `cardHooks.onCardEvent` 接收卡片交互事件，并把最近一次事件显示在顶部提示条里。

### 复制 example 效果时的推荐实现

如果你要在业务页面里快速复刻这个 example，保留下面这四个状态就够了：

```ts
const [messages, setMessages] = useState<ChatMessage[]>(...)
const [isResponding, setIsResponding] = useState(false)
const [lastCardEvent, setLastCardEvent] = useState<AgentUICardHookEvent | null>(null)
const handleSend = async (content: string, files?: File[]) => { ... }
```

然后把下面四个点接上：

- `messages`: 作为单一消息源。
- `isResponding`: 控制输入区发送/停止态。
- `onMessageStreamingComplete`: 关闭流式标记。
- `cardHooks.onCardEvent`: 承接卡片侧业务行为。

### 适用场景

- 全页聊天页面
- 详情页右侧问答区
- 弹窗内聊天
- 带 Header 的标准工作台，可搭配 `AgentPanel`

## CopilotChat

### 定位

`CopilotChat` 不是一个完整浮窗系统，它是“Copilot 面板内容层”。

它内置了：

- 标题栏
- 消息列表
- 底部单行输入条
- 收起按钮位置逻辑

它不内置：

- 浮动按钮
- 打开/关闭状态
- 面板绝对定位
- 拖拽
- 吸附角逻辑
- 缩放

这些都应由页面外壳负责。当前 example 就是这样实现的。

实现文件：`src/components/AgentUI/layout/copilot-chat.tsx`

### Props

```ts
export interface CopilotChatProps {
  messages: ChatMessage[]
  onSend: (content: string, files?: File[]) => Promise<void>
  onStop?: () => void
  onRegenerate?: (messageId: string) => Promise<void>
  isResponding?: boolean
  className?: string
  placeholder?: string
  title?: string
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  onCollapse?: () => void
  onHeaderPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void
  onPlusClick?: () => void
  onMicClick?: () => void
  streamIntervalMs?: number
  streamChunkSize?: number
  onMessageStreamingComplete?: (messageId: string) => void
  cardHooks?: AgentUICardHooks
}
```

### 最小用法

如果你已经有自己的浮窗壳，可以直接把 `CopilotChat` 塞进去：

```tsx
<div style={{ width: 340, height: 460 }}>
  <CopilotChat
    title="Copilot"
    messages={messages}
    onSend={handleSend}
    isResponding={isResponding}
    corner="bottom-right"
    onCollapse={() => setIsOpen(false)}
    onHeaderPointerDown={handleHeaderPointerDown}
    streamIntervalMs={20}
    streamChunkSize={3}
    onMessageStreamingComplete={handleStreamingComplete}
    cardHooks={{ onCardEvent: setLastCardEvent }}
  />
</div>
```

### `examples/app/copilot` 的效果是怎么实现的

示例文件：`examples/app/copilot/CopilotExampleClient.tsx`

这个 example 分成两层：

1. 页面壳层：负责浮窗按钮、打开关闭、定位、拖拽、缩放、角落吸附。
2. `CopilotChat` 内容层：负责标题栏、消息、输入和流式渲染。

#### 页面壳层维护的核心状态

```ts
const [isOpen, setIsOpen] = useState(false)
const [corner, setCorner] = useState<Corner>('bottom-right')
const [panelSize, setPanelSize] = useState({ width: 340, height: 460 })
const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 })
const [isDragging, setIsDragging] = useState(false)
const [isResizing, setIsResizing] = useState(false)
```

#### example 的交互实现步骤

1. 关闭时只渲染右下角浮动按钮。
2. 点击打开后，根据 `corner + panelSize` 计算面板初始位置。
3. 面板使用 `position: absolute`，`left/top/width/height` 全部由状态驱动。
4. 标题栏把 `onPointerDown` 透传给外层，用于拖拽整个浮窗。
5. 通过 `getSnapCorner` 在拖拽结束后重新判断应该吸附到哪个角。
6. 在浮窗四周渲染 invisible resize handles，只开放“外边缘”方向的缩放。
7. 使用 `ResizeObserver` 同步面板实际尺寸，但手动 resize 时要跳过 observer 回写，避免尺寸被动画中的中间值覆盖。
8. 消息发送、流式输出、卡片 Hook 的处理方式和 `StdChat` 完全一致。

### 复制 example 效果时的注意点

#### 1. `CopilotChat` 只管内容，不管壳

如果你只引入 `CopilotChat`，你只会得到一个带 header 的聊天面板，不会自动出现：

- 右下角悬浮按钮
- 拖拽移动
- 四角吸附
- 外边缘 resize

这些都要在页面层自己包一层。

#### 2. 拖拽与缩放要和 `corner` 联动

当前 example 不是“自由缩放 + 自由锚点”，而是“吸附到四角后，从外边缘缩放”。

比如面板在 `bottom-right` 时：

- 左边缘可拉伸宽度
- 上边缘可拉伸高度
- 收起角标显示在左上外侧

#### 3. resize 期间不要让 observer 反向改写状态

这是 Copilot example 最容易踩的坑。

如果你在 resize 时还保留 `transition-all`，并让 `ResizeObserver` 持续回写 `panelSize`，就可能出现：

- 面板位置变化了
- 宽高又被 observer 改回去

当前 example 的做法是：

- resize 期间临时关闭 transition
- resize 期间跳过 `ResizeObserver`
- pointer up 后再恢复正常同步

### 适用场景

- 页面右下角 AI Copilot
- 轻量问答浮窗
- 可拖拽悬浮助手
- 需要收起成 FAB 的页面助手

## 示例入口

- AgentPanel 状态面板示例：`examples/app/aipanel/AIPanelExampleClient.tsx`
- 标准聊天示例：`examples/app/chat/ChatExampleClient.tsx`
- Copilot 浮窗示例：`examples/app/copilot/CopilotExampleClient.tsx`

## 选型建议

### 什么时候用 `AgentPanel`

- 你要做整页或工作台 Agent 面板
- 你需要 header（标题/描述/actions）
- 你要展示 agent 运行状态（dot + 跑马灯 + 彩色光晕）
- 你需要展示型只读面板（默认 `showInput=false`）

### 什么时候用 `StdChat`

- 你的聊天区域已经有稳定的页面容器
- 你只需要消息区 + 输入区
- 你希望按场景切换输入区（`showInput`）
- 你不需要额外处理浮窗拖拽和定位

### 什么时候用 `CopilotChat`

- 你需要一个更轻量的助手面板内容层
- 你准备自己控制浮窗打开、关闭、拖拽、缩放
- 你需要右下角 Copilot 这种产品形态

## 补充

- `AgentPanel` 是 `StdChat` 的带头部封装，默认展示型；需要输入框时显式传 `showInput={true}`。
- `AgentPanel` 的 `agentStatus` 支持 `idle/running/success/error/pending`，并自动驱动状态视觉。
- 如果业务消息来自真实 SSE / WebSocket，只需要保持 `messages` 和 `isStreaming` 的状态语义不变，`AgentPanel` / `StdChat` / `CopilotChat` 不需要改。
