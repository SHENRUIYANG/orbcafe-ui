# OMPHPanel

`OMPHPanel` 是 ORBCAFE 里和 DeepSeek Harness 会话栏对齐的对话面板。样式用 ORBIS（`orb-omph-*` 与 `--orb-*`）。它不替换 `AgentPanel`。

官方示例：`examples/app/omph-panel/OMPHPanelExampleClient.tsx`，路由 `/omph-panel`。输入 `test` 会增量流出过程行、文件链接和九种指标图卡。示例上的 Panel width（1120 / 760 / 420）和 Preview（auto / split / overlay）用来在同一页看并排和覆盖，不必改窗口。顶栏右侧可切换明暗，选择存在 `orbcafe:page-layout-mode`，和其他示例页共用。

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
- 会话列表：`conversations`、`activeConversationId`、`onNewConversation`、`onSelectConversation`（可选，见「会话列表」）
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
- 整段换成另一条会话（原来的第一轮不在了）时，重新贴底跟随。头部插入更早轮次仍保持阅读位置。
- `hasOlder` 且传了 `onLoadOlder` 时，顶部有「加载更早」。内容高出一屏并且读者滚到顶部时也会调用。插入更早轮次后保持当前阅读位置。
- 正文宽于 900px 时，左侧有轮次刻度，点一下跳到该轮。

## 外观

- 回复正文是 Montserrat 500、14px、行高 1.6。深色底不要用 300。
- 面板圆角是 `--orb-shell-radius`（24px），和 `InputArea` 相同。
- 面板本体是玻璃：64% canvas 加 28px 磨砂。嵌套浮层（预览、审批详情）保持透明，玻璃由外层提供——半透明叠半透明会变回实心。素背景上玻璃≈实心，泛光或纹理背景上才是玻璃。
- 正文滚动条的滑槽是 `--orb-canvas`，滑块是前景色混进画布，不用系统灰。
- 宽于 900px 时，轮次刻度在左侧。

## 边缘泛光

外壳类随库发布（`orbis.css` 的 `orb-omph-bloom` 一组），不要自己再写一套。居中、背景模糊和泛光都发生在 `OMPHPanel` 外面；面板自己是 `overflow: hidden` 加 `isolation: isolate`，光晕放进卡片会被圆角裁掉。

结构从后到前：

```
orb-omph-bloom
├─ orb-omph-bloom-backdrop        ::before 留给宿主画环境光洗
└─ orb-omph-bloom-center
   ├─ orb-omph-bloom-panel
   │  ├─ orb-omph-bloom-glow      四角径向泛光
   │  └─ orb-omph-bloom-card      内放 OMPHPanel
   └─ orb-omph-bloom-composer     InputArea 或 OMPHApprovalCard
```

宿主只做三件事：在 `backdrop::before` 的 background 上画自己的环境光洗；在 backdrop 本体上画纹理；把 bloom-panel 和 bloom-composer 摆进 center。backdrop 是 42% canvas 加 `blur(18px)`，虚化后面的页面；泛光层每边比面板大 168px，整层 `filter: blur(64px)`；外壳把面板的 `border-color` 设成透明、`box-shadow` 去掉，描边交给泛光，不要两条边抢。

面板本体是玻璃（64% canvas + 28px 磨砂），泛光会透过面板微微可见，这是有意的。bloom-card 里的预览窗格和审批浮层会被置成透明，玻璃由外壳统一提供。

工作态自动联动：面板的 `data-status` 是 `running` 或 `pending` 时，外壳用 `:has()` 把四角泛光换成金色（`#d4af37` 一族），同时环境光洗在 0.6 秒里整体淡出，金光成为唯一光源。宿主也可以手动给外壳加 `.is-working`，效果等价。金色是产品显式要求，超出 CI 色板。

浅色主题四色是 petrol `#00a3a3`（上、左）、蓝（右）、粉 `#db3360`（下），按 58%/58%/48% 混入透明；深色主题加重到 70%/72%/64%，夜里依然读得出光。泛光 `z-index: 0`，卡片 `z-index: 1`；泛光 `pointer-events: none`，不挡点击，宿主给它标 `aria-hidden` 让它离开读屏树。呼吸只改透明度，2.6 秒里在 0.78 和 1 之间循环，不用 `transform`；系统开启「减少动态效果」时动画关掉，光晕保持不透明。

示例页的 Edge glow 开关默认开。关掉后回到普通文档流，面板恢复自己的描边。

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

## 会话列表

宿主拥有每一条会话和它的 `turns`。组件只画入口，不保存会话，也不生成 id。两个回调都不传时，头部保持原来的样子。

```ts
interface OMPHConversation {
  id: string
  title: string
  preview?: string
  updatedAt?: Date
}
```

