# orbcafe-planning-gantt README

## 目标

这个 skill 用于在 ORBCAFE 项目里快速、稳定地实现项目管理/生产计划类页面：左侧表格 + 右侧甘特图，共用同一份 `tasks` 数据，支持筛选（含 Value Help/F4）、`appId`/`tableKey` 统一持久化、分栏拖拽与行拖拽换序。

- `usePlanningLayout` + `CPlanningLayout`（Hook-first 默认入口，SmartFilter + Gantt 组合）
- `usePlanningGantt` + `CPlanningGantt`（自定义组合场景）
- `CSmartFilter`（含 `type: 'value-help'` 字段）
- Layout 分栏（表格/时间线）拖拽与折叠
- 任务行拖拽换序

## 一分钟上手

1. 先对照 `skills/orbcafe-ui-component-usage/references/module-contracts.md`，确认这是 `Hook-first` 模块。
2. 执行 `skills/orbcafe-ui-component-usage/references/integration-baseline.md`，按 Next.js + 官方 examples 接入。
3. 用 `references/recipes.md` 的 Recipe 1（Default combo layout）产出实现骨架。
4. 涉及 lookup/F4 时，同时读取 `skills/orbcafe-ui-component-usage/references/value-help.md`。
5. 按 `references/guardrails.md` 检查 SmartFilter 启用、`appId/tableKey` 统一、表格横向滚动、Gantt 对齐、行拖拽换序、分栏折叠/拖拽。
6. 用 examples（`examples/app/planning/page.tsx`）对照验证。

## 场景到组件

- 标准计划页（筛选 + 表格 + 甘特图 + 持久化）：`usePlanningLayout` + `CPlanningLayout`（默认首选）
- 只需要甘特图本体、自己拼装筛选栏：`usePlanningGantt` + `CPlanningGantt` + `CSmartFilter`（进阶组合）
- WorkCenter/Material/Order 等主数据查找筛选：`filterFields` 里用 `type: 'value-help'`，复用 `CValueHelp` + `CSmartFilter` 契约
- 页头自定义按钮：`extraTools`，渲染在内置计划控件左侧
- 任务行只读、禁止拖拽换序：全局 `enableRowReorder={false}` 或单行 `task.reorderable = false`

## 数据契约要点

- 同一份 `tasks: PlanningTaskRecord[]` 同时驱动左侧表格行和右侧甘特条；每条任务必须有合法的 `id`、`title`、`startDate`、`endDate`。
- `startDate`/`endDate` 使用 ISO 字符串，直接决定甘特条的水平位置和长度；`endDate` 必须晚于 `startDate`，否则甘特条会错位或塌陷。
- `columns` 只影响左侧表格展示，不影响甘特条的生成——甘特条只由 `tasks[].startDate/endDate` 决定。
- `appId`/`tableKey` 需要在 SmartFilter variant 与表格/甘特图 layout 之间保持一致；不要使用已废弃的 `filterAppId`/`filterTableKey`。
- 保存顺序：先保存 Layout，再保存 Variant，因为 Variant 通过 `layoutRefs` 引用 Layout。

## 推荐示例

- `examples/app/planning/page.tsx`
- `examples/app/_components/PlanningExampleClient.tsx`

## 常见"没效果"排查

- `tasks[].startDate`/`endDate` 缺失或无效，导致甘特条不显示或显示错位。
- 表格能看到行但甘特图没有对应条：先检查 `startDate`/`endDate`，而不是 `columns` 配置。
- 分组开启后，甘特图行与表格可见行没有对齐：检查分组行是否在两侧同步渲染。
- 行拖拽换序跨越了分组边界：分组开启时，拖拽应被限制在同一分组内，分组头本身不可拖拽。
- Value Help 选中的 key 没有过滤到数据：确认 `getOptionValue` 返回的 key 与任务字段（如 `workCenter`）一致。
- 缩小表格宽度后没有横向滚动：确认表格分栏保留了自身的横向滚动，时间线分栏保留自己的横向范围。
- 自定义工具按钮出现在标准按钮右侧而不是左侧：检查是否使用了 `extraTools`。
