# orbcafe-agentui-chat README

## 目标

这个 skill 用于在 ORBCAFE 项目里快速、稳定地实现 AgentUI / 聊天相关 UI。术语必须先对齐：`AIPanel` 是没有 chat input 的 AI 对话窗口；`Chat` 是包含输入区的聊天体验。

- `AgentPanel`（`AIPanel`：无 chat input 的 AI 对话窗口）
- `OMPHPanel`（Harness 对齐的轮次面板；细节见 `references/omph-panel.md`）
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
- 轮次、过程行、增量流式、贴底滚动、面板内文件预览：`OMPHPanel`
- 整页 agent 展示工作台，消息仍是扁平列表：`AgentPanel`
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

## OMPHPanel

和 Harness 会话栏对齐的轮次面板。宿主拥有 `turns`，组件不打字机、不读文件、不调用模型。操作条是浅底色一行：左时间、中 Usage、右复制。文件预览要传 `loadFilePreview`，宽面板并排，窄面板覆盖。

字段、状态分工、流式、滚动、预览返回值和 OMPH 桥的边界都写在 `references/omph-panel.md`。示例是 `examples/app/omph-panel/OMPHPanelExampleClient.tsx`。

## AIBrowserGlow 边界

- `AIBrowserGlow` 是独立基础组件，不属于 `AgentPanel` 内部效果。
- ORBIS 规范：视口四周 2px primary 描边（无彩色光晕/颜色 wash），只有细微透明度呼吸动画。
- `colors` 属性保留为兼容，只有第一个颜色生效；默认 `--orb-primary`。
- 默认 `zIndex` 很高；只有宿主 overlay 遮挡时才覆盖。
- 只在 AI 工作时让 `active={true}`，结束或中断时改回 `false`。
- 不要把视口边缘线塞回 `AgentPanel`，避免展示型 panel 和全局 AI 运行态耦合。

## 推荐示例

- `examples/app/aipanel/AIPanelExampleClient.tsx`
- `examples/app/omph-panel/OMPHPanelExampleClient.tsx`
- `examples/app/chat/ChatExampleClient.tsx`
- `examples/app/copilot/CopilotExampleClient.tsx`

## 常见“没效果”排查

- 输入框没出现：如果场景是 `AIPanel`，这是预期；`AgentPanel` 默认就是 `showInput=false`。`OMPHPanel` 同样默认没有输入区，把 `InputArea` 放在面板外。如果场景是 `Chat`，应使用 `StdChat`。
- 文件链接没有打开预览：`OMPHPanel` 没传 `loadFilePreview`，或地址是 `https:` / `mailto:`。
- 预览一直加载：宿主的 `loadFilePreview` 没有 resolve，或忽略了 `signal`。
- OMPHPanel 的正文等整段结束才出现：宿主在请求完成前没有把 `assistant.content` 追加进去。`streaming` 不是打字机开关。
- 回复里的 HTML 还是代码：`html` 围栏还没闭合，或看的是文件预览而不是回复围栏。闭合后应出现标题为 Interactive HTML 的演示。长回复会贴底，演示放在末尾才容易看到。
- 审批卡没出现：宿主没有在等待决定时用 `OMPHApprovalCard` 换掉 `InputArea`。卡片不画在回复里面。
- 浏览器视口边缘线没出现：检查是否渲染了 `AIBrowserGlow active={isResponding}`，不要只改 `AgentPanel agentStatus`。
- 视口边缘线一直不消失：检查 success/error/cancel/stop 分支是否都把 `active` 状态改回 `false`。
- stream 不动：检查 assistant message 是否设置了 `isStreaming: true`。
- stream 结束状态没恢复：检查 `onMessageStreamingComplete` 是否回写。
- 卡片点击无回调：检查是否正确传入 `cardHooks.onCardEvent`。
- Copilot 拖不动：确认拖拽逻辑在页面壳层，不在 `CopilotChat` 内部。
