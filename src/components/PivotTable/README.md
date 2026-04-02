# PivotTable

`CPivotTable` 是一个可拖拽配置的透视表组件，支持：

- 行/列/筛选/值 区域拖拽
- 三段式布局：配置区 + 图表区 + 结果表格区
- 图表区与结果表格区独立折叠
- 值字段聚合切换（`sum/count/avg/min/max`）
- 维度字段多选过滤（含搜索、全选/取消全选）
- 内置 `PivotChart` 配套视图，支持 `纵向柱状 / 横向柱状 / 折线 / 散点`
- 多维多度量下自动提供图表维度、主度量、对比度量选择
- preset 持久化（布局 + 过滤 + 图表选择）
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
  initialChart={{
    dimensionFieldId: 'region',
    primaryValueFieldId: 'revenue',
    chartType: 'bar-vertical',
  }}
/>;
```

---

## 2. 图表区默认逻辑

`CPivotTable` 会在配置区与表格区之间自动渲染 `PivotChart`：

- 默认图表维度：优先取 `rows[0]`，如果没有行维度则取 `columns[0]`
- 默认主度量：取 `values[0]`
- 默认对比度量：取 `values` 中第一个不等于主度量的字段；也可以手动清空
- 默认图表类型：`bar-vertical`

行为约束：

- 如果只有单维度单度量，图表直接显示，不需要额外解释
- 如果存在多个维度或多个度量，图表工具栏显示 4 个统一宽度的下拉：
  `Dimension / Measure / Compare measure / Chart type`
- 图表最多展示 1 个维度、2 个度量
- 图表区和表格区可以分别折叠，不互相影响

---

## 3. Hook 驱动（推荐）

目标：`filters/rows/columns/values/chart` 都可通过 Hook 接口控制。

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
  initialChart: {
    dimensionFieldId: 'quarter',
    primaryValueFieldId: 'revenue',
    secondaryValueFieldId: 'profit',
    chartType: 'line',
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

// 示例：控制图表选择
pivot.actions.setChartDimension('quarter');
pivot.actions.setChartPrimaryValue('revenue');
pivot.actions.setChartSecondaryValue('profit');
pivot.actions.setChartType('line');

<CPivotTable rows={dataRows} fields={fields} model={pivot.model} />;
```

---

## 4. `usePivotTable` API

### 4.1 入参

```ts
usePivotTable({
  fields,                        // 必填：字段定义
  initialLayout?,                // 初始 rows/columns/filters/values
  initialChart?,                 // 初始图表选择
  initialFilterSelections?,      // 初始筛选值映射
  initialShowGrandTotal?,        // 默认 true
  initialConfiguratorCollapsed?, // 默认 false
  initialChartCollapsed?,        // 默认 false
  initialTableCollapsed?,        // 默认 false
});
```

### 4.2 返回值

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
- `setChartDimension(fieldId)`
- `setChartPrimaryValue(fieldId)`
- `setChartSecondaryValue(fieldId)`
- `setChartType(chartType)`
- `toggleChart()`
- `toggleTable()`

---

## 5. `CPivotTable` 受控能力

`CPivotTable` 新增 `model?: PivotTableModel`：

- 不传 `model`：组件使用内部状态（uncontrolled）
- 传入 `model`：由外部（通常是 `usePivotTable`）驱动（controlled）

```tsx
<CPivotTable rows={rows} fields={fields} model={pivot.model} />
```

---

## 6. 图表相关类型（常用）

- `PivotFieldDefinition`
- `PivotLayoutConfig`
- `PivotAggregation`
- `PivotChartType`
- `PivotChartConfig`
- `PivotTableModel`
- `PivotValueFieldState`
- `PivotTablePreset`

---

## 7. 图表选择与 preset 持久化

`CPivotTable` 内置 preset 管理能力，可保存：

- `rows / columns / filters / values`
- `filterSelections`
- `showGrandTotal`
- `chart.dimensionFieldId`
- `chart.primaryValueFieldId`
- `chart.secondaryValueFieldId`
- `chart.chartType`

也就是说，用户保存方案后，再次应用会同时恢复透视布局和图表展示方式。

---

## 8. Preset（保存一套透视配置）

`CPivotTable` 内置 preset 管理能力，可保存当前 `rows/columns/filters/values + filterSelections + showGrandTotal + chart`。

```tsx
import { CPivotTable, type PivotTablePreset } from 'orbcafe-ui';

const [presets, setPresets] = useState<PivotTablePreset[]>([]);

<CPivotTable
  rows={rows}
  fields={fields}
  enablePresetManagement
  presets={presets}
  onPresetsChange={setPresets}
/>;
```

可用 props：

- `enablePresetManagement?: boolean` 是否显示 preset 工具栏
- `presets?: PivotTablePreset[]` 受控 preset 列表
- `defaultPresets?: PivotTablePreset[]` 非受控初始 preset
- `onPresetsChange?: (presets) => void` preset 变更回调
- `initialPresetId?: string` 初始化自动应用某个 preset
- `onPresetApplied?: (preset) => void` 应用 preset 时回调

---

## 9. 设计建议

- 页面内需要“保存/恢复布局”时，优先使用 `usePivotTable`，把 `model` 状态持久化到服务端或本地。
- 如果图表是页面分析主视图，建议默认给出 `initialChart`，避免首次进入时落到不合业务语义的维度。
- 对比度量只在业务上确实有意义时再默认设置；否则可以保持为空，让图表更干净。
- 业务上有“外部筛选器联动”时，用 `actions.setFilterSelection(...)` 与外部控件双向同步。
- 如果上传仓库前需要截图或 demo，建议用 `rows[0] + values[0]` 的默认组合，避免一打开就出现过度复杂的图表。

---

## 10. 验收清单

- 拖拽字段后，表格布局与图表维度/度量候选会同步更新
- 多维或多度量时，4 个下拉都能正确切换
- 图表区与表格区可分别折叠
- preset 保存后，重新应用能恢复图表类型与度量选择
- `npm run build` 通过
