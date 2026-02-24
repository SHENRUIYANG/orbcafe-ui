# GraphReport

图形报表模块（依附于 StdReport 使用）。

## 定位

- GraphReport 不是独立业务容器，通常由 StdReport 的工具栏入口触发。
- 数据输入建议通过 hooks/model 统一传入，内部负责 KPI + 图表 + 表格组合呈现。

## 快速使用

```tsx
import { CGraphReport, CLineChart, CComboChart, CHeatmapChart, CWaterfallChart } from 'orbcafe-ui';
```

## 目录建议

- `Components/`：图表、KPI、容器组件（每种图已独立）
- `Hooks/`：数据映射、图表数据标准化、地图 URL hook

## 图表组件清单

- `CBarChart`（柱状图：横/竖）
- `CLineChart`（折线图）
- `CComboChart`（柱状 + 折线）
- `CHeatmapChart`（热力图）
- `CPieChart`（饼图 / 环图）
- `CFishboneChart`（鱼骨图）
- `CWaterfallChart`（瀑布图）
- `CGoogleMapChart`（Google 地图）
- `CAmapChart`（高德地图）

## 组合使用示例

```tsx
import {
  CChartCard,
  CComboChart,
  CHeatmapChart,
  CWaterfallChart,
  CFishboneChart,
  CGoogleMapChart,
  CAmapChart,
} from 'orbcafe-ui';

<CGraphReport
  open={open}
  onClose={onClose}
  model={model}
  tableContent={table}
  extraCharts={
    <div style={{ display: 'grid', gap: 12 }}>
      <CChartCard title="Billable + Efficiency">
        <CComboChart data={model.charts.comboByPrimary || []} />
      </CChartCard>
      <CChartCard title="Primary x Secondary Heatmap">
        <CHeatmapChart data={model.charts.heatmapPrimarySecondary || []} />
      </CChartCard>
      <CChartCard title="Billable Waterfall">
        <CWaterfallChart data={model.charts.waterfallBillable || []} />
      </CChartCard>
      <CChartCard title="Status Fishbone">
        <CFishboneChart effect="Flagged Cases" branches={model.charts.fishboneStatusCauses || []} />
      </CChartCard>
      <CChartCard title="Google Map">
        <CGoogleMapChart embedUrl={googleMapUrl} />
      </CChartCard>
      <CChartCard title="AMap">
        <CAmapChart keyword="上海虹桥火车站" />
      </CChartCard>
    </div>
  }
/>
```

## 地图组件建议

- 标准 UI 库保留“展示层组件 + URL 构建器”是合适的。
- API key、区域策略（Google / AMap）由业务项目注入。
- 组件层不写死业务账号、服务端密钥或私有网关逻辑。

## 标准联动（GraphReport 内置）

在 `CTable` 里启用 `graphReport` 后，默认支持图表联动过滤：

- 点击「Billable by Dimension」柱图：过滤 `primaryDimension`
- 点击「Efficiency by Person」柱图：过滤 `secondaryDimension`
- 点击「Status Distribution」图例：过滤 `status`
- 顶部会显示过滤 Chips，可单独删除或 `Clear`
- 底部明细表、KPI、所有默认图表会按同一过滤状态同步刷新

```tsx
<CTable
  graphReport={{
    enabled: true,
    interaction: { enabled: true }, // 默认 true，可显式配置
  }}
/>
```

## 顶部 AI 输入区（新增）

GraphReport 顶部支持 AI 对话输入条，可通过 `graphReport.aiAssistant` 配置：

```tsx
<CTable
  graphReport={{
    enabled: true,
    aiAssistant: {
      enabled: true,
      placeholder: 'Ask AI to analyze data, create charts, or find insights...',
      onVoiceInput: () => {
        // start speech input
      },
      onSubmit: async (prompt, context) => {
        console.log(prompt, context.filters, context.model);
      },
      settings: {
        baseUrl: '/llm-api',
        apiKey: '',
        model: 'doubao-lite',
        promptLang: 'zh',
        analysisPrompt: '...',
        responsePrompt: '...',
      },
      analysisTemplateOptions: [
        { id: 'analysis-default', label: 'Default Analysis' },
        { id: 'analysis-strict', label: 'Strict Audit Analysis' },
      ],
      responseTemplateOptions: [
        { id: 'response-default', label: 'Default Response' },
        { id: 'response-exec', label: 'Executive Summary' },
      ],
      onSaveAll: async ({ settings, analysisTemplateId, responseTemplateId }) => {
        // save llm settings + prompts + selected template versions in one request
      },
    },
  }}
/>
```
