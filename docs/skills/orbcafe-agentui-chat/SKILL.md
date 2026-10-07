---
name: orbcafe-agentui-chat
description: Build ORBCAFE AgentUI experiences with AIPanel/AgentPanel as the no-input AI dialogue window, OMPHPanel as the Harness-aligned turn transcript with process rows, incremental streaming, scroll-follow and opt-in file preview, AgentPanel status visuals and optional draggable header, AIBrowserGlow viewport AI-running effect, StdChat as the input-included Chat surface, CopilotChat content inside a host shell, ChatMessage streaming flow, and AgentUICardHooks using official Next.js examples patterns. Use for OMPHPanel, AIPanel, browser-edge Glow, full chat, floating copilot, streaming replies, markdown/cards rendering, file preview inside the agent panel, and when chat UI appears but send, stream, glow, card actions, drag, or resize behavior has no effect.
---

# ORBCAFE AgentUI Chat

详细人工说明见：`skills/orbcafe-agentui-chat/README.md`

## Current usage contract

Before implementing this module, read [references/contract.md](references/contract.md) for input shapes, state ownership, callback arguments, defaults and current limitations. Check the consuming project's installed exports against this source contract; the repository can be ahead of npm.

## 这个 Skill 解决什么

用于 ORBCAFE AgentUI / 聊天类 UI 的组件接入与修复，先固定术语边界：`AIPanel` 是无 chat input 的 AI 对话窗口，`Chat` 是包含输入区的聊天体验。覆盖：

- `AgentPanel`（也叫 `AIPanel`：无 chat input 的 AI 对话窗口/消息展示面板，支持状态点和面板状态视觉）
- `OMPHPanel`（和 Harness 会话栏对齐的轮次面板：过程行、增量流式、贴底滚动、可选文件预览。不替换 `AgentPanel`）
- `FloatingAgentPanel`（可选的现成浮层壳：水平拖动 + 左/中/右吸附；open/close、自由 XY、resize 仍由宿主负责）
- `AIBrowserGlow`（AI 运行时浏览器视口边缘 2px primary 描边，无彩色光晕；由业务状态调用）
- `StdChat`（也叫 `Chat` 的标准实现：消息区 + 输入区）
- `CopilotChat`（浮窗内容层，壳层由页面控制）
- `ChatMessage` streaming 状态流
- `AgentUICardHooks` 卡片事件回传

## 何时必须用这个 Skill

- 用户明确提到 `OMPHPanel`、`OMPH Agent Panel`、`AIPanel`、`AI Panel`、`AgentPanel`、`Chat`、`StdChat`、`CopilotChat`、copilot。
- 需要轮次、过程行、增量流式、贴底滚动，或要在对话面板里预览文件。
- UI 渲染出来但交互“没效果”（发送无效、stream 不动、卡片按钮无响应、文件链接打不开预览）。
- 需要 `AIPanel` / 展示型 AI 对话窗口（只看消息，不要 chat input）。
- 需要 agent 运行状态视觉反馈，或需要 AI 运行时浏览器视口边缘线。
- 需要 AgentPanel header 拖拽时，通过 `onHeaderPointerDown` 交给外层壳处理；不要把拖拽状态放进消息组件。

## 工作流（必须执行）

1. 对照 `skills/orbcafe-ui-component-usage/references/module-contracts.md`，确认是 `Component-first`。
2. 读取 `references/component-selection.md`，先选组件再写代码。选了 `OMPHPanel` 时，写代码前读完 `references/omph-panel.md`。
3. 参考 `references/recipes.md` 输出最小可运行代码，只用 `orbcafe-ui` 公共 API。`OMPHPanel` 用其中的 Recipe 5。
4. 参考 `references/guardrails.md` 检查状态契约与边界（streaming、card hooks、copilot 外壳、AgentPanel 视觉状态、OMPHPanel 轮次与文件预览、AIBrowserGlow 视口边缘线）。
5. 执行 `skills/orbcafe-ui-component-usage/references/integration-baseline.md`：默认按 Next.js App Router + 官方 examples 接入；非 Next 项目先标记为偏离基线，不要静默改成 Vite/CRA 范式。
6. 给出验收步骤和“没效果”排障。

## Canonical Setup

先检查宿主 `package.json`，缺失或版本不兼容时才安装：

