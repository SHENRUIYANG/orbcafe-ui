# Planning Gantt Guardrails

- Import only from `orbcafe-ui`; never from `src/components/Planning`.
- Keep SmartFilter outside the Gantt card and use it for search/filtering instead of a selected-task banner.
- Validate `startDate` and `endDate`; bars cannot align predictably when dates are invalid or reversed.
- Preserve fixed row/header heights across the table and timeline panes.
- When CTable grouping is enabled, add matching group rows to the timeline side.
- Keep table horizontal overflow available when the left pane is narrow.
- Use animated width transitions for expand/collapse, and keep the divider draggable.
- Use the scale select for `hour`, `day`, `week`, and `month`; avoid segmented tabs for this control.
