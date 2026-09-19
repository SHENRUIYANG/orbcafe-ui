# Metric Chart Card Selection

## Decision tree

- One headline number with an optional comparison or coverage value:
  - `CMetricChartCard chartType="metric"`
- Two-state completion or ratio:
  - `CMetricChartCard chartType="progress"`
- Compare categories with labels users need to read:
  - `bar` for long labels or many categories
  - `column` for a few short labels
- Show an ordered sequence or time trend:
  - `line`
- Show part-to-whole composition:
  - `donut` by default when the card needs a calmer center area
  - `pie` when the composition itself is the focus
- Show a value across an index without a connected trend:
  - `scatter`
- Show value plus a second measure:
  - `bubble` with `secondaryValue`
- Provide a readable, accessible fallback:
  - `list`

## Card grid defaults

- Start with a CSS grid using `repeat(auto-fit, minmax(280px, 1fr))`.
- Keep titles short and put filter context in `subtitle`.
- Use one card per business dimension; do not mix unrelated units in the same card.
- Use the same formatter and semantic value labels across cards in a set.
- Set `maxItems` when a card can receive an unbounded result set.

## When another module is a better fit

- Full graph dialog, drilldown detail, or graph-report interaction: `orbcafe-graph-detail-ai`.
- Drag dimensions, measures, presets, or pivot analysis: `orbcafe-pivot-ainav`.
- Dense rows, filters, pagination, variants, or layouts: `orbcafe-stdreport-workflow`.
- Store/catalog cards with descriptions and detail/download actions: `orbcafe-cardpage-workflow`.