```bash
npm install orbcafe-ui
# ORBCAFE UI v3 是 MUI-free；不要安装 @mui/*、@emotion/*、lucide-react。
# 组件使用 Tailwind utility classes，宿主需要 Tailwind v4：
npm install -D tailwindcss @tailwindcss/postcss
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
- `OMPHPanel`：`examples/app/omph-panel/OMPHPanelExampleClient.tsx`
- `examples/app/chat/ChatExampleClient.tsx`
- `examples/app/copilot/CopilotExampleClient.tsx`
- `src/components/AgentUI/README.md`

## 组件选型默认策略

- 需要 `AIPanel`（无 chat input 的 AI 对话窗口）：优先 `AgentPanel`，保持默认 `showInput={false}`
- 需要和 Harness 会话栏对齐的轮次、过程行、增量流式、贴底滚动或面板内文件预览：用 `OMPHPanel`，并先读 `references/omph-panel.md`。不要拿它替换已经接好的 `AgentPanel`
- 需要标题区 + 状态化工作台展示，且消息仍是扁平 `ChatMessage[]`：优先 `AgentPanel`
- 需要 `Chat`（消息区 + 输入区）：优先 `StdChat`
- 不要把带输入框的完整聊天体验称为 `AIPanel`
- 浮窗助手：若只需要 `AgentPanel` 的有限浮层行为，选 `FloatingAgentPanel`；若需要 open/close、自由定位、resize 或自定义 header，选 `CopilotChat` 并由外层自己做壳

## 输出规范（对用户回复必须包含）

1. `Mode`：`Component-first`
2. `Decision`：为什么选 `OMPHPanel` / `AgentPanel` / `StdChat` / `CopilotChat`，并明确 `AIPanel = AgentPanel without chat input`、`Chat = input-included chat surface`、`OMPHPanel = 宿主持有的轮次面板`，以及是否需要叠加 `AIBrowserGlow`
3. `Minimal code`：可直接粘贴运行，且只从 `orbcafe-ui` 导入
4. `State shape`：
   - 基础：`messages`、`isResponding`
   - AgentPanel 状态化：`agentStatus`
   - OMPHPanel：`turns`、`agentStatus`、`isResponding`；启用预览时还有 `loadFilePreview`
   - 浏览器视口边缘线：`AIBrowserGlow active={isResponding}` 或等价 AI 运行态（2px primary 描边；`colors` 仅兼容保留）
   - Copilot：`isOpen`、`panelPosition`、`panelSize`、`corner`
5. `Verify`：至少 3 条可执行验收步骤
   - AgentPanel 状态化必须覆盖：状态切换；视口边缘线必须覆盖 `AIBrowserGlow active` 切换
   - OMPHPanel 必须覆盖：增量追加后正文变长、运行条随 `running` 出现并在结束后消失、离开底部后不再跟随
   - 启用了文件预览时再覆盖：宽面板并排、窄面板覆盖、Esc 关闭并把焦点还给链接
   - Copilot 必须覆盖：打开/关闭、拖拽、缩放
6. `Troubleshooting`：至少 3 条“看得到但没效果”排查项

## 关键约束（默认遵守）

- 术语边界：`AIPanel` 指无 chat input 的 AI 对话窗口；不要把 `AIPanel` 说成带输入框的完整 chat。
- `Chat` 指带输入区的聊天体验；标准组件优先用 `StdChat`。
- `StdChat` 的 `showInput` 可控制输入区，默认显示。
- `AgentPanel` 默认 `showInput=false`，是 `AIPanel` / 展示型对话窗口。
- `OMPHPanel` 默认 `showInput=false`，只放回复。输入用 `InputArea` 放在面板外；完整聊天用 `StdChat`。宿主拥有 `turns`。`streaming: true` 表示宿主还在追加，组件不再做打字机。
- `OMPHPanel` 没有分支按钮，也没有 `onBranch`。
- `OMPHPanel` 的文件预览只有在传入 `loadFilePreview` 后才启用。面板不读文件系统。细节以 `references/omph-panel.md` 为准。
- 助手回复里闭合的 `html` / `htm` 围栏渲染成沙箱中的可交互演示，标题为 Interactive HTML。围栏未闭合时仍是代码。不要把 HTML 脚本插进宿主页面。
- 人工确认用 `OMPHApprovalCard` 换掉 `InputArea`。没有 `choices` 时只有允许一次和拒绝；有 `choices` 时是单选，并可带 Other 输入。不要把审批画进回复正文。
- `AgentPanel` 支持 `onHeaderPointerDown`，但只透出 header pointer 事件；拖拽/定位仍由外层负责。
- `AgentPanel` 的 `agentStatus` 驱动面板状态视觉（状态点 + 工作状态行）；视口边缘线使用独立的 `AIBrowserGlow`。
- `CopilotChat` 只负责内容，不负责壳（开关/定位/拖拽/缩放）。
- streaming 基线：append assistant message 时 `isStreaming=true`，在 `onMessageStreamingComplete` 改回 `false`。
- `ChatMessage.timestamp` 推荐传 `Date`；避免首屏 SSR 用 `Date.now()` 直接决定结构。
- 卡片事件统一走 `cardHooks.onCardEvent`，不直接耦合内部 renderer。
