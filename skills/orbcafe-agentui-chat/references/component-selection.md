# Component Selection

## Terminology Boundary

- `AIPanel` / `AgentPanel`：无 chat input 的 AI 对话窗口，用于展示消息、agent 状态、结果和卡片。
- `Chat` / `StdChat`：包含输入区的聊天体验，用于用户直接输入并发送消息。
- 如果输入栏悬浮在 `AIPanel` 下方，那是外层组合模式；输入栏不属于 `AIPanel` 本体。

## Use `AgentPanel`

Choose `AgentPanel` when:
- 用户说 `AIPanel` / AI 对话窗口，且不需要 chat input
- 需要标准头部标题和描述
- 对话消息展示区域是页面主体的一部分，但输入区由外部组合或不存在
- 不需要自定义 copilot 浮窗壳
- 需要展示 agent 运行状态（状态点 + 面板状态视觉）
- 需要 AI 工作时浏览器边框柔光时，额外使用 `AIBrowserGlow`
- 需要“只读对话展示”面板（隐藏输入框）；这是 `AIPanel` 的默认语义
- 需要可拖拽 panel header 时，可以传 `onHeaderPointerDown`，但外层壳仍然负责位置和拖拽状态

## Use `StdChat`

Choose `StdChat` when:
- 用户说 `Chat` / 标准聊天页 / 需要输入框
- 已经有自己的页面容器或弹窗容器
- 需要消息区 + 输入区
- 需要 streaming 和 card hooks，但不需要 copilot header/collapse 语义
- 或需要同一组件在不同场景切换输入区（`showInput`）

## Use `CopilotChat`

Choose `CopilotChat` when:
- 要做右下角 copilot 或悬浮助手
- 需要带 header 的轻量面板内容
- 准备自己控制 open/close、position、drag、snap、resize
- 如果只需要无输入的 AI 状态/消息展示，不要选 `CopilotChat`；用 `AgentPanel`

## Do not route here

- 报表、筛选、分页、variant：去 `orbcafe-stdreport-workflow`
- 页面壳层、导航、locale：去 `orbcafe-layout-navigation`
- 详情页、graph、agent settings：去 `orbcafe-graph-detail-ai`
- pivot / AINav 语音导航：去 `orbcafe-pivot-ainav`
