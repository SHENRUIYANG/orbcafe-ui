# orbcafe-agentui-chat README

## 目标

这个 skill 用于在 ORBCAFE 项目里快速、稳定地实现聊天相关 UI：

- `AgentPanel`
- `StdChat`
- `CopilotChat`
- 消息 streaming
- 卡片事件 hooks

## 一分钟上手

1. 先看 `references/component-selection.md` 选组件。
2. 直接套 `references/recipes.md` 最小代码。
3. 按 `references/guardrails.md` 检查状态契约和边界。
4. 用 examples 对照验证视觉和交互。

## 场景到组件

- 整页 agent 工作台：`AgentPanel`
- 展示型面板（无输入框）：`AgentPanel`（默认 `showInput=false`）
- 标准聊天页：`StdChat`
- 悬浮 copilot：`CopilotChat` + 自己的外壳

## AgentPanel 状态化能力

- `agentStatus`：`idle | running | success | error | pending`
- 状态会联动：
  - header 状态点和文案
  - 四边跑马灯边框
  - 彩色光晕

## 推荐示例

- `examples/app/aipanel/AIPanelExampleClient.tsx`
- `examples/app/chat/ChatExampleClient.tsx`
- `examples/app/copilot/CopilotExampleClient.tsx`

## 常见“没效果”排查

- 输入框没出现：检查是否传了 `showInput={false}`（AgentPanel 默认就是 false）。
- stream 不动：检查 assistant message 是否设置了 `isStreaming: true`。
- stream 结束状态没恢复：检查 `onMessageStreamingComplete` 是否回写。
- 卡片点击无回调：检查是否正确传入 `cardHooks.onCardEvent`。
- Copilot 拖不动：确认拖拽逻辑在页面壳层，不在 `CopilotChat` 内部。
