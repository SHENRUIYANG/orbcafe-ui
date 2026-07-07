---
name: orbcafe-agentui-chat
description: Build ORBCAFE AgentUI experiences with AIPanel/AgentPanel as the no-input AI dialogue window, AgentPanel status visuals and optional draggable header, AIBrowserGlow viewport AI-running effect, StdChat as the input-included Chat surface, CopilotChat content inside a host shell, ChatMessage streaming flow, and AgentUICardHooks using official Next.js examples patterns. Use for AIPanel, browser-edge Glow, full chat, floating copilot, streaming replies, markdown/cards rendering, and when chat UI appears but send, stream, glow, card actions, drag, or resize behavior has no effect.
---

# ORBCAFE AgentUI Chat

详细人工说明见：`skills/orbcafe-agentui-chat/README.md`

## 这个 Skill 解决什么

用于 ORBCAFE AgentUI / 聊天类 UI 的组件接入与修复，先固定术语边界：`AIPanel` 是无 chat input 的 AI 对话窗口，`Chat` 是包含输入区的聊天体验。覆盖：

- `AgentPanel`（也叫 `AIPanel`：无 chat input 的 AI 对话窗口/消息展示面板，支持状态点和面板状态视觉）
- `AIBrowserGlow`（独立浏览器边框柔光层，AI 运行时由业务状态调用）
- `StdChat`（也叫 `Chat` 的标准实现：消息区 + 输入区）
- `CopilotChat`（浮窗内容层，壳层由页面控制）
- `ChatMessage` streaming 状态流
- `AgentUICardHooks` 卡片事件回传

## 何时必须用这个 Skill

- 用户明确提到 `AIPanel`、`AI Panel`、`AgentPanel`、`Chat`、`StdChat`、`CopilotChat`、copilot。
- UI 渲染出来但交互“没效果”（发送无效、stream 不动、卡片按钮无响应）。
- 需要 `AIPanel` / 展示型 AI 对话窗口（只看消息，不要 chat input）。
- 需要 agent 运行状态视觉反馈，或需要 AI 运行时浏览器边框柔光。
- 需要 AgentPanel header 拖拽时，通过 `onHeaderPointerDown` 交给外层壳处理；不要把拖拽状态放进消息组件。

## 工作流（必须执行）

1. 对照 `skills/orbcafe-ui-component-usage/references/module-contracts.md`，确认是 `Component-first`。
2. 读取 `references/component-selection.md`，先选组件再写代码。
3. 参考 `references/recipes.md` 输出最小可运行代码，只用 `orbcafe-ui` 公共 API。
4. 参考 `references/guardrails.md` 检查状态契约与边界（streaming、card hooks、copilot 外壳、AgentPanel 视觉状态、AIBrowserGlow 浏览器边框柔光）。
5. 执行 `skills/orbcafe-ui-component-usage/references/integration-baseline.md`：默认按 Next.js App Router + 官方 examples 接入；非 Next 项目先标记为偏离基线，不要静默改成 Vite/CRA 范式。
6. 给出验收步骤和“没效果”排障。

## Canonical Setup

先检查宿主 `package.json`，缺失或版本不兼容时才安装：

```bash
npm install orbcafe-ui @mui/material@^7.3.9 @mui/icons-material@^7.3.9 @mui/x-date-pickers@^8.27.2 @emotion/react@^11.14.0 @emotion/styled@^11.14.1 dayjs@^1.11.20 lucide-react@^0.575.0 tailwind-merge@^3.5.0 clsx@^2.1.1 class-variance-authority@^0.7.1 @radix-ui/react-slot@^1.2.4
```

官方 examples 不随 npm 包发布。消费项目没有 `examples/` 时，到 ORBCAFE GitHub 仓库或本地 ORBCAFE 源码仓库对照。

本仓库联调：

```bash
npm run build
cd examples
npm install
npm run dev
```

优先参考实现（按场景）：

- `AIPanel` / `AgentPanel`：`examples/app/aipanel/AIPanelExampleClient.tsx`
- `examples/app/chat/ChatExampleClient.tsx`
- `examples/app/copilot/CopilotExampleClient.tsx`
- `src/components/AgentUI/README.md`

## 组件选型默认策略

- 需要 `AIPanel`（无 chat input 的 AI 对话窗口）：优先 `AgentPanel`，保持默认 `showInput={false}`
- 需要标题区 + 状态化工作台展示：优先 `AgentPanel`
- 需要 `Chat`（消息区 + 输入区）：优先 `StdChat`
- 不要把带输入框的完整聊天体验称为 `AIPanel`
- 浮窗助手：`CopilotChat`（外壳自己做）

## 输出规范（对用户回复必须包含）

1. `Mode`：`Component-first`
2. `Decision`：为什么选 `AgentPanel` / `StdChat` / `CopilotChat`，并明确 `AIPanel = AgentPanel without chat input`、`Chat = input-included chat surface`，以及是否需要叠加 `AIBrowserGlow`
3. `Minimal code`：可直接粘贴运行，且只从 `orbcafe-ui` 导入
4. `State shape`：
   - 基础：`messages`、`isResponding`
   - AgentPanel 状态化：`agentStatus`
   - 浏览器边框柔光：`AIBrowserGlow active={isResponding}` 或等价 AI 运行态，可选 `colors` / `zIndex`
   - Copilot：`isOpen`、`panelPosition`、`panelSize`、`corner`
5. `Verify`：至少 3 条可执行验收步骤
   - AgentPanel 状态化必须覆盖：状态切换；浏览器边框柔光必须覆盖 `AIBrowserGlow active` 切换
   - Copilot 必须覆盖：打开/关闭、拖拽、缩放
6. `Troubleshooting`：至少 3 条“看得到但没效果”排查项

## 关键约束（默认遵守）

- 术语边界：`AIPanel` 指无 chat input 的 AI 对话窗口；不要把 `AIPanel` 说成带输入框的完整 chat。
- `Chat` 指带输入区的聊天体验；标准组件优先用 `StdChat`。
- `StdChat` 的 `showInput` 可控制输入区，默认显示。
- `AgentPanel` 默认 `showInput=false`，是 `AIPanel` / 展示型对话窗口。
- `AgentPanel` 支持 `onHeaderPointerDown`，但只透出 header pointer 事件；拖拽/定位仍由外层负责。
- `AgentPanel` 的 `agentStatus` 驱动面板状态视觉；浏览器边框柔光使用独立的 `AIBrowserGlow`。
- `CopilotChat` 只负责内容，不负责壳（开关/定位/拖拽/缩放）。
- streaming 基线：append assistant message 时 `isStreaming=true`，在 `onMessageStreamingComplete` 改回 `false`。
- `ChatMessage.timestamp` 推荐传 `Date`；避免首屏 SSR 用 `Date.now()` 直接决定结构。
- 卡片事件统一走 `cardHooks.onCardEvent`，不直接耦合内部 renderer。
