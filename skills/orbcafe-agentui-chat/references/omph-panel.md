# OMPHPanel

`OMPHPanel` 是 ORBCAFE 里和 DeepSeek Harness 会话栏对齐的对话面板。样式用 ORBIS（`orb-omph-*` 与 `--orb-*`）。它不替换 `AgentPanel`。

官方示例：`examples/app/omph-panel/OMPHPanelExampleClient.tsx`，路由 `/omph-panel`。输入 `test` 会增量流出过程行、文件链接和九种指标图卡。示例上的 Panel width（1120 / 760 / 420）和 Preview（auto / split / overlay）用来在同一页看并排和覆盖，不必改窗口。

只从 `orbcafe-ui` 导入。实现在 `src/components/AgentUI/omph/`，不要从那里导入。

## 什么时候用

用 `OMPHPanel`：

- 要轮次、过程行（推理 / 工具 / 命令）、失败行、用量
- 流式内容由宿主一段段追加，而不是组件自己做打字机
- 运行态在正文末尾（分隔线、spinner、扫光、已用时长）
- 贴底跟随、离开底部后回到底部、加载更早轮次、轮次轨道
- 助手 Markdown 里继续用 `metric-chart-card`
- 助手回复里的文件链接要在面板内预览

继续用 `AgentPanel`：

- 扁平的 `user | assistant` 字符串消息
- 组件内打字机（`isStreaming` + `onMessageStreamingComplete`）
- 默认无输入框的展示窗

不要用 `OMPHPanel` 去替换已有的 `AgentPanel` 页面。

## 宿主拥有什么

组件不调用模型，不读文件系统，不持有对话。宿主拥有：

- `turns`
- `agentStatus` 与 `isResponding`（两者分开，见下）
- 追加、停止、失败、用量
- `loadFilePreview`（可选）
- `onSend` / `onStop` / `onLoadOlder`

`onSend` 不会自己追加消息。宿主在回调里写入用户轮次，再追加过程行和助手正文。

## 轮次

```ts
interface OMPHTurn {
  id: string
  startedAt?: number
  user?: { id: string; content: string; timestamp: Date; streaming?: boolean }
  process?: OMPHProcessItem[]
  assistant?: { id: string; content: string; timestamp: Date; streaming?: boolean }
  failure?: { id: string; severity: 'warning' | 'error'; content: string }
  usage?: { inputTokens?: number; outputTokens?: number; durationMs?: number }
}

interface OMPHProcessItem {
  id: string
  kind: 'reasoning' | 'tool' | 'command'
  title: string
  summary?: string
  content?: string
  status: 'pending' | 'running' | 'success' | 'error'
  streaming?: boolean
}
```

- `timestamp` 传 `Date`。首屏用固定时间，不要用 `Date.now()` 决定结构。
- `startedAt` 是毫秒时间戳。只有本轮仍有 `streaming` 或 `running` / `pending` 的过程行时，运行条才用它算时长。已结束的轮次不会拿旧的 `startedAt` 一直走表。
- 同一 `id` 的过程行就地更新。工具调用用稳定 id（例如桥上的 `callId`），不要每条 delta 新建一行。
- 助手 `content` 是 Markdown。指标图卡放完整 `json` 代码块，契约与 `AgentPanel` 相同。
- 没有 `onBranch`。不要做「从这里分支」按钮。

## 状态

`agentStatus`：`idle | pending | running | success | error`。不传时用 `isResponding` 回退成 `running` 或 `idle`。

| 状态 | 头部 | 正文末尾 |
| --- | --- | --- |
| `pending`、`running` | 圆点脉冲，副标题是状态名 | 分隔线 + spinner + 扫光文案；有进行中的轮次才显示「已进行 …」 |
| `success`、`error`、`idle` | 只改副标题文字 | 不显示运行条 |

`isResponding` 只影响内置输入条：打开 `showInput` 后，响应中且草稿为空时主按钮是停止；草稿有字时仍是发送。手动把 `agentStatus` 改成 `idle` 不会取消请求，停止要靠 `onStop`。

默认文案是英文（Working、Pending…）。用 `labels` 覆盖，不要改组件源码。`labels` 是 `Partial<OMPHPanelLabels>`，缺的键用默认值。

## 流式

宿主追加已经到达的全文，并把 `streaming: true`。组件直接渲染这份全文，并在末尾画光标。不要再套一层打字机，也不要等整段结束才第一次 `setTurns`。

结束时把该条 `streaming` 改成 `false`，再写入 `usage`。停止时作废进行中的定时器或请求，把仍在 `streaming` / `running` 的过程行收成终态，助手 `streaming` 改为 `false`，已收到的文字留下。

