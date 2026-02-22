# GraphReport

`GraphReport` 是 `StdReport` 的分析扩展层，用于把明细数据转换成：

1. 顶部 KPI 大字指标
2. 图表区（横向柱图、纵向柱图、状态分布）
3. 底部数据表体（复用 `C-Table`）

## 目录结构

```text
src/components/GraphReport/
├── CGraphReport.tsx
├── Components/
│   ├── CGraphKpiCards.tsx
│   └── CGraphCharts.tsx
├── Hooks/
│   ├── useGraphReport.ts
│   └── README.md
├── types.ts
└── index.ts
```

## 设计目标

- 与业务项目解耦，不依赖特定字段命名。
- 通过 `useGraphReport` 做字段映射和指标计算。
- 由 `CTable` Toolbar 按钮触发打开，实现与 `StdReport` 的自然衔接。
- 图形报表不单独维护表格组件，底部数据区统一复用 `StdReport/CTable`。
