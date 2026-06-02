# Planning Gantt Guardrails

- Import only from `orbcafe-ui`; never from `src/components/Planning`.
- Prefer `CPlanningLayout` as the default entry so SmartFilter and Gantt stay bundled.
- If using `CPlanningGantt` directly, pair it with `CSmartFilter` in the same page unless user explicitly requests no filter bar.
- Keep SmartFilter outside the Gantt card and use it for search/filtering instead of a selected-task banner.
- Validate `startDate` and `endDate`; bars cannot align predictably when dates are invalid or reversed.
- Preserve fixed row/header heights across the table and timeline panes.
- When CTable grouping is enabled, add matching group rows to the timeline side.
- Support dragging real task rows from both table and timeline panes to swap their visible order.
- Keep row drag-reordering configurable. Use `enableRowReorder={false}` to disable it globally and `PlanningTaskRecord.reorderable = false` to lock specific rows.
- Do not make group header rows draggable. When grouping is active, keep drag-reorder within the same group.
- Keep table horizontal overflow available when the left pane is narrow.
- Use animated width transitions for expand/collapse, and keep the divider draggable.
- Use the scale select for `hour`, `day`, `week`, and `month`; avoid segmented tabs for this control.
- Keep CPlanningGantt built-in controls as the standard right-side button set; place user custom buttons in `extraTools` on their left side.
