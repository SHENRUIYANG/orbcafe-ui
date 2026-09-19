# Metric Chart Card Guardrails

## Public API

- Import `CMetricChartCard`, `METRIC_CHART_TYPES`, and the exported types from `orbcafe-ui` only.
- Do not import private files under `src/components/MetricChart` from a consuming app.
- Keep the host on the ORBCAFE integration baseline: Next.js App Router examples, Tailwind v4, `OrbisModeProvider`, and `GlobalMessage` where the page shell requires them.

## Data and identity

- Every datum needs a stable business `id`, a human-readable `label`, and a finite numeric `value`.
- Keep IDs independent of locale and label wording.
- Use `secondaryValue` only for a meaningful second measure; do not encode multiple values into the label.
- Use `color` sparingly for a business-defined semantic color. Let the component palette handle ordinary categories.

## State and callbacks

- `CMetricChartCard` is component-first; the page owns query state and selection state.
- For controlled chart selection, update `chartType` in `onChartTypeChange`.
- For item selection, update the business filter/detail state in `onItemClick` and pass the selected datum ID back through `activeId`.
- Do not expect the component to fetch data, persist filters, navigate routes, or open a detail page.
- Pass only one source of truth for loading, error, and empty states. The component renders them in `loading → error → empty → chart` order.

## Layout and accessibility

- Use a responsive desktop grid with a minimum card width around `280px`; keep card titles and subtitles concise.
- Set `maxItems` for potentially large result sets. The component provides `Show all` rather than allowing uncontrolled card growth.
- Keep `list` available when users need exact labels/values or when a non-visual fallback matters.
- Preserve the built-in buttons, roles, keyboard activation, and status announcements; do not replace chart marks with non-semantic decorative SVG.

## Visual and dependency boundaries

- Reuse ORBIS tokens and the component's built-in palette; do not introduce one-off gradients, heavy shadows, or unrelated chart styling.
- Do not add ECharts, Chart.js, or another chart dependency for the supported card types.
- Do not use this skill for phone/small-screen/mobile UI; route those requests to `doushabao-ui`.

## Anti-patterns

- Passing localized labels as IDs, causing active selection to break after a locale change.
- Updating a selected item without passing its ID back to `activeId`, so the callback fires but the card never highlights.
- Mixing percentages, currency, and counts in one chart without explicit `valueLabel`/formatters.
- Rendering a second external loading or empty panel beside the card, producing duplicate states.
- Using `CMetricChartCard` for dense paginated tables or full graph analysis instead of the matching module skill.
