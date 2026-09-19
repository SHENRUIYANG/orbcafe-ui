# MetricChart

Published copy of `src/components/MetricChart/README.md`.

---

`CMetricChartCard` is a compact ORBIS card for a small, clickable metric dimension. It keeps the card header, chart-type selector, formatting, loading/error/empty states, selection state, and accessible list labels consistent across applications.

```tsx
import { CMetricChartCard } from 'orbcafe-ui';

const data = [
  { id: 'ax', label: 'AX', value: 184 },
  { id: 'ay', label: 'AY', value: 142 },
];

<CMetricChartCard
  title="Classification distribution"
  subtitle="Materials in the current filter"
  data={data}
  chartType="bar"
  onChartTypeChange={(nextType) => console.log(nextType)}
  onItemClick={(item) => setFilter({ classification: item.id })}
  activeId={selectedId}
  valueFormatter={(value) => value.toLocaleString()}
/>;
```

Supported `chartType` values are `bar`, `column`, `line`, `pie`, `donut`, `scatter`, `bubble`, `list`, `metric`, and `progress`. `secondaryValue` drives bubble size and can be shown in list or metric views. `maxItems` keeps dense cards readable and adds a `Show all` control when more data is available.