未闭合的 Markdown 会先按普通文本画出来。指标图卡要等 `json` 围栏闭合才变成卡片。闭合的 `html` 围栏放进沙箱 iframe 里直接运行，脚本不能读宿主页面。围栏没闭合前仍按代码显示。若业务契约要求「未闭合 JSON 不展示」，在写入 `assistant.content` 之前自己缓冲，不要指望面板藏起来。

## 过程行

`processDisplay` 默认 `standard`。

| 值 | 已完成的过程行 | 摘要 |
| --- | --- | --- |
| `compact` | 收起 | 不显示 |
| `standard` | 收起 | 显示 |
| `detailed` | 收起 | 显示 |
| `expanded` | 展开 | 显示 |

`running`、`pending`、`streaming` 的行默认展开。用户手动开合会被记住，切模式不会清掉。

## 操作条

助手 `streaming` 变为 `false` 之后，回复下方出现一条浅底色操作条：

- 左：时间
- 有 `usage` 时：细分隔线，然后是 Usage。点开后，Input / Output / Duration 在同一条里用发丝线隔开
- 右：复制。复制的是助手 Markdown 原文

最新一轮常显。更早的轮次在悬停或键盘聚焦时显示；没有悬停的设备始终显示。没有「分支」按钮。

条和回复的间距是 `--orb-omph-actions-gap`（默认 6px）。条的底色是 `--orb-surface`。

## 滚动

- 读者在底部时，新内容把滚动位置推到底。
- 离开底部后出现回到底部，不再跟随。
- `hasOlder` 且传了 `onLoadOlder` 时，顶部有「加载更早」。内容高出一屏并且读者滚到顶部时也会调用。插入更早轮次后保持当前阅读位置。
- 正文宽于 900px 时，左侧有轮次刻度，点一下跳到该轮。

## 外观

- 回复正文是 Montserrat 500、14px、行高 1.6。深色底不要用 300。
- 面板圆角是 `--orb-shell-radius`（24px），和 `InputArea` 相同。
- 正文滚动条的滑槽是 `--orb-canvas`，滑块是前景色混进画布，不用系统灰。
- 宽于 900px 时，轮次刻度在左侧。

## 审批

和 Harness 一样，待确认的越权操作换掉输入区，不插进回复。宿主渲染 `OMPHApprovalCard` 时不要同时渲染 `InputArea`。

```ts
interface OMPHApprovalChoice {
  id: string
  label: string
  description?: string
}

interface OMPHApprovalRequest {
  id: string
  toolName: string
  callId?: string
  reason?: string
  detail?: string
  choices?: OMPHApprovalChoice[]
  allowOther?: boolean
}

type OMPHApprovalDecision =
  | { kind: 'allowed-once' }
  | { kind: 'rejected' }
  | { kind: 'choice'; choiceId: string }
  | { kind: 'other'; text: string }
```

- `reason` 是标题。没有标题时用 `Tool {toolName} requests privileged execution`。
- `detail` 是等宽的命令或工具详情。
- 没有 `choices` 时，按钮是「允许一次」和「拒绝」。
- 有 `choices` 时改成单选。`allowOther` 缺省为 true，最后一项是 Other，选中后才出现输入框。空文本不能提交。
- 决定是 `choice` 或 `other`。仍然可以点拒绝，得到 `rejected`。没有「以后都允许」。
- 详情区聚焦后 Enter 提交当前选择；没有选项时 Enter 是允许一次。Esc 拒绝。焦点在按钮或 Other 输入框上时不拦截。
- 作答后按钮锁住。撤掉请求或换成新 `id` 之前不能再答。
- 停止或重置必须撤掉卡片，并让正在等待的决定失效。
- 示例 `test` 给出三条完整恢复选项，并允许 Other。选中后的回复按选项分开写完。

## 回复里的 HTML

助手 Markdown 里闭合的 `html` 或 `htm` 围栏会渲染成可交互演示，外框标题是 Interactive HTML。这是回复渲染，不是文件预览。

- 内容放在沙箱 iframe 里，只允许脚本，不开同源。脚本不能读宿主页面、cookie 或父页面 DOM。
- 完整 HTML 文档原样运行。没有 `<html>` 的片段会包进最小文档。
- 演示页把自己的高度报回来，显示高度限制在 160–560px。
- 围栏还没闭合时仍按代码显示。不要把 HTML 直接写进 Markdown 正文，指望它在宿主页面里执行。
- 长回复会贴底跟随。把演示放在回复末尾，流完后读者才能看到。示例 `test` 的每条回复末尾都有 Recovered hours 演示。

