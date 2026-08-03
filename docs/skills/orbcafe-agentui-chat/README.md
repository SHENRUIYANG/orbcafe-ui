# orbcafe-agentui-chat README

## 目标

这个 skill 用于在 ORBCAFE 项目里快速、稳定地实现 AgentUI / 聊天相关 UI。术语必须先对齐：`AIPanel` 是没有 chat input 的 AI 对话窗口；`Chat` 是包含输入区的聊天体验。

- `AgentPanel`（`AIPanel`：无 chat input 的 AI 对话窗口）
- `AIBrowserGlow`
- `StdChat`（`Chat`：消息区 + 输入区）
- `CopilotChat`
- 消息 streaming
- 卡片事件 hooks

## 一分钟上手

1. 先看 `references/component-selection.md` 选组件。
2. 直接套 `references/recipes.md` 最小代码。
3. 按 `references/guardrails.md` 检查状态契约和边界。
4. 用 examples 对照验证视觉和交互。

## 场景到组件

- `AIPanel` / AI 对话窗口（无 chat input）：`AgentPanel`（默认 `showInput=false`）
- 整页 agent 展示工作台：`AgentPanel`
- `Chat` / 标准聊天页（包含输入区）：`StdChat`
- `AgentPanel` 下方悬浮输入栏：这是外层组合模式，不要把输入栏算进 `AIPanel` 本体
- 悬浮 copilot：`CopilotChat` + 自己的外壳
- AI 工作时浏览器视口边缘线：业务层渲染 `AIBrowserGlow`

## AgentPanel 状态化能力

- `agentStatus`：`idle | running | success | error | pending`
- 状态会联动：
  - header 状态点和文案
  - 面板状态视觉
  - 需要浏览器视口边缘线时，业务层单独渲染 `AIBrowserGlow`

## AIBrowserGlow 边界

- `AIBrowserGlow` 是独立基础组件，不属于 `AgentPanel` 内部效果。
- ORBIS 规范：视口四周 2px primary 描边（无彩色光晕/颜色 wash），只有细微透明度呼吸动画。
- `colors` 属性保留为兼容，只有第一个颜色生效；默认 `--orb-primary`。
- 默认 `zIndex` 很高；只有宿主 overlay 遮挡时才覆盖。
- 只在 AI 工作时让 `active={true}`，结束或中断时改回 `false`。
- 不要把视口边缘线塞回 `AgentPanel`，避免展示型 panel 和全局 AI 运行态耦合。

## 推荐示例

- `examples/app/aipanel/AIPanelExampleClient.tsx`
- `examples/app/chat/ChatExampleClient.tsx`
- `examples/app/copilot/CopilotExampleClient.tsx`

## 常见“没效果”排查

- 输入框没出现：如果场景是 `AIPanel`，这是预期；`AgentPanel` 默认就是 `showInput=false`。如果场景是 `Chat`，应使用 `StdChat` 或显式组合外部输入栏。
- 浏览器视口边缘线没出现：检查是否渲染了 `AIBrowserGlow active={isResponding}`，不要只改 `AgentPanel agentStatus`。
- 视口边缘线一直不消失：检查 success/error/cancel/stop 分支是否都把 `active` 状态改回 `false`。
- stream 不动：检查 assistant message 是否设置了 `isStreaming: true`。
- stream 结束状态没恢复：检查 `onMessageStreamingComplete` 是否回写。
- 卡片点击无回调：检查是否正确传入 `cardHooks.onCardEvent`。
- Copilot 拖不动：确认拖拽逻辑在页面壳层，不在 `CopilotChat` 内部。
