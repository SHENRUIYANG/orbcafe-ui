# Graph, Detail and Agent Settings contract

## GraphReport

Default report entry: `CTable graphReport={{ enabled: true, fieldMapping, interaction: { enabled: true } }}`. `fieldMapping` maps real row keys for primaryDimension, secondaryDimension, status, date, description, reportHours, billableHours and amount. The standard report model has those fixed analytical meanings; do not label arbitrary measures as hours or efficiency.

For a custom dialog: `useGraphReport({ rows: GraphRow[], config? })` builds the model; pass `open`, `onClose`, `model: GraphReportModel`, `tableContent: ReactNode` to `CGraphReport`. `tableContent` is a rendered node, not a rows array. The component does not own open state.

`GraphReportModel = { title, kpis, charts, table }`: kpis include totalRecords/totalReportHours/totalBillableHours/efficiency/totalAmount/flaggedCount. Required charts are billableByPrimary, efficiencyBySecondary, statusDistribution; table contains columns and rows. Prefer the public hook over assembling an incomplete model.

Standalone interaction requires filters, fieldMapping, dimension/status click callbacks and clear callbacks. Recompute the relevant model/table when filters change. `aiAssistant.onSubmit(prompt, { filters, model })` delegates to the host; no LLM backend is bundled. Set `aiAssistant.enabled=false` when no AI path is supplied.

## DetailInfo

Default: `<CDetailInfoPage title={title} sections={sections} tabs={tabs} ai={ai} />`; it already uses `useDetailInfo` internally. Use the hook separately only for a custom detail layout; it does **not** return `pageProps`.

- Section: `{ id, title, fields: DetailInfoField[], columns?: 1 | 2 | 3 }`.
- Field: `{ id, label, value: ReactNode, searchableText?: string }`. For complex display nodes, provide searchableText.
- Tab: `{ id, label, description?, content?, sections?, fields? }`. Arbitrary content nodes are not automatically searched as structured fields.
- Related table: `{ title?, tableProps: Omit<CTableProps, 'filterConfig'> }`.
- `ai.onSubmit(query, { query, hits, activeTabId?, sections, tabs })` returns string/void or a promise. Local field matches take precedence; no match uses AI when enabled/wired.
- `defaultTabId` is initial selection; CDetailInfoPage does not expose controlled `activeTabId` or accept the entire hook result as props.

## CustomizeAgent

Required: `open`, `onClose`, `value: CustomizeAgentSettings`. Settings contain **all six** string fields: baseUrl, apiKey, model, promptLang, analysisPrompt, responsePrompt.

Use `onSaveAll({ settings, analysisTemplateId?, responseTemplateId? }) => void | Promise<void>` to persist the complete state. `analysisTemplateOptions` / `responseTemplateOptions` are `{ id, label }[]`. A dialog save is not an LLM connection test; the host performs storage and backend calls.

Sources: `src/components/GraphReport/types.ts`, `CGraphReport.tsx`, `Hooks/useGraphReport.ts`; `src/components/DetailInfo/types.ts`, `Hooks/useDetailInfo.ts`; `src/components/CustomizeAgent/types.ts`. Verify graph filtering and table context, local search, no-match AI, rejected AI request, settings round-trip.
