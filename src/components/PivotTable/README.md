# PivotTable

`CPivotTable` 是一个可拖拽配置的透视表组件，支持：

- 行/列/筛选/值 区域拖拽
- 值字段聚合切换（`sum/count/avg/min/max`）
- 维度字段多选过滤（含搜索、全选/取消全选）
- 深浅主题适配
- i18n 文案（`en/zh/fr/de/ja/ko`）

---

## 1. 快速使用（内置状态）

```tsx
import { CPivotTable, type PivotFieldDefinition } from 'orbcafe-ui';

const fields: PivotFieldDefinition[] = [
  { id: 'region', label: 'Region', type: 'string' },
  { id: 'quarter', label: 'Quarter', type: 'string' },
  { id: 'revenue', label: 'Revenue', type: 'number' },
];

<CPivotTable
  rows={dataRows}
  fields={fields}
  initialLayout={{
    rows: ['region'],
    columns: ['quarter'],
    values: [{ fieldId: 'revenue', aggregation: 'sum' }],
  }}
/>;
```

---

## 2. Hook 驱动（推荐）

目标：`filters/rows/columns/values` 都可通过 Hook 接口控制。

```tsx
import { CPivotTable, usePivotTable } from 'orbcafe-ui';

const pivot = usePivotTable({
  fields,
  initialLayout: {
    rows: ['region'],
    columns: ['quarter'],
    filters: ['year', 'channel'],
    values: [{ fieldId: 'revenue', aggregation: 'sum' }],
  },
});

// 示例：通过接口直接改布局
pivot.actions.setLayout({
  rows: ['region', 'category'],
  columns: ['quarter'],
  filters: ['year'],
  values: [
    { fieldId: 'revenue', aggregation: 'sum' },
    { fieldId: 'profit', aggregation: 'sum' },
  ],
});

// 示例：通过接口改筛选值
pivot.actions.setFilterSelection('region', ['Europe', 'Asia Pacific']);

// 示例：分别控制 row / column / filter / value
pivot.actions.setRows(['region', 'category']);
pivot.actions.setColumns(['quarter']);
pivot.actions.setFilters(['year', 'channel']);
pivot.actions.setValues([
  { fieldId: 'revenue', aggregation: 'sum' },
  { fieldId: 'profit', aggregation: 'sum' },
]);

<CPivotTable rows={dataRows} fields={fields} model={pivot.model} />;
```

---

## 3. `usePivotTable` API

### 3.1 入参

```ts
usePivotTable({
  fields,                        // 必填：字段定义
  initialLayout?,                // 初始 rows/columns/filters/values
  initialFilterSelections?,      // 初始筛选值映射
  initialShowGrandTotal?,        // 默认 true
  initialConfiguratorCollapsed?, // 默认 false
});
```

### 3.2 返回值

- `model`: 传给 `CPivotTable` 的受控模型
- `actions`: 外部控制动作

`actions` 包含：

- `setRows(rows)`
- `setColumns(columns)`
- `setFilters(filters)`
- `setValues(values)`
- `setLayout(layout)`
- `clearZone('rows' | 'columns' | 'filters' | 'values')`
- `removeFieldFromZone(zone, key)`
- `setAggregationForValue(tokenId, aggregation)`
- `setFilterSelection(fieldId, values)`
- `resetFilterSelections()`
- `toggleGrandTotal()`
- `toggleConfigurator()`

---

## 4. `CPivotTable` 受控能力

`CPivotTable` 新增 `model?: PivotTableModel`：

- 不传 `model`：组件使用内部状态（uncontrolled）
- 传入 `model`：由外部（通常是 `usePivotTable`）驱动（controlled）

```tsx
<CPivotTable rows={rows} fields={fields} model={pivot.model} />
```

---

## 5. 类型（常用）

- `PivotFieldDefinition`
- `PivotLayoutConfig`
- `PivotAggregation`
- `PivotTableModel`
- `PivotValueFieldState`

---

## 6. 设计建议

- 页面内需要“保存/恢复布局”时，优先使用 `usePivotTable`，把 `model` 状态持久化到服务端或本地。
- 业务上有“外部筛选器联动”时，用 `actions.setFilterSelection(...)` 与外部控件双向同步。
