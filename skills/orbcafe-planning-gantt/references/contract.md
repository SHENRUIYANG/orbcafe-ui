# Planning usage contract

## Entry and data

`usePlanningLayout(options)` → `<CPlanningLayout {...planning.layoutProps} />` is the default. The layoutProps contain filterProps and ganttProps. Advanced `usePlanningGantt` returns smartFilterProps/planningGanttProps; do not interchange these names.

Required `tasks: PlanningTaskRecord[]`: `{ id, title, startDate, endDate }` with valid ISO-like date strings and end after start. Optional code/progress/status/owner/project/workCenter/priority/dependencyIds/color/reorderable/children. `owner` is `{ name, avatarSrc?, initials? }`; progress is a percentage. `children` encodes hierarchy; keep IDs unique throughout it.

Columns are `{ id, label, width?, render?(task) }`, not the CTable `render(value,row)` signature. `scale` is hour/day/week/month. The host supplies dates and planning logic; row reorder does not reschedule dates or enforce dependencies.

## State and callbacks

- Hook owns scale, selectedTaskId, filters and derived task ordering; initial options are defaultScale/defaultSelectedTaskId/initialFilters. Supply appId/tableKey for a shared filter/table persistence namespace.
- `onTaskSelect(task)` returns the full task. `onTaskReorder(orderedTasks, { activeTask, targetTask })` returns reordered data; persist that explicitly when required. Only eligible rows within the same group reorder; enableRowReorder=false or task.reorderable=false disables it.
- `onPageChange(page)` uses a zero-based page and `onRowsPerPageChange(size)` receives a number; -1 means all. Hook options can accept controlled paging callbacks/count for custom data loading.
- Add custom tools to **ganttProps.extraTools** (or directly CPlanningGantt.extraTools). `bodyHeight` controls viewport height. Horizontal table/timeline panes retain their own scroll and share row alignment.
- `layoutVariant`, `onLayoutIdChange(layoutId)`, `onLayoutSave(layout)` are layout linkage; filterAppId/filterTableKey are deprecated compatibility options.
- `subtitle` and `summaryItems` are declared in CPlanningGanttProps but currently not rendered by CPlanningGantt; do not promise those visual features from the type alone.

Sources: `src/components/Planning/types.ts`, `Hooks/usePlanningGantt.ts`, `Hooks/usePlanningLayout.ts`, `CPlanningGantt.tsx`. Verify filter effects on both panes, selection, scale, same-group reorder/locks, sizing and layout reload. Exact persistence service semantics follow StdReport.
