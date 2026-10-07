# AgentUI usage contract

## Pick the surface

| Surface | State owner / defaults |
| --- | --- |
| `AgentPanel` | Same message contract as StdChat; `showInput=false` by default. `agentStatus` is idle/pending/running/success/error; defaults from `isResponding`. |
| `OMPHPanel` | Host owns `turns`. Incremental `streaming` renders text already appended. `agentStatus` still uses idle/pending/running/success/error. `showInput=false` by default; place `InputArea` outside the panel, or use `StdChat` for a full chat. Pending approval replaces that input with `OMPHApprovalCard` (`allowed-once`, `rejected`, `choice`, or `other`). Closed `html`/`htm` fences in assistant Markdown render in a sandboxed iframe. There is no `onBranch`. File preview is opt-in via `loadFilePreview`. Full rules: [omph-panel.md](omph-panel.md). |
| `StdChat` | `showInput=true`; host owns `messages`, response lifecycle and backend request. `statusLine?: ReactNode` is an optional inline working indicator. |
| `FloatingAgentPanel` | Ready-made floating AgentPanel shell with horizontal drag and left/center/right snap. `anchor/onAnchorChange` or `defaultAnchor`; `width/top/bottom/inset/zIndex` customize placement. No built-in open state, free XY drag or resize handle. |
| `CopilotChat` | Host owns open/close, XY position and resizing; `corner` changes corner styling. `onHeaderPointerDown`, `onCollapse`, `onPlusClick`, `onMicClick` are host callbacks. `onStop` is declared but currently has no rendered stop control. |
| `AIBrowserGlow` | `active=false` by default; viewport 2px edge line. `colors` is a three-string tuple for compatibility, only `colors[0]` is used. |

`messages: ChatMessage[]` uses `{ id: string, type: 'user' | 'assistant', content: string, timestamp: Date, isStreaming?: boolean }`. Deserialize timestamps with `new Date(...)`. `ChatMessage` is a public **type**, not a public React message component.

`onSend(content, files?) => Promise<void>` does not append messages or call a model automatically. The host appends user/assistant messages, handles failures and resets `isResponding` in `finally`. `onMessageStreamingComplete(messageId)` clears that message's `isStreaming`; the built-in streaming effect reveals text already supplied by the host, not a network/SSE transport. Stop must cancel the host request and clear busy/streaming state. `onRegenerate(messageId)` must replace/retry the intended assistant response.

## Metric chart JSON in a reply

Use a complete JSON object alone or a `json` fenced block inside assistant Markdown. No JSX, functions or ReactNode values in JSON. Example payload:

```json
{"type":"metric-chart-card","title":"Materials","chartType":"bar","valueLabel":"Count","data":[{"id":"AX","label":"AX","value":184},{"id":"AY","label":"AY","value":142}]}
```

`MetricChartCardTypeContent` requires `type`, `title`, `data`. Optional fields: `subtitle`, `chartType`, `maxItems`, `showChartTypeControl`, `valueLabel`, `secondaryValueLabel`, `valueSuffix`, `secondaryValueSuffix`. The 10 chart types are `metric`, `progress`, `bar`, `column`, `line`, `pie`, `donut`, `scatter`, `bubble`, `list`. Supply finite numbers and unique stable IDs; fallback normalization is not business validation. React props such as formatters, callbacks and loading nodes are not part of this JSON contract.

## Card event contract

`cardHooks.onCardEvent(event)` receives `{ messageId?, cardType, action, title?, payload?: unknown, rawData?: unknown }`. Narrow `cardType`, `action` and `payload` before use.

| Metric event | Payload |
| --- | --- |
| `action` after item click | `{ item: MetricChartDatum }` |
| `action` after chart switch | `{ chartType: MetricChartType }` |
| `show-data` after data inspection | `{ item: MetricChartDatum, source: 'hover' | 'contextmenu' }` |

The inspector shows the supplied datum; it does not fetch raw business rows. Use a deliberate click to start business navigation. `show-data` can come from hovering, so use it for display/analytics, not automatic business mutations. Other cards expose close/retry/confirm/action/suggestion-click as wired by their renderer; `render` exists in the type union but is not an automatic lifecycle notification.

Use AgentPanel/StdChat/CopilotChat for JSON cards. The package's general-purpose `MarkdownRenderer` is a separate renderer and does not imply this dynamic card protocol. Graph-style `*-chart-card` payloads and SAP manifests are separate formats; SAP cards do not create a live SAP connection.

Verify: `/aipanel` → type `test` → each metric chart renders → click/type events reach host → right-click Show data stays visible after host state updates → hover only fires after stillness. Test close/retry with host callbacks. Sources: `src/components/AgentUI/index.ts`, `layout/*`, `components/cardTypes.ts`, `components/utils/cardParsing.ts`, `components/core/DynamicCardRenderer.tsx`.
