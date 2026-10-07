# Metric chart usage contract

## Data and visual meaning

`CMetricChartCard` requires `title`; `data` defaults to `[]`. Use `MetricChartDatum = { id: string, label: string, value: number, secondaryValue?: number, color?: string }`. IDs are business identity; labels may be localized. Data order is preserved.

| `chartType` | Meaning |
| --- | --- |
| `metric` | Displays the **first** datum, not a sum. Optional second value is a comparison label/value. |
| `progress` | Each nonnegative value divided by the sum; supply done and remaining for a completion ratio. It is not an absolute 0–100 gauge. |
| `bar`, `column` | Category comparison. |
| `line` | Connects values in supplied order; no date parsing or sorting. |
| `scatter` | Category index versus value; not arbitrary numeric X/Y pairs. |
| `bubble` | Category index versus value; optional secondaryValue controls bubble size. |
| `pie`, `donut` | Positive part-to-whole composition; no positive values produces empty state. |
| `list` | Readable label/value fallback, including second values when present. |

Precompute business aggregates and validate numeric values before passing them. The component formats/render data and does not calculate business KPIs, load data or navigate.

## State and events

- Default `chartType='bar'`. A change in the prop synchronizes internal chart state; user selection also updates it locally. `onChartTypeChange(next)` informs the host. Keep a host state value when persisting or coordinating multiple cards.
- `onItemClick(item)` enables click activation. To retain highlight, pass the selected `item.id` as `activeId`; callback alone does not control selected state.
- `showDataDetails=true`, `dataRevealDelayMs=1000`: keep the pointer still on a datum for the delay to inspect it; movement resets the timer. Right-click exposes Show data. `onDataDetails(item, source)` fires when details open, with source `'hover' | 'contextmenu'`.
- The built-in inspector shows this datum's label/value/secondaryValue using the same formatters. It is not a raw-record drilldown. `onDataDetails` notifies the host and does not replace the inspector. `showDataDetails=false` disables both built-in entrypoints and their notification.
- `valueFormatter` / `secondaryValueFormatter`: `(value: number) => string`; `valueLabel` / `secondaryValueLabel` label inspector fields. React formatters are not valid JSON properties in AI replies; use the AgentUI suffix fields there.
- State precedence: `loading` → `error` → empty → chart. `maxItems` limits the initial subset; Show all/Show fewer controls overflow. `chartTypeOptions` is deduplicated; use `chartTypeLabels` for selector labels. Built-in inspector copy is currently English.

## Integration and verification

Use `CMetricChartCard` directly for a page; use `type: 'metric-chart-card'` in an AgentUI response, following [the AgentUI contract](../../orbcafe-agentui-chat/references/contract.md). `/chart-cards` shows the page composition; `/aipanel` with `test` shows response cards.

Verify clicks, keyboard activation where clickable, stillness delay, movement cancellation, right-click, close, host re-render, switching and empty/error/loading. Sources: `src/components/MetricChart/CMetricChartCard.tsx`, `src/components/AgentUI/components/cards/MetricChartCard.tsx`.
