# orbcafe-metric-chart-cards README

## 目标

这个 skill 用于在 ORBCAFE 项目里快速、稳定地实现小型指标卡片和图表卡片。它解决的是“一组同样大小的卡片，展示一个维度的统计结果，并能切换图表或点击联动”的场景，不是完整报表或商店卡片页。

## 一分钟上手

1. 使用 `CMetricChartCard`，不要从私有路径导入。
2. 每条数据先准备稳定的 `id`、展示 `label` 和数值 `value`。
3. 先选择一个能回答业务问题的 `chartType`，再决定是否开放类型切换。
4. 需要联动时传 `onItemClick`，并把选中项的 `id` 回传给 `activeId`。
5. 直接把 `loading`、`error`、`emptyState` 传给卡片，让组件保持统一状态样式。

## 最小代码

```tsx
import { CMetricChartCard, type MetricChartDatum } from 'orbcafe-ui';

const data: MetricChartDatum[] = [
  { id: 'ax', label: 'AX', value: 184 },
  { id: 'ay', label: 'AY', value: 142 },
];

<CMetricChartCard
  title="Classification distribution"
  subtitle="Materials in the current filter"
  data={data}
  chartType="bar"
  onItemClick={(item) => setSelectedId(item.id)}
  activeId={selectedId}
  valueFormatter={(value) => value.toLocaleString()}
/>
```

## 图表类型怎么选

| 业务问题 | `chartType` | 说明 |
| --- | --- | --- |
| 比较分类排名、标签较长 | `bar` | 横向条形，最适合读标签 |
| 比较少量短分类 | `column` | 竖向柱形，适合同屏比较 |
| 查看有顺序的数据变化 | `line` | 适合时间、序列或阶段 |
| 查看构成比例 | `pie` / `donut` | 分类较少时使用，donut 更适合保留卡片中心空间 |
| 查看两个维度的离散位置 | `scatter` | 用 `value` 表示纵向数值 |
| 同时表达数值和第二指标 | `bubble` | `value` 控制位置，`secondaryValue` 控制气泡大小 |
| 用户需要逐项阅读或无障碍兜底 | `list` | 直接展示标签、数值和可选第二指标 |
| 只有一个核心数字 | `metric` | KPI/总数卡片 |
| 展示完成度或两个状态的进度 | `progress` | 适合占比、分类完成度 |

## 组件边界

- `CMetricChartCard` 是 `Component-first`：状态由页面通过 props 和 callbacks 管理。
- `CMetricChartCard` 适合一个维度一张卡；九张卡片可以放进 CSS grid，并使用 `minmax(280px, 1fr)` 保持桌面端可读性。
- `CMetricChartCard` 不负责请求数据、筛选持久化、路由或详情页。点击后由业务层更新查询条件、打开详情或导航。
- 完整图形报表弹窗走 `orbcafe-graph-detail-ai`；透视分析走 `orbcafe-pivot-ainav`；密集表格走 `orbcafe-stdreport-workflow`；商店/目录卡片走 `orbcafe-cardpage-workflow`。

## 官方示例

- `examples/app/_components/ChartCardsExampleClient.tsx`
- `examples/app/chart-cards/page.tsx`
- 运行 `examples` 后打开 `/chart-cards`，从示例菜单进入 `Chart Cards`。

## 常见“没效果”排查

- 页面没有卡片：确认从 `orbcafe-ui` 导入，并先在本地仓库执行 `npm run build`，再启动 `examples`。
- 点击后没有高亮：确认 `onItemClick` 更新了业务状态，并把同一个数据 `id` 传回 `activeId`。
- 类型切换没有保持：受控模式下确认 `chartType` 使用了 state，并在 `onChartTypeChange` 中更新它；不需要受控时可以省略回调。
- 气泡大小没有变化：确认每条数据有有限数值的 `secondaryValue`，并使用 `chartType="bubble"`。
- 空态/错误态样式重复：不要在卡片外再渲染一套状态；使用 `loading`、`error`、`emptyState` props。
- 标签被截断或卡片太高：设置合理的 `maxItems`，不要用大量数据直接塞进一张紧凑卡片。
- 手机页面显示异常：这是 ORBCAFE desktop/Pad 组件，不要通过缩小 viewport 解决，改用 `doushabao-ui`。
