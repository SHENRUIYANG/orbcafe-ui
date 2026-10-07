# AgentUI Guardrails

## Terminology Boundary

- `AIPanel` means `AgentPanel` used as an AI dialogue/message window without chat input.
- `Chat` means an input-included chat experience; use `StdChat` for the standard implementation.
- Do not describe `AIPanel` as including the chat input. If an input bar floats under an `AIPanel`, call it an external composition around `AgentPanel`, not part of `AIPanel` itself.

## Public API only

- 只从 `orbcafe-ui` 导入：
  - `AgentPanel`
  - `OMPHPanel`
  - `FloatingAgentPanel`
  - `StdChat`
  - `CopilotChat`
  - `AIBrowserGlow`
  - `parseOmphFileHref`
  - `type ChatMessage`
  - `type AgentPanelStatus`
  - `type OMPHPanelStatus`
  - `type OMPHTurn`
  - `type OMPHProcessItem`
  - `type OMPHProcessDisplay`
  - `type OMPHFileRef`
  - `type OMPHFilePreviewData`
  - `type OMPHFilePreviewLoader`
  - `type OMPHFilePreviewLayout`
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
- 视口边缘线必须通过独立 `AIBrowserGlow active={isRunning}` 控制，不要把全局浏览器边框效果塞回 `AgentPanel`。

## AIBrowserGlow contract

- `AIBrowserGlow` 是 viewport 级别的 2px primary 边缘线（ORBIS 规范，无彩色光晕），应该由业务 AI 运行态控制。
- `colors` 保留为兼容：只传 3 个颜色时只有第一个生效；默认使用 `--orb-primary`。
- `zIndex` 默认是 viewport 顶层级别；只有被宿主 overlay 遮挡时才覆盖。
- AI 结束、失败、中断时必须把 `active` 改回 `false`。
- 它不承载消息、输入、streaming、panel header 或 agent 状态文案。

## OMPHPanel contract

完整规则在 `references/omph-panel.md`。这里只列会接错的边界：

- 宿主拥有 `turns`。`onSend` 不追加消息，也不调用模型。
- `streaming: true` 表示宿主还在把全文追加进来。组件直接画这份全文，不再做打字机，也没有 `onMessageStreamingComplete`。
- `agentStatus` 管头部圆点和正文末尾运行条。`isResponding` 管输入区是发送还是停止。只改其中一个，另一个不会跟着变。
- 运行条的时长只来自仍在 `streaming` 或 `running` / `pending` 的那一轮的 `startedAt`。
- 过程行用稳定 `id` 就地更新。工具结果不要新建第二行。
- 没有 `onBranch`。不要做分支按钮。
- 操作条是浅底色的一行：左时间、中 Usage、右复制。最新一轮常显，更早的轮次悬停或聚焦才显示。
- 文件预览默认关闭。传入 `loadFilePreview` 才拦截文件链接。文件不存在返回 `{ kind: 'missing' }`；暂时失败才 throw。
- 预览按面板宽度而不是屏幕宽度切换：≥ 880px 并排，更窄则覆盖。覆盖时被盖住的对话列是 `inert`。
- 面板不读文件系统，也不接 `window.ORBAIRuntime.agent`。桥事件要由宿主写成 `OMPHTurn[]`。
- `reasoning-delta` 的原文不要渲染。审批不要画假的批准按钮。

## Card hooks contract

- 卡片动作统一使用 `cardHooks.onCardEvent`。
- `metric-chart-card` 使用 `CMetricChartCard`；条目点击回传 `action`，悬停 1 秒或右键菜单的 `Show data` 回传 `show-data`。
- 事件对象至少关注：
  - `messageId`
  - `cardType`
  - `action`
  - `payload`
- 不要把业务逻辑直接绑到 `MarkdownRenderer` 或 `DynamicCardRenderer`。

## Floating shell boundary

- `FloatingAgentPanel` 只负责水平拖动和左/中/右吸附；它不提供 open/close、自由 XY 拖动或 resize。

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
