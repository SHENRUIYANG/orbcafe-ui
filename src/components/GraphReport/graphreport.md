# GraphReport

`GraphReport` 是 `StdReport` 的分析扩展层，用于把明细数据转换成：

1. 顶部 KPI 大字指标
2. 图表区（已支持多图类型独立组件）
3. 底部数据表体（复用 `C-Table`）

## 目录结构

```text
src/components/GraphReport/
├── CGraphReport.tsx
├── Components/
│   ├── CGraphKpiCards.tsx
│   └── CGraphCharts.tsx
│   ├── charts/
│   │   ├── CBarChart.tsx
│   │   ├── CLineChart.tsx
│   │   ├── CComboChart.tsx
│   │   ├── CHeatmapChart.tsx
│   │   ├── CPieChart.tsx
│   │   ├── CFishboneChart.tsx
│   │   ├── CWaterfallChart.tsx
│   │   ├── CGoogleMapChart.tsx
│   │   └── CAmapChart.tsx
│   ├── embed-GMAP.ts
│   └── embed-AMAP.ts
├── Hooks/
│   ├── useGraphReport.ts
│   ├── useGraphChartData.ts
│   ├── useGraphInteraction.ts
│   └── useMapEmbedUrl.ts
│   └── README.md
├── types.ts
└── index.ts
```

## 设计目标

- 与业务项目解耦，不依赖特定字段命名。
- 通过 `useGraphReport` 做字段映射和指标计算。
- 各图表组件独立封装，支持按需组合与替换。
- 地图组件只处理展示与 embed URL，不承载业务 API 管理。
- 标准 GraphReport 支持图表联动过滤（Primary / Secondary / Status）。
- 顶部 AI 输入区支持语音入口（麦克风）和 Agent 设置弹窗（`CustomizeAgent`）。
- 由 `CTable` Toolbar 按钮触发打开，实现与 `StdReport` 的自然衔接。
- 图形报表不单独维护表格组件，底部数据区统一复用 `StdReport/CTable`。
- `CGraphReport` 支持 `extraCharts` 插槽，可在默认三图后追加任意独立图表组件。
