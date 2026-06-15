# ORBCAFE UI Examples

This page is the GitHub walkthrough for the official Next.js examples app. The examples are the visual and behavioral baseline for ORBCAFE UI integrations.

## Run Locally

```bash
npm run build

cd examples
npm install
npm run dev
```

Open `http://localhost:3000`.

## Screenshot Assets

Screenshots live under `docs/images/examples/`. Save manual captures with these exact file names so this page renders them directly on GitHub Pages.

| Route | Target screenshot |
| --- | --- |
| `/` | `docs/images/examples/home.png` |
| `/std-report` | `docs/images/examples/std-report.png` |
| `/planning` | `docs/images/examples/planning.png` |
| `/kanban` | `docs/images/examples/kanban.png` |
| `/pivot-table` | `docs/images/examples/pivot-table.png` |
| `/detail-info/ID-1` | `docs/images/examples/detail-info.png` |
| `/pad` | `docs/images/examples/pad.png` |
| `/chat` | `docs/images/examples/chat.png` |
| `/copilot` | `docs/images/examples/copilot.png` |
| `/aipanel` | `docs/images/examples/aipanel.png` |
| `/ai-nav` | `docs/images/examples/ai-nav.png` |

Capture from the running examples app with a 1440 x 1100 viewport when possible. The command used for the first committed home screenshot was:

```bash
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --headless=new --disable-gpu --no-first-run --no-default-browser-check --user-data-dir=/tmp/orbcafe-docs-chrome --window-size=1440,1100 --screenshot=docs/images/examples/home.png http://localhost:3000/
```

## `/` Home

![Home example](images/examples/home.png)

The home page demonstrates the authentication entry experience for the examples workspace. It shows the ORBCAFE brand panel, demo credentials, remembered sign-in state, and footer navigation into report, planning, and agent UI areas.

Key APIs:

- `CAuthPage`
- `useAuthPage`
- `AuthMode`

Source:

- `examples/app/page.tsx`
- `examples/app/_components/AuthExampleClient.tsx`

## `/std-report`

![Standard report example](images/examples/std-report.png)

The standard report example is the most important desktop business page. It combines the app shell, smart filter bar, report table, persisted variants/layouts, quick create/edit/delete behavior, i18n, and the SAP-style value help field.

Highlights:

- `useStandardReport` orchestrates filter state, table state, data fetching, and page props.
- `CStandardPage` renders the integrated filter + table page.
- `CSmartFilter` supports `type: 'value-help'` and `isValueHelp: true`.
- The Customer field opens `CValueHelp` from the filter bar; click the search button or press `F4`.
- Single value help selection writes an `equals` filter; multiple selection writes `anyOf`.
- The example keeps business values stable and localizes labels separately.

Key APIs:

- `CAppPageLayout`
- `CStandardPage`
- `CSmartFilter`
- `CTable`
- `CValueHelp`
- `useStandardReport`

Source:

- `examples/app/std-report/page.tsx`
- `examples/app/_components/StdReportExampleClient.tsx`

## `/planning`

![Planning Gantt example](images/examples/planning.png)

The planning example shows the production-planning surface with a table pane and Gantt timeline pane. It is deliberately configured with many columns so horizontal overflow does not break the equal split behavior.

Highlights:

- Page-size selector appears at the left of the table toolbar, replacing the previous table title position.
- The split button toggles table/timeline panes to 50% / 50%.
- Users can still drag the divider manually after toggling.
- Wide columns stay scrollable inside the table pane and do not prevent the 50/50 layout.
- Row reorder is enabled where task records allow it.

Key APIs:

- `CPlanningLayout`
- `CPlanningGantt`
- `usePlanningLayout`
- `usePlanningGantt`
- `PlanningGanttColumn`
- `PlanningTaskRecord`

Source:

- `examples/app/planning/page.tsx`
- `examples/app/_components/PlanningExampleClient.tsx`

## `/kanban`

![Kanban example](images/examples/kanban.png)

The Kanban example demonstrates bucket definitions, card records, drag/drop movement, WIP limits, workflow metrics, and navigation from a card into the standard detail page.

Highlights:

- `useKanbanBoard` owns controlled board state.
- `CKanbanBoard` renders buckets and cards.
- `onCardMove` gives the moved card, target bucket, and full model.
- Card clicks can route to `CDetailInfoPage` with source context.

Key APIs:

- `CKanbanBoard`
- `CKanbanBucket`
- `CKanbanCard`
- `useKanbanBoard`

Source:

- `examples/app/kanban/page.tsx`
- `examples/app/_components/KanbanExampleClient.tsx`

## `/pivot-table`