## 输入

面板默认只有回复。`showInput` 默认 `false`。

输入是单独的 `InputArea`。`StdChat` 是已经把消息列表和 `InputArea` 装在一起的聊天容器，不要把那条输入再做进 `OMPHPanel`。示例把 `InputArea` 放在面板下方，发送和停止仍由宿主处理。

打开内置输入条时：Enter 发送，Shift+Enter 换行。输入法组合期间的 Enter 不发送。纯空白不发送。`onSend` 抛错时，若用户还没打新字，草稿会回到发送前的内容。

## 卡片

助手正文走和 `AgentPanel` 同一套 Markdown / `metric-chart-card`。`cardHooks.onCardEvent` 的 `messageId` 是助手消息的 `id`。

- 点击条目、切换图表：`action`
- 悬停约 1 秒或右键 Show data：`show-data`

`show-data` 只展示已有数据点，不要拿它做跳转或写入。

## 文件预览

不传 `loadFilePreview` 时，链接保持浏览器默认行为。传入之后，助手回复里被判定为文件的链接会打开预览。修饰键点击（Cmd / Ctrl / Shift / Alt）不拦截。

默认 `resolveFileLink` 是 `parseOmphFileHref`：

- 相对路径、以 `/` 开头的路径是文件
- `https:`、`mailto:`、`#` 锚点、协议相对 `//` 不是文件
- `#L24` 与 `#L24-L30` 变成 `startLine` / `endLine`（从 1 计，结束行包含在内）

```ts
loadFilePreview: (ref: OMPHFileRef, signal: AbortSignal) => Promise<OMPHFilePreviewData>

interface OMPHFileRef {
  path: string
  startLine?: number
  endLine?: number
}

type OMPHFileBody =
  | { kind: 'markdown'; text: string }
  | { kind: 'code'; text: string; language?: string }
  | { kind: 'image'; url: string; alt?: string }
  | { kind: 'missing'; message?: string }
  | { kind: 'unsupported'; message?: string }
```

返回值：

- 读成功：`markdown`、`code` 或 `image`。`code.language` 可省略，面板按扩展名判断。
- 文件不存在：返回 `{ kind: 'missing' }`，不要 throw。界面只有说明，没有重试。
- 类型无法预览（PDF、Office、Excel、压缩包、HTML）：返回 `{ kind: 'unsupported' }`。若同时传了 `onOpenFileExternally`，界面给出「在外部打开」，由宿主真正打开。
- 暂时失败（网络、权限、超时）：throw。界面给重试。取消造成的中止会被忽略。

`signal` 在切换文件、关闭、卸载时中止。过期响应不要再写进自己的状态；面板自己也会丢掉过期结果。同一路径再次打开只更新行区间，不重新读取。

布局看的是面板自己的宽度，不是屏幕宽度。`filePreviewLayout` 默认 `auto`。

| 模式 | 行为 |
| --- | --- |
| `auto` | 宽度 ≥ 880px 时并排，否则覆盖 |
| `split` | 尽量并排；对话列加预览列放不下时仍覆盖 |
| `overlay` | 始终盖住正文 |

并排：预览在右侧，默认约 45% 宽，最少 320px，最多 70%，对话列至少留 400px。左侧把手可拖；把手获得焦点后 ← / → 每次 24px，Home / End 到下限或上限。展开会铺满正文区，再点恢复。

覆盖：预览盖住对话和输入。被盖住的一列是 `inert`。用返回键或 Esc 关闭。关闭后焦点回到刚才点的链接。

面板宽度 &lt; 560px 时，头部、正文和预览的间距收紧。

查看器：

- 代码：行号、命中行高亮、换行开关。超过 2000 行只画前 2000 行并提示。有行区间时，起始行滚到视口上三分之一。
- Markdown：阅读列，复用 AgentUI Markdown。
- 图片：默认适应宽度且不放大；缩放档位 25%–400%。`url` 由宿主给（blob、data 或 http）。

不做：PDF、Office、Excel、把 `.html` 文件当成预览页打开、多标签、文件变更自动刷新、悬停缩略图。回复里的 `html` 围栏另见「回复里的 HTML」。

## 和 OMPH / DSH 的边界

`OMPHPanel` 不是 DSH 插件，也不能直接接 `window.ORBAIRuntime.agent`。业务页在 OMPH 里只能走这座桥：`prompt`、`cancel`、`getHistory`、`onEvent`。桥上没有读文件的方法，文件字节要宿主自己拿，再交给 `loadFilePreview`。