- `onNewConversation`：头部出现新建。点了之后宿主新建一条空会话，把它设为 `activeConversationId`，并把 `turns` 换成 `[]`。
- `onSelectConversation`：头部出现对话列表。点一条之后宿主换成那条的 `turns`。`conversations` 为空时，列表里是空状态。
- `activeConversationId` 标出当前条。
- 正在回复时能不能切换，由宿主决定。示例会先停掉当前这一轮再换，避免后到的文字写进另一条会话。
- 关掉面板不是组件的事。Header AI 输入条在传入 `onOpenPanel` 后，于面板关闭时出现打开对话按钮，只把宿主的面板重新打开，不发送，也不新建会话。把同一个开关传给 `panelOpen`，面板一打开按钮就隐藏。示例在 `/omph-panel`：关掉面板后再点这个按钮，回来的是同一条会话；从输入条发送则会打开面板并把内容送进当前会话。

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
  | { kind: 'markdown'; text: string; previewOnly?: boolean }
  | { kind: 'code'; text: string; language?: string; previewOnly?: boolean }
  | { kind: 'image'; url: string; alt?: string }
  | { kind: 'embed'; url: string; mimeType?: string; caption?: string }
  | { kind: 'missing'; message?: string }
  | { kind: 'unsupported'; message?: string }
```

返回值：

- 读成功：`markdown`、`code`、`image` 或 `embed`。`code.language` 可省略，面板按扩展名判断。
- 可内嵌的文档（PDF 等）：返回 `{ kind: 'embed', url }`。面板用 iframe 承载浏览器原生查看器，不加 sandbox——插件式查看器会被沙箱挡住，所以 `url` 必须是宿主保证可达且可信的地址。`caption` 可选，作 iframe 标题。浏览器原生只认 PDF；Word/Excel/PPT 想在面板内预览，宿主先转成 PDF（或拼 Office Online viewer 之类查看器 URL）再返回 `embed`，原始 Office 地址放进 iframe 不会被渲染。
- 文件不存在：返回 `{ kind: 'missing' }`，不要 throw。界面只有说明，没有重试。
- 类型无法预览（Office、Excel、压缩包、HTML）：返回 `{ kind: 'unsupported' }`。若同时传了 `onOpenFileExternally`，界面给出「在外部打开」，由宿主真正打开。

头部右侧有下载按钮：`markdown` / `code` 按正文生成文件，`image` / `embed` 抓取 `url` 落盘（跨域取不到时退回新窗口打开，交给浏览器自行下载）。文件名优先取 `absolutePath`，没有时取链接的文件名；`markdown` 落盘时若扩展名不是 `.md`/`.markdown`/`.txt`，自动补 `.md`，避免「表格文本存成 .xlsx」这类内容/扩展名错配。`body.previewOnly` 标记的 `markdown` / `code` 是宿主的预览渲染（如 xlsx 转表格）而非文件本体，不出下载按钮——真文件走「在外部打开」。`missing` 和 `unsupported` 没有下载——数据不在面板手里，要走「在外部打开」。
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
- embed：iframe 吃满内容区，滚动交给浏览器原生查看器；面板不做工具栏、页码和缩略图。

不做：Office、Excel、把 `.html` 文件当成预览页打开、多标签、文件变更自动刷新、悬停缩略图。PDF 走 `embed` 用原生查看器，面板自己不做分页。回复里的 `html` 围栏另见「回复里的 HTML」。

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
7. 若接了会话列表：新建后正文是空的；再从列表点回原来的会话，之前的轮次还在。
8. 若页面有 Header AI 输入条：关掉面板后，点打开对话，同一会话回来，输入框里没发出去的字还留着。
9. 若页面接了 bloom 外壳：回复进行中四角泛金光、环境光隐去，结束后回到四色；过程行的开合箭头折叠时朝右、展开时朝下。

## 看得到但没效果

- 链接点了没预览：没传 `loadFilePreview`，或地址被当成普通 URL。
- 预览一直在转：宿主没 resolve，或没理会 `signal`。
- 停止后字还在跳：宿主的追加循环没被作废，`streaming` 仍是 `true`。
- 运行条没有时长：这一轮已经没有 `streaming` / `running` 过程行。强制把状态改成 `running` 不会复活旧轮次的时钟。
- 图卡不出现：`json` 围栏还没闭合，或 JSON 里有函数、注释。
- HTML 还是一坨代码：围栏还没闭合，或看的不是回复末尾。闭合后应出现 Interactive HTML。
- 操作条离正文很远：宿主样式覆盖了 `--orb-omph-actions-gap` 或 `.orb-omph-turn-actions`。
- 关掉面板后没有地方打开：Header 没传 `onOpenPanel`，或 `panelOpen` 仍是 true。这个按钮不在 `OMPHPanel` 里面。
- 面板头部没有新建或列表：没传 `onNewConversation` 或 `onSelectConversation`。
- 点了新建还是旧对话：宿主没有把 `turns` 换成空数组，或没有换 `activeConversationId`。
- 接了外壳但工作态不泛金：面板不在 `bloom-card` 里，`:has()` 联不上 `data-status`；或宿主没把状态写进面板，也没手动加 `.is-working`。
- 泛光看不到了：宿主样式把面板背景改成实心，或自己又给面板加了一层半透明底。
- 预览里点了下载没反应：Electron 宿主没处理 `session.on('will-download')`，`<a download>` 会被静默吞掉。宿主补事件处理，或用 `onOpenFileExternally` 自带保存框的下载。