![Pivot table example](images/examples/pivot-table.png)

The pivot example is the analytics workbench. It includes dimensions, measures, aggregations, filters, chart companion views, and local preset persistence.

Highlights:

- Drag fields into rows, columns, filters, and values.
- Configure aggregations such as sum and average.
- Save, load, and delete presets.
- Use stable field IDs and formatter functions for display.

Key APIs:

- `CPivotTable`
- `usePivotTable`
- `PivotChartPanel`
- `PivotFieldDefinition`
- `PivotTablePreset`

Source:

- `examples/app/pivot-table/page.tsx`
- `examples/app/_components/PivotTableExampleClient.tsx`

## `/detail-info/ID-1`

![Detail info example](images/examples/detail-info.png)

The detail page example is the standard drilldown target for reports and Kanban cards. It combines top-level sections, nested tabs, a related records table, local search, and AI fallback.

Highlights:

- `CDetailInfoPage` renders the page shell, close action, sections, tabs, and related table.
- Fields support React values plus searchable text.
- AI fallback can return markdown when local field search does not answer the query.
- The same detail page can show source context when opened from Kanban.

Key APIs:

- `CDetailInfoPage`
- `useDetailInfo`
- `CTable`

Source:

- `examples/app/detail-info/[id]/page.tsx`
- `examples/app/detail-info/[id]/DetailInfoExampleClient.tsx`

## `/pad`

![Pad example](images/examples/pad.png)

The Pad example is a touch-first warehouse workload. It keeps the enterprise report model but adapts density, hit targets, and workflows for tablet use.

Highlights:

- Workload navigation groups receiving, picking, packing, and dispatch tasks.
- `PTable` presents touch-friendly table/card data with filters.
- `PNumericKeypad` supports controlled numeric entry.
- `PBarcodeScanner` prefers the browser `BarcodeDetector` API and offers a manual fallback.
- `PSmartFilter` can reuse value help-style fields when pad filters need master data lookup.

Key APIs:

- `PAppPageLayout`
- `PWorkloadNav`
- `PTable`
- `PSmartFilter`
- `PNumericKeypad`
- `PBarcodeScanner`
- `usePadLayout`
- `usePadRecordEditor`

Source:

- `examples/app/pad/page.tsx`
- `examples/app/_components/PadExampleClient.tsx`

## `/chat`

![Chat example](images/examples/chat.png)

The chat example demonstrates the full-page `StdChat` surface with streaming simulation and rich markdown rendering.

Highlights:

- Markdown, tables, code blocks, math, Mermaid, and think blocks.
- Dynamic cards rendered from JSON code blocks.
- `AgentUICardHooks` reports card actions to the host page.
- Streaming is simulated with chunk size and interval props.

Key APIs:

- `StdChat`
- `ChatMessage`
- `AgentUICardHooks`

Source:

- `examples/app/chat/page.tsx`
- `examples/app/chat/ChatExampleClient.tsx`

## `/copilot`

![Copilot example](images/examples/copilot.png)

The copilot example wraps `CopilotChat` in a floating shell owned by the consuming app.

Highlights:

- Floating launch button.
- Draggable panel.
- Manual resize with viewport clamping.
- Corner snapping after drag.
- Chat content remains `CopilotChat`; shell behavior stays app-owned.

Key APIs:

- `CopilotChat`
- `ChatMessage`
- `AgentUICardHooks`

Source:

- `examples/app/copilot/page.tsx`
- `examples/app/copilot/CopilotExampleClient.tsx`

## `/aipanel`

![AI panel example](images/examples/aipanel.png)

The AI panel example is a display-only agent conversation surface for workflow runs, background tasks, or status-driven automation.

Highlights:

- `AgentPanel` status states: idle, pending, running, success, error.
- Header action slot.
- Display-only conversation mode with an external trigger button.

Key APIs:

- `AgentPanel`
- `AgentPanelStatus`
- `ChatMessage`

Source:

- `examples/app/aipanel/page.tsx`
- `examples/app/aipanel/AIPanelExampleClient.tsx`

## `/ai-nav`

![AI navigation example](images/examples/ai-nav.png)

The AI navigation example demonstrates a voice/hotkey provider around an app shell.

Highlights:

- Long-press Space to trigger the voice overlay.
- `useAINav` exposes recording, hotkey, and submitting state.
- Input fields can ignore the global Space hotkey.
- Host callbacks receive partial text, final submission, and error events.

Key APIs:

- `CAINavProvider`
- `useAINav`

Source:

- `examples/app/ai-nav/page.tsx`
- `examples/app/_components/AINavExampleClient.tsx`