若宿主自己写适配层，事件可以这样落：

| 桥事件 | 写入 |
| --- | --- |
| `status: running` | 新开一轮，`startedAt = Date.now()`，`agentStatus = 'running'`，`isResponding = true` |
| `text-delta` | 追加到当前轮助手 `content`，`streaming: true` |
| `tool-call` | 以 `callId` 新建 `kind: 'tool'`、`status: 'running'` |
| `tool-result` | 同一 `callId` 更新为 `success` 或 `error`，摘要放 `text` |
| `reasoning-delta` | 只显示中性标题，例如「正在组织分析路径」。不要把 `text` 放进过程行 |
| `error` | 本轮 `failure`，已有正文保留 |
| `status: idle` | `streaming` 全部改 false。`reason` 见下 |
| 停止按钮 | `agent.cancel()`，不要只改本地状态 |

当前 OMPH Electron 桥里，`idle` 的 `reason` 来自 DSH `turn/end` 的 `reason.kind`（例如 `completed`、`error`），取消确认则是 `cancelled`，取消未完成时可能是 `interrupted`。适配时以目标宿主源码为准，不要写死一份旧表。

桥没有用量，没有分支。历史是 `{ kind: 'user' | 'assistant' | 'tool' }` 的扁平列表，没有时间戳和轮次号；还原时要自己切轮，时间用会话恢复时刻或省略。

面板没有 `CANCELLING`。审批不画在回复里，见下面的「审批」。

## 最小接法

```tsx
import { useState } from 'react'
import { InputArea, OMPHPanel, type OMPHPanelStatus, type OMPHTurn } from 'orbcafe-ui'

const [turns, setTurns] = useState<OMPHTurn[]>([])
const [status, setStatus] = useState<OMPHPanelStatus>('idle')
const [isResponding, setIsResponding] = useState(false)

async function handleSend(content: string) {
  const id = crypto.randomUUID()
  setStatus('running')
  setIsResponding(true)
  setTurns((current) => [...current, {
    id,
    startedAt: Date.now(),
    user: { id: `${id}-user`, content, timestamp: new Date() },
    assistant: { id: `${id}-assistant`, content: '', timestamp: new Date(), streaming: true },
  }])
  try {
    // 每拿到一块文本，把 assistant.content 换成「到目前为止的全文」
  } finally {
    setTurns((current) => current.map((turn) => turn.id === id && turn.assistant
      ? { ...turn, assistant: { ...turn.assistant, streaming: false } }
      : turn))
    setIsResponding(false)
    setStatus('idle')
  }
}

<>
  <OMPHPanel
    title="Data Analysis Agent"
    description="Plant 1000 context"
    turns={turns}
    agentStatus={status}
    isResponding={isResponding}
  />
  <InputArea
    onSend={handleSend}
    onStop={() => { /* 取消请求，并清掉 streaming */ }}
    isResponding={isResponding}
  />
</>
```

文件预览在此基础上加 `loadFilePreview`。示例数据与加载函数见 `examples/app/omph-panel/omphDemoWorkspace.ts`。

## 验收

1. 发送后先出现用户气泡，再出现增长中的助手正文，而不是等整段结束才一次性出现。
2. `running` 时头部圆点在动，正文末尾有运行条；结束后运行条消失，操作条出现。
3. 向上滚动后新内容不再把视口拽走，回到底部可以恢复跟随。
4. 回复里的 `json` 图卡能点，事件进 `cardHooks.onCardEvent`。
5. 若启用预览：宽面板里文件在右侧打开；把面板缩到 880px 以下后，同一链接改为盖住正文；Esc 关闭且焦点回到链接。
6. 缺失文件没有重试；读取失败有重试；不支持的类型只有在传了 `onOpenFileExternally` 时才有外部打开。

## 看得到但没效果

- 链接点了没预览：没传 `loadFilePreview`，或地址被当成普通 URL。
- 预览一直在转：宿主没 resolve，或没理会 `signal`。
- 停止后字还在跳：宿主的追加循环没被作废，`streaming` 仍是 `true`。
- 运行条没有时长：这一轮已经没有 `streaming` / `running` 过程行。强制把状态改成 `running` 不会复活旧轮次的时钟。
- 图卡不出现：`json` 围栏还没闭合，或 JSON 里有函数、注释。
- HTML 还是一坨代码：围栏还没闭合，或看的不是回复末尾。闭合后应出现 Interactive HTML。
- 操作条离正文很远：宿主样式覆盖了 `--orb-omph-actions-gap` 或 `.orb-omph-turn-actions`。
