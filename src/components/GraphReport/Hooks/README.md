# GraphReport Hooks

`GraphReport` 的 Hook 层用于把“原始明细数据”标准化成可视化面板可直接消费的数据模型（KPI + Charts + Data Body）。

## Hooks

| Hook | 说明 |
| --- | --- |
| `useGraphReport` | 传入行数据与字段映射配置，返回 `GraphReportModel`，可直接渲染 `CGraphReport`。 |

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

## Notes

- `fieldMapping` 未显式配置时，Hook 会基于常见字段名自动推断（如 `Client / Person / Status / Amount`）。
- 数值字段支持字符串数值，会自动转换为 `number`。
- `statusFlagValues` 可定义哪些状态视为“Flagged”。默认：`flag / flagged / warning / risk`。

