# GraphReport Components

图表组件已按类型拆分，可按需引入。

## Charts

| Component | 说明 |
| --- | --- |
| `CBarChart` | 柱状图（`orientation=horizontal/vertical`）。 |
| `CLineChart` | 折线图。 |
| `CComboChart` | 组合图（柱状 + 折线）。 |
| `CHeatmapChart` | 热力图（二维矩阵）。 |
| `CPieChart` | 饼图/环图。 |
| `CFishboneChart` | 鱼骨图（因果分析）。 |
| `CWaterfallChart` | 瀑布图。 |
| `CGoogleMapChart` | Google Map 嵌入组件。 |
| `CAmapChart` | AMap（高德）嵌入组件。 |

## Shared

| Component | 说明 |
| --- | --- |
| `CChartCard` | 图表卡片容器（标题 + 副标题 + 内容）。 |
| `CGraphCharts` | GraphReport 默认三图布局（水平柱图/垂直柱图/环图）。 |

## Map Helpers

| Helper | 说明 |
| --- | --- |
| `buildGoogleMapEmbedUrl` | 构建 Google Map iframe URL。 |
| `buildAmapEmbedUrl` | 构建 AMap URL（关键词或坐标）。 |
