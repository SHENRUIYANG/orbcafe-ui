# Metric Chart Card Recipes

## Minimal component-first card

```tsx
'use client';

import { useState } from 'react';
import { CMetricChartCard, type MetricChartDatum } from 'orbcafe-ui';

const rows: MetricChartDatum[] = [
  { id: 'ax', label: 'AX', value: 184 },
  { id: 'ay', label: 'AY', value: 142 },
];

export function ClassificationCard() {
  const [activeId, setActiveId] = useState<string>();

  return (
    <CMetricChartCard
      title="Classification distribution"
      subtitle="Materials in the current filter"
      data={rows}
      chartType="bar"
      onItemClick={(item) => setActiveId(item.id)}
      activeId={activeId}
      valueFormatter={(value) => value.toLocaleString()}
    />
  );
}
```

## Controlled chart type

Use controlled state when a toolbar, URL, or sibling cards need to own the selected view:

```tsx
const [chartType, setChartType] = useState<MetricChartType>('donut');

<CMetricChartCard
  title="Acquisition type"
  data={data}
  chartType={chartType}
  onChartTypeChange={setChartType}
  chartTypeOptions={['donut', 'bar', 'list']}
/>
```

If the chart type is local to one card, omit `onChartTypeChange` and let the component manage it internally.

## Nine-card dashboard

```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
  <CMetricChartCard title="Total materials" data={total} chartType="metric" showChartTypeControl={false} />
  <CMetricChartCard title="Classification" data={classification} chartType="donut" />
  <CMetricChartCard title="Planning controller" data={controllers} chartType="bar" />
  <CMetricChartCard title="Storage location" data={locations} chartType="column" />
  <CMetricChartCard title="Acquisition type" data={acquisition} chartType="line" />
  <CMetricChartCard title="Strategy group" data={strategies} chartType="scatter" />
  <CMetricChartCard title="Planning group" data={planningGroups} chartType="bubble" />
  <CMetricChartCard title="Product hierarchy" data={products} chartType="list" />
  <CMetricChartCard title="Classification coverage" data={coverage} chartType="progress" />
</div>
```

## Async state

```tsx
<CMetricChartCard
  title="Storage location"
  data={rows}
  loading={query.isLoading}
  error={query.error ? 'Could not load this dimension.' : undefined}
  emptyState="No materials match the current filters."
/>
```

The component resolves states in this order: `loading`, then `error`, then empty data, then the chart. Keep the query lifecycle in the page and pass the current state through.

## Bubble and secondary values

```tsx
const planningGroups: MetricChartDatum[] = [
  { id: 'p1', label: 'PG-01', value: 122, secondaryValue: 94 },
  { id: 'p2', label: 'PG-02', value: 104, secondaryValue: 66 },
];

<CMetricChartCard
  title="Planning group"
  data={planningGroups}
  chartType="bubble"
  valueFormatter={(value) => value.toLocaleString()}
  secondaryValueFormatter={(value) => `${value} k€`}
/>
```
