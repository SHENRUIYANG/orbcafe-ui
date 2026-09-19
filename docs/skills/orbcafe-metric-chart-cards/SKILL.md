---
name: orbcafe-metric-chart-cards
description: Build compact ORBIS metric and chart card grids with CMetricChartCard, stable metric data, chart-type switching, selection callbacks, and loading/empty/error states. Use for KPI cards, dashboard dimension cards, small bar/column/line/pie/donut/scatter/bubble charts, accessible list fallbacks, or chart cards that render but do not switch or report selection.
---

# ORBCAFE Metric Chart Cards

详细的组件选择、代码配方和排障说明见：`skills/orbcafe-metric-chart-cards/README.md`。

## 这个 Skill 解决什么

用于 ORBCAFE 桌面端或 Pad 页面里的紧凑指标卡片和小型图表卡片。统一处理：

- `CMetricChartCard` 的卡片标题、说明和 ORBIS 视觉
- `bar`、`column`、`line`、`pie`、`donut`、`scatter`、`bubble`、`list`、`metric`、`progress` 视图
- 图表类型切换、条目点击回调和当前条目高亮
- `loading`、`emptyState`、`error`、数据过多时的 `maxItems`
- 数值格式化、`secondaryValue`、键盘可操作性和列表兜底

不要把这个 skill 用于完整图形报表弹窗、透视分析、带筛选/分页/变体的标准报表，或商店/目录卡片页；这些场景分别进入 Graph/Detail、Pivot、StdReport 或 CardPage skill。

## 何时必须用这个 Skill

- 用户说“指标卡”“KPI 卡片”“统计卡片”“图表卡片”“dashboard cards”或 `CMetricChartCard`。
- 需要在一页展示多个同高度的常规小图表，并保持 ORBIS 风格。
- 需要在 bar/column/line/pie/donut/scatter/bubble/list 之间切换。
- 需要点击图表条目驱动筛选、详情或联动状态。
- 卡片已经显示，但类型切换、条目点击、空态或错误态没有效果。

## 工作流（必须执行）

1. 对照 `skills/orbcafe-ui-component-usage/references/module-contracts.md`，确认这是 `Component-first` 模块。
2. 读取 `references/component-selection.md`，根据数据问题选择图表类型，不要凭视觉随意选择。
3. 参考 `references/recipes.md` 输出最小可运行代码，只从 `orbcafe-ui` 包入口导入。
4. 参考 `references/guardrails.md` 检查数据稳定键、受控状态、状态优先级、可访问性和卡片网格尺寸。
5. 执行 `skills/orbcafe-ui-component-usage/references/integration-baseline.md`：默认按 Next.js App Router + 官方 examples 接入；非 Next 项目先标记为偏离基线，不要静默改成其他范式。
6. 给出启动、切换、点击联动和 loading/empty/error 的验收步骤，以及至少 3 条“看得到但没效果”排障项。

## Canonical Setup

先检查宿主 `package.json`，缺失或版本不兼容时才安装：

```bash
npm install orbcafe-ui
# ORBCAFE UI v2 是 MUI-free；不要安装 @mui/*、@emotion/*、lucide-react。
# 组件使用 Tailwind utility classes，宿主需要 Tailwind v4：
npm install -D tailwindcss @tailwindcss/postcss
```

本仓库联调：

```bash
npm run build
cd examples
npm install
npm run dev
```

优先参考实现：

- `examples/app/_components/ChartCardsExampleClient.tsx`
- `examples/app/chart-cards/page.tsx`
- `src/components/MetricChart/README.md`

## 输出规范（对用户回复必须包含）

1. `Mode`: `Component-first`。
2. `Decision`: 说明为什么选择 `CMetricChartCard`，并写出每张卡的 `chartType`。
3. `Minimal code`: 可直接粘贴运行，且只从 `orbcafe-ui` 导入。
4. `Data shape`: 至少展示 `{ id, label, value }`；需要气泡或第二指标时再加 `secondaryValue`。
5. `State shape`: `chartType`、可选 `onChartTypeChange`、`onItemClick`、`activeId`，以及数据加载状态。
6. `Verify`: 至少覆盖页面可见、类型切换、条目点击回调和 loading/empty/error 状态。
7. `Troubleshooting`: 至少覆盖错误导入路径、非稳定 `id`、没有回传 `activeId`、没有把 loading/error/empty 传给卡片、没有先构建本地包。

## 关键约束（默认遵守）

- 消费项目只写 `import { CMetricChartCard, type MetricChartDatum } from 'orbcafe-ui'`，不要导入 `src/components/MetricChart/*`。
- 每条数据必须有稳定的业务 `id`、展示用 `label` 和有限数值 `value`；不要用本地化文本作为 `id`。
- `onChartTypeChange` 和 `onItemClick` 是回调；需要外部保存状态时，将当前 `chartType`、`activeId` 和数据放在业务层，而不是依赖组件内部状态。
- `activeId` 必须对应数据项 `id`；点击回调里更新业务筛选或详情状态后，把相同 id 回传给卡片以显示高亮。
- 状态优先级为 `loading` → `error` → 空数据 → 图表；不要在业务层同时渲染重复的 loading/empty/error 区块。
- 数据量较大时设置 `maxItems`；需要查看完整数据时使用卡片提供的 `Show all`，不要让卡片无限增高。
- `list` 是可访问的表格化兜底视图；当用户需要读数或辅助技术支持时，保留它作为可选类型。
- 这是紧凑的 desktop/Pad 组件；手机、小屏或移动应用改用 `doushabao-ui`，不缩小 ORBCAFE viewport 做验证。
- 不要为这些小图表再引入 ECharts、Chart.js 等外部图表库；组件已经提供稳定的 SVG/CSS 视图和统一状态。
