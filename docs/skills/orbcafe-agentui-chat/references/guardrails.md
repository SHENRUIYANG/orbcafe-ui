# AgentUI Guardrails

## Terminology Boundary

- `AIPanel` means `AgentPanel` used as an AI dialogue/message window without chat input.
- `Chat` means an input-included chat experience; use `StdChat` for the standard implementation.
- Do not describe `AIPanel` as including the chat input. If an input bar floats under an `AIPanel`, call it an external composition around `AgentPanel`, not part of `AIPanel` itself.

## Public API only

- 只从 `orbcafe-ui` 导入：
  - `AgentPanel`
  - `StdChat`
  - `CopilotChat`
  - `AIBrowserGlow`
  - `type ChatMessage`
  - `type AgentPanelStatus`
  - `type AIBrowserGlowColors`
  - `type AgentUICardHooks`
- 不要指导业务代码直接从 `src/components/AgentUI/...` 引内部实现。

## Message state contract

- `messages` 是单一消息源。
- `ChatMessage.timestamp` 按当前实现应传 `Date`。
- 用户发送时先 append user message，再处理 assistant。
- assistant 流式输出时设置 `isStreaming: true`。
- 在 `onMessageStreamingComplete(messageId)` 里把对应消息改回 `isStreaming: false`。

## AgentPanel visual status contract

- `AgentPanel` 默认是 `AIPanel`：无 chat input 的展示型对话窗口，`showInput` 默认值是 `false`。
- 如果要保留输入区，优先判断这是不是应该叫 `Chat` 并改用 `StdChat`；只有明确需要例外时才显式传 `showInput={true}`。
- `agentStatus` 支持：`idle | running | success | error | pending`。
- 当 `agentStatus` 未传时，会回退到 `isResponding` 推导（响应中 => `running`，否则 `idle`）。
- `agentStatus` 只负责 `AgentPanel` 自身状态视觉。
- `onHeaderPointerDown` 只把 header pointer 事件交给外层；拖拽、定位、吸附、resize 都不属于 `AgentPanel` 内部状态。
- 浏览器边框柔光必须通过独立 `AIBrowserGlow active={isRunning}` 控制，不要把全局浏览器边框效果塞回 `AgentPanel`。

## AIBrowserGlow contract

- `AIBrowserGlow` 是 viewport 级别柔光层，应该由业务 AI 运行态控制。
- 默认颜色是 RGB 三色；需要改色时只传 3 个颜色：`colors={['#ff3860', '#24e070', '#3090ff']}`。
- `zIndex` 默认是 viewport 顶层级别；只有被宿主 overlay 遮挡时才覆盖。
- AI 结束、失败、中断时必须把 `active` 改回 `false`。
- 它不承载消息、输入、streaming、panel header 或 agent 状态文案。

## Card hooks contract

- 卡片动作统一使用 `cardHooks.onCardEvent`。
- 事件对象至少关注：
  - `messageId`
  - `cardType`
  - `action`
  - `payload`
- 不要把业务逻辑直接绑到 `MarkdownRenderer` 或 `DynamicCardRenderer`。

## Copilot shell boundary

- `CopilotChat` 不负责：
  - 悬浮按钮
  - 打开/关闭状态
  - 绝对定位
  - 拖拽
  - 吸附角
  - resize
- 这些必须由页面外壳负责。

## Resizable copilot constraint

如果做可拖拽/可缩放 copilot：

- resize 期间关闭 transition。
- resize 期间避免 `ResizeObserver` 回写尺寸状态。
- pointer up 后再恢复 observer 同步。

否则容易出现“位置变了，尺寸又被改回去”的假象。

## Voice input boundary

- `VoiceInputButton` 内部依赖 `AINav` 的 `useVoiceInput`。
- 这不是 AgentUI 对外稳定 hook，不要让业务代码直接依赖这条内部链路。
