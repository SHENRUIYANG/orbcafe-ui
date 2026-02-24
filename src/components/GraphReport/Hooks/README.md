# GraphReport Hooks

`GraphReport` 的 Hook 层用于把“原始明细数据”标准化成可视化面板可直接消费的数据模型（KPI + Charts + Data Body）。

## Hooks

| Hook | 说明 |
| --- | --- |
| `useGraphReport` | 传入行数据与字段映射配置，返回 `GraphReportModel`，可直接渲染 `CGraphReport`。 |
| `useGraphChartData` | 标准化图表数据（排序、饼图百分比回填等）。 |
| `useGoogleMapEmbedUrl` | 根据 `apiKey + query` 生成 Google 地图 embed URL。 |
| `useAmapEmbedUrl` | 根据关键词或坐标生成 AMap URL。 |
| `useGraphInteraction` | 统一管理图表联动过滤状态（Primary/Secondary/Status）。 |

---

## useGraphReport

### Usage

```tsx
import { useGraphReport, CGraphReport } from 'orbcafe-ui';

const { model } = useGraphReport({
  rows,
  config: {
    title: 'Project Graphic Report',
    topN: 5,
    fieldMapping: {
      primaryDimension: 'Client',
      secondaryDimension: 'Consultant',
      status: 'Status',
      reportHours: 'Report_Hour',
      billableHours: 'Billable_Hour',
      amount: 'Amount',
    },
  },
});

<CGraphReport open={open} onClose={close} model={model} />
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `rows` | `Record<string, unknown>[]` | Yes | 明细数据行。 |
| `config` | `GraphReportConfig` | No | 图表标题、TopN、字段映射、异常状态定义等。 |

### Return

| Name | Type | Description |
| --- | --- | --- |
| `fieldMapping` | `GraphReportFieldMapping` | 解析后的字段映射（包含默认推断结果）。 |
| `model` | `GraphReportModel` | 结构化后的图表面板模型（KPI、图表数据、数据表体）。 |

---

## useGraphChartData

### Usage

```tsx
import { useGraphChartData, CLineChart, CComboChart } from 'orbcafe-ui';

const chartData = useGraphChartData({
  bars: [{ name: 'A', value: 12 }, { name: 'B', value: 8 }],
  lines: [{ name: 'Jan', value: 22 }, { name: 'Feb', value: 30 }],
  combos: [{ name: 'P1', barValue: 40, lineValue: 78 }],
  pies: [{ name: 'active', value: 12, percent: 0 }],
});

<CLineChart data={chartData.lines} />;
<CComboChart data={chartData.combos} />;
```

### Return

| Name | Type | Description |
| --- | --- | --- |
| `bars` | `GraphBarDatum[]` | 默认按 value 降序。 |
| `lines` | `GraphLineDatum[]` | 原顺序返回。 |
| `combos` | `GraphComboDatum[]` | 原顺序返回。 |
| `heatmap` | `GraphHeatmapDatum[]` | 原顺序返回。 |
| `pies` | `GraphPieDatum[]` | 自动按 value 计算/回填 `percent`。 |
| `waterfalls` | `GraphWaterfallDatum[]` | 原顺序返回。 |

---

## 地图 URL Hooks

### Usage

```tsx
import { useGoogleMapEmbedUrl, useAmapEmbedUrl, CGoogleMapChart, CAmapChart } from 'orbcafe-ui';

const googleUrl = useGoogleMapEmbedUrl({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
  query: 'Berlin Central Station',
});

const amapUrl = useAmapEmbedUrl({
  keyword: '上海虹桥火车站',
});

<CGoogleMapChart embedUrl={googleUrl} />;
<CAmapChart embedUrl={amapUrl} />;
```

### Notes

- 地图组件建议由业务项目注入 API key，不在组件库内写死。
- 若 iframe 被目标站点策略拦截，组件会提供外链入口作为兜底。

---

## useGraphInteraction

### Usage

```tsx
import { useGraphInteraction } from 'orbcafe-ui';

const graphInteraction = useGraphInteraction();

graphInteraction.setFilter('primaryDimension', 'Client A');
graphInteraction.clearFilter('primaryDimension');
graphInteraction.clearAll();
```

### Return

| Name | Type | Description |
| --- | --- | --- |
| `filters` | `GraphReportInteractionState` | 当前联动过滤状态。 |
| `setFilter` | `(field, value) => void` | 设置/切换某个过滤值。再次点击同值会取消。 |
| `clearFilter` | `(field) => void` | 清除单个过滤条件。 |
| `clearAll` | `() => void` | 清空全部联动过滤。 |
| `applyRows` | `(rows, fieldMapping) => rows` | 按当前联动状态过滤数据行。 |

---

## Notes

- `fieldMapping` 未显式配置时，Hook 会基于常见字段名自动推断（如 `Client / Person / Status / Amount`）。
- 数值字段支持字符串数值，会自动转换为 `number`。
- `statusFlagValues` 可定义哪些状态视为“Flagged”。默认：`flag / flagged / warning / risk`。
