---
name: orbcafe-planning-gantt
description: Build ORBCAFE project-management or production-planning pages with CPlanningLayout/usePlanningLayout (or custom CPlanningGantt/usePlanningGantt), CSmartFilter, CTable-style controls, resizable table/timeline panes, aligned Gantt rows, and drag-reorderable task rows.
---

# ORBCAFE Planning Gantt

## Workflow

1. 先对照 `skills/orbcafe-ui-component-usage/references/module-contracts.md`，确认这是 `Hook-first` 模块。
2. 执行 `skills/orbcafe-ui-component-usage/references/integration-baseline.md`，按 Next.js App Router + 官方 examples 做最小可运行接入。
3. 用 `references/recipes.md` 输出实现骨架。
4. 用 `references/guardrails.md` 检查 SmartFilter 必须在组合中启用、表格横向滚动、Gantt 对齐、分组行高度、行拖拽换序和折叠/拖拽分栏。
5. 输出验收步骤与“没效果”排障；涉及分组时必须说明图表行与表格可见行同步，并检查自定义工具按钮位于标准按钮左侧。

## Canonical Setup

先检查宿主 `package.json`，缺失或版本不兼容时才安装：

```bash
npm install orbcafe-ui @mui/material@^7.3.9 @mui/icons-material@^7.3.9 @mui/x-date-pickers@^8.27.2 @emotion/react@^11.14.0 @emotion/styled@^11.14.1 dayjs@^1.11.20 lucide-react@^0.575.0 tailwind-merge@^3.5.0 clsx@^2.1.1 class-variance-authority@^0.7.1 @radix-ui/react-slot@^1.2.4
```

本仓库联调：

```bash
npm run build
cd examples
npm install
npm run dev
```

参考实现：
- `examples/app/planning/page.tsx`
- `examples/app/_components/PlanningExampleClient.tsx`
- `src/components/Planning/README.md`
- `src/components/Planning/Hooks/README.md`

## Output Contract

0. `Mode`: `Hook-first`.
1. `Chosen module`: Planning Gantt and whether SmartFilter/CTable controls are required.
2. `Minimal implementation`: `usePlanningLayout + CPlanningLayout` first. Use `usePlanningGantt + CSmartFilter + CPlanningGantt` only when custom composition is required.
3. `Data model`: task records with id/title/date/progress/status/owner/workCenter and optional `reorderable`.
4. `Verify`: filtering, scale select, table horizontal scroll, pane resize/collapse, row/bar alignment, drag reorder from both table and timeline panes, grouping alignment when enabled.
5. `Troubleshooting`: at least 3 points covering date validity, width/overflow, row height mismatch, and wrong public imports.

## Examples-Based Experience Summary

- SmartFilter belongs above the table/Gantt card and handles search/filtering, not the selected-task summary.
- `usePlanningLayout` is the default entry and keeps SmartFilter + Gantt together.
- `usePlanningGantt` owns scale, selected task, filters, filtered tasks, and returns both `smartFilterProps` and `planningGanttProps` for advanced composition.
- `CPlanningGantt` owns the split table/timeline surface, timeline scale select, CTable-style column/sort/group controls, row-to-bar alignment, and visible task row drag-reordering.
- Row reordering is enabled by default; use `enableRowReorder={false}` globally or `task.reorderable = false` per task row to lock dragging.
- Custom header tools should use `extraTools`, rendered to the left of built-in planning controls.
- When table width is reduced, the table pane must expose horizontal scroll; the timeline pane keeps its own horizontal range.
- When grouping is enabled, render matching group rows in the Gantt side so the visible table rows stay vertically aligned.
- When grouping is enabled, row drag-reordering should stay within the same group; group header rows are not draggable.
